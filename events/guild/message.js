const { prefix } = require('../../config.json');
const economyModel = require('../../models/economySchema');
const inventoryModel = require('../../models/inventorySchema');
const userModel = require('../../models/userSchema')
const statsModel = require('../../models/statsSchema')

const { Collection, MessageEmbed } = require('discord.js')

const interactionproccesses = require('../../interactionproccesses.json')
const icoodowns = require('../../cooldowns.json')

function calcexpfull(level) {
    if(level < 50) {
        return level * 10 + 100;
    } else if(level >= 50 && level < 500) {
        return level * 25
    } else if(level >= 500 && level < 1000) {
        return level * 50
    } else if(level >= 1000) {
        return level * 100
    }
}

const cooldowns = new Map();

function premiumcooldowncalc(defaultcooldown) {
    if(defaultcooldown <= 5 && defaultcooldown > 2) {
        return defaultcooldown - 2
    } else if(defaultcooldown <= 15) {
        return defaultcooldown - 5
    } else if(defaultcooldown <= 120) {
        return defaultcooldown - 10
    } else {
        return defaultcooldown
    }
}

function time_split(time) {
    if (time < 60) {
      return `${time}s`;
    } else if (time >= 60 && time < 3600) {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes}m ${seconds}s`;
    } else if (time >= 3600 && time < 86400) {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor((time % 3600) % 60);
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (time >= 86400) {
      const days = Math.floor(time / 86400);
      const hours = Math.floor((time % 86400) / 3600);
      const minutes = Math.floor(((time % 86400) % 3600) / 60);
      const seconds = Math.floor(((time % 86400) % 3600) % 60);
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${time}s`;
    }
}


module.exports = async(Discord, client, message) => {
    if(!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;

    const user = message.author;
    const userID = user.id
    let userData;
    try {   
        userData = await economyModel.findOne({ userId: userID });
        if(!userData) {
            let user = await economyModel.create({
                userId: userID,
            });
        
            user.save();

            userData = user;
        }

    } catch (error) {
        console.log(error)
    }

    let profileData;
    try {   
        profileData = await userModel.findOne({ userId: userID });
        if(!profileData) {
            let user = await userModel.create({
                userId: userID,
            });
        
            user.save();

            profileData = user;
        }

    } catch (error) {
        console.log(error)
    }

    let statsData;
    try {   
        statsData = await statsModel.findOne({ userId: userID });
        if(!statsData) {
            let user = await statsModel.create({
                userId: userID,
            });
        
            user.save();

            statsData = user;
        }

    } catch (error) {
        console.log(error)
    }

    let inventoryData;
    try {   
        inventoryData = await inventoryModel.findOne({ userId: userID });
        if(!inventoryData) {
            let inv = await inventoryModel.create({
                userId: userID,
            });
        
            inv.save();

            inventoryData = inv;
        }

    } catch (error) {
        console.log(error)
    }

    if(!interactionproccesses[userID]?.interaction) {
        interactionproccesses[userID] = {
            interaction: false,
            proccessingcoins: false
        }
    }



    if(interactionproccesses[userID].interaction === true || interactionproccesses[userID].proccessingcoins === true) return;

    if(profileData.moderation.blacklist.status === true || profileData.moderation.ban.status === true || userData.interactionproccesses.interaction === true) {
        return;
    }

    
    const message_content = message.content?.toLowerCase()
    const args = message_content.toLowerCase().slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || 
                    client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    if(!client.commands.find(a => a.aliases && a.aliases.includes(cmd)) && !client.commands.get(cmd)) {
        return;
    } 

    async function backgroundupdates() {
        const params = {
            userId: user.id,
        }

        statsData.commands = statsData.commands + 1

        const hasCommand = Object.keys(statsData.commandsObject).includes(command.name);
        if(!hasCommand) {
            statsData.commandsObject[command.name] = 1;
        } else {
            statsData.commandsObject[command.name] = statsData.commandsObject[command.name] + 1;
        }

        const experiencepoints = userData.experiencepoints
        const experiencefull = calcexpfull(userData.level)
        if(experiencepoints >= experiencefull) { 
            userData.level = userData.level + 1
            userData.experiencepoints = experiencepoints - experiencefull
        }

        await statsModel.findOneAndUpdate(params, statsData);
        await economyModel.findOneAndUpdate(params, userData);
    }

    
    async function executecmd() {
        try {

            const commandname = command.name;

            if(command.cooldown > 3600) {
                const params = {
                    userId: userID
                }

                let cooldowntime = userData.cooldowns[commandname]
                if(!userData.cooldowns[commandname]) {
                    cooldowntime = 0
                }

                let cooldown_amount = (command.cooldown) * 1000;
            
                if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
                    if(command.cooldown <= 5 && command.cooldown > 2) {
                        cooldown_amount = (command.cooldown - 2) * 1000
                    } else if(command.cooldown <= 15) {
                        cooldown_amount = (command.cooldown - 5) * 1000
                    } else if(command.cooldown <= 120) {
                        cooldown_amount = (command.cooldown - 10) * 1000
                    } else {
                        cooldown_amount = command.cooldown * 1000
                    }
                }

                const timeleft = new Date(cooldowntime);
                let check = timeleft - Date.now() >= timeleft || timeleft - Date.now() <= 0;

                if(!check) {
                    const time_left = Math.floor((timeleft - Date.now()) / 1000)

                    if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
                        const embed = {
                            color: '#FFC000',
                            title: `You are on cooldown!`,
                            description: `You have **PREMIUM** cooldown\nTry the command again in **${time_split(time_left)}**\nPremium Cooldown: \`${time_split(premiumcooldowncalc(command.cooldown))}\``,
                            author: {
                                name: `${client.user.username}`,
                                icon_url: `${client.user.displayAvatarURL()}`,
                            },
                            timestamp: new Date(),
                        };
            
                        return message.reply({ embeds: [embed] });
                    } else {
                        const embed = {
                            color: '#000000',
                            title: `You are on cooldown!`,
                            description: `You have **DEFAULT** cooldown\nTry the command again in **${time_split(time_left)}**\nDefault Cooldown: \`${time_split(command.cooldown)}\`\npremium Cooldown: \`${time_split(premiumcooldowncalc(command.cooldown))}\``,
                            author: {
                                name: `${client.user.username}`,
                                icon_url: `${client.user.displayAvatarURL()}`,
                            },
                            timestamp: new Date(),
                        };
            
                        return message.reply({ embeds: [embed] });
                    }
                } else {
                    try {
                        userData.cooldowns[commandname] = Date.now() + cooldown_amount;
                        await economyModel.findOneAndUpdate(params, userData);
                        return command.execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData);
                    
                    } catch (error) {
                        message.reply("There was an error running this command.");
                        console.log(error);
                        return;
                    }
                    
                }
            } else {
                backgroundupdates()
                if(!cooldowns.has(command.name)){
                    cooldowns.set(command.name, new Collection());
                }

                let cooldown_amount = (command.cooldown) * 1000;

                if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
                    if(command.cooldown <= 5 && command.cooldown > 2) {
                        cooldown_amount = (command.cooldown - 2) * 1000
                    } else if(command.cooldown <= 15) {
                        cooldown_amount = (command.cooldown - 5) * 1000
                    } else if(command.cooldown <= 120) {
                        cooldown_amount = (command.cooldown - 10) * 1000
                    } else {
                        cooldown_amount = command.cooldown * 1000
                    }
                }
            
                const current_time = Date.now();
                const time_stamps = cooldowns.get(command.name);
            
                if(time_stamps.has(userID)){
                    const expiration_time = time_stamps.get(userID) + cooldown_amount;
            
                    if(current_time < expiration_time) {
                        const time_left = Math.floor((expiration_time - current_time) / 1000);

                        const embed = new MessageEmbed()
                            .setColor('#000000')
                            .setTitle(`You are on cooldown!`)
                            .setDescription(`You have **DEFAULT** cooldown\nTry the command again in **${time_split(time_left)}**\nDefault Cooldown: \`${time_split(command.cooldown)}\`\npremium Cooldown: \`${time_split(premiumcooldowncalc(command.cooldown))}\``)
                            .setAuthor(
                                {
                                    name: `${user.username}#${user.discriminator}`,
                                    iconURL: user.displayAvatarURL(),
                                }
                            )
                            .setTimestamp()
            
                        if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
                            embed
                                .setColor('#FFC000')
                                .setDescription(`You have **PREMIUM** cooldown\nTry the command again in **${time_split(time_left)}**\nPremium Cooldown: \`${time_split(premiumcooldowncalc(command.cooldown))}\``,) 
                        } 

                        return message.reply({ embeds: [embed] });
                    }
                }
            
                time_stamps.set(userID, current_time);
                setTimeout(() => time_stamps.delete(userID), cooldown_amount);
            
                try {
                    return command.execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData);
                    
                } catch (error) {
                    message.reply("There was an error running this command.");
                    console.log(error);
                    return;
                }

            }
        } catch (error) {
            message.reply("There was an error running this command.");
            console.log(error);
            return;
        }
        
    }
    if(args[0]?.toLowerCase() === 'table' || args[0]?.toLowerCase() === 'list') {
        if(
            command.name === 'mine' ||
            command.name === 'hunt' ||
            command.name === 'fish' ||
            command.name === 'harvest' ||
            command.name === 'slots' ||
            command.name === 'gamble'||
            command.name === 'harv' ||
            command.name === 'dig'
        ) {
            try {
                command.execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData);
            } catch (error) {
                message.reply("There was an error running this command.");
                console.log(error);
                return;
            }
        } else {
            return executecmd()
        }
    } else {
        return executecmd()
    }

    

}