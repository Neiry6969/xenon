const { prefix } = require('../../config.json');
const profileModel = require('../../models/profileSchema');
const { Collection } = require('discord.js')

const cooldowns = new Map();

function premiumcooldowncalc(defaultcooldown) {
    if(defaultcooldown <= 5 && defaultcooldown > 2) {
        return defaultcooldown - 2
    } else if(defaultcooldown <= 15) {
        return defaultcooldown - 5
    } else if(defaultcooldown <= 60) {
        return defaultcooldown - 5
    }
}


module.exports = async(Discord, client, message) => {
    if(!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;

    let profileData;
    try {   
        profileData = await profileModel.findOne({ userId: message.author.id });
        if(!profileData) {
            let profile = await profileModel.create({
                userId: message.author.id,
                serverId: message.guild.id,
                coins: 0,
                bank: 0,
                bankspace: 1000,
                expbankspace: 0,
                experiencepoints: 0,
                level: 0,
                dailystreak: 0,
                prestige: 0,
                commands: 0,
                deaths: 0,
                premium: 0,
            });
        
            profile.save();

            profileData = profile;
        }

    } catch (error) {
        console.log(error)
    }
    
    const message_content = message.content?.toLowerCase()
    const args = message_content.toLowerCase().slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || 
                    client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    if(!client.commands.find(a => a.aliases && a.aliases.includes(cmd)) && !client.commands.get(cmd)) {
        return;
    } 

    try {
        if(!cooldowns.has(command.name)){
            cooldowns.set(command.name, new Collection());
        }
    
        const current_time = Date.now();
        const time_stamps = cooldowns.get(command.name);
        let cooldown_amount = (command.cooldown) * 1000;
        
        if(message.guild.id === '852261411136733195' || profileData.premium >= 1) {
            if(command.cooldown <= 5 && command.cooldown > 2) {
                cooldown_amount = (command.cooldown - 2) * 1000
            } else if(command.cooldown <= 15) {
                cooldown_amount = (command.cooldown - 5) * 1000
            } else if(command.cooldown <= 60) {
                cooldown_amount = (command.cooldown - 10) * 1000
            }
        }

    
        //If time_stamps has a key with the author's id then check the expiration time to send a message to a user.
        if(time_stamps.has(message.author.id)){
            const expiration_time = time_stamps.get(message.author.id) + cooldown_amount;

            
            function time_split(time) {
              if(time < 60) {
                return `${time}s`;
              } else if (time <= 60) {
                const minutes = Math.floor(time / 60);
                const seconds = time % 60;
                return `${minutes}m ${seconds}s`;
              } else if (time >= 3600) {
                const hours = Math.floor(time / 3600)
                const minutes = Math.floor((time % 3600) / 60);
                const seconds = Math.floor(time % 3600 % 60);
                return `${hours}h ${minutes}m ${seconds}s`;
              } else if (time <= 86400) {
                const days = Math.floor(time / 86400)
                const hours = Math.floor(time % 86400 / 24)
                const minutes = Math.floor((time % 86400) % 24 / 60);
                const seconds = Math.floor(time % 86400 % 24 % 60 % 60);
                return `${days}d ${hours}h ${minutes}m ${seconds}s`;
              } else if (time >= 604800) {
                const weeks = Math.floor(time / 604800)
                const days = Math.floor((time % 604800) / 24);
                const hours = Math.floor(((time % 604800) % 24) / 60)
                const minutes = Math.floor(((time % 604800) % 24) % 60 / 60)
                const seconds = Math.floor(((time % 604800) % 24) % 60 % 60)
                return `${weeks}w ${days}d ${hours}h ${minutes}m ${seconds}s`;
              } else {
                return `${time}s`;
              }
            }

            if(current_time < expiration_time){
                const time_left = Math.floor((expiration_time - current_time) / 1000);

                if(message.guild.id === '852261411136733195' || profileData.premium >= 1) {
                    const embed = {
                        color: '#FFC000',
                        title: `Slow it down! Don't try to break me!`,
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
                        title: `Slow it down! Don't try to break me!`,
                        description: `You have **DEFAULT** cooldown\nTry the command again in **${time_split(time_left)}**\nDefault Cooldown: \`${time_split(command.cooldown)}\`\npremium Cooldown: \`${time_split(premiumcooldowncalc(command.cooldown))}\``,
                        author: {
                            name: `${client.user.username}`,
                            icon_url: `${client.user.displayAvatarURL()}`,
                        },
                        timestamp: new Date(),
                    };
        
                    return message.reply({ embeds: [embed] });
                }
                
                
            }
        }
    
        //If the author's id is not in time_stamps then add them with the current time.
        time_stamps.set(message.author.id, current_time);
        //Delete the user's id once the cooldown is over.
        setTimeout(() => time_stamps.delete(message.author.id), cooldown_amount);
    } catch (error) {
        message.reply("There was an error running this command.");
        console.log(error);
        return;
    }

    try {
        command.execute(message, args, cmd, client, Discord, profileData);
    } catch (error) {
        message.reply("There was an error running this command.");
        console.log(error);
        return;
    }
}