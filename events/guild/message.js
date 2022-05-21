const { prefix } = require('../../config.json');
const profileModel = require('../../models/profileSchema');
const inventoryModel = require('../../models/inventorySchema')
const userModel = require('../../models/userSchema')
const { Collection } = require('discord.js')
// const cooldowns = require('../../cooldowns.json')

// const fs = require('fs')


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
    } else if (time >= 86400 && time < 604800) {
        const days = Math.floor(time / 86400);
        const hours = Math.floor((time % 86400) / 24);
        const minutes = Math.floor(((time % 86400) % 24) / 60);
        const seconds = Math.floor((((time % 86400) % 24) % 60) % 60);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (time >= 604800) {
        const weeks = Math.floor(time / 604800);
        const days = Math.floor((time % 604800) / 24);
        const hours = Math.floor(((time % 604800) % 24) / 60);
        const minutes = Math.floor((((time % 604800) % 24) % 60) / 60);
        const seconds = Math.floor((((time % 604800) % 24) % 60) % 60);
        return `${weeks}w ${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
        return `${time}s`;
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
                commands: 1,
                deaths: 0,
                premium: 0,
            });
        
            profile.save();

            profileData = profile;
        }

    } catch (error) {
        console.log(error)
    }

    let userData; 
    try {
        userData = await userModel.findOne({ userId: message.author.id });
        if(!userData) {
            let user = await userModel.create({
                userId: message.author.id,
            });
        
            user.save();

            userData = user;
        }
    } catch (error) {
        console.log(error)
    }

    let inventoryData; 
    try {
        inventoryData = await inventoryModel.findOne({ userId: message.author.id });
        if(!inventoryData) {
            let inventory = await inventoryModel.create({
                userId: message.author.id,
            });
        
            inventory.save();

            inventoryData = inventory;
        }
    } catch (error) {
        console.log(error)
    }

    
    if(userData.blacklisted === true || userData.awaitinginteraction === true) {
        return;
    }

    const message_content = message.content?.toLowerCase()
    const args = message_content.toLowerCase().slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || 
                    client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    if(!client.commands.find(a => a.aliases && a.aliases.includes(cmd)) && !client.commands.get(cmd)) {
        return;
    } else {
        const params_user = {
            userId: message.author.id,
        }

        await profileModel.findOneAndUpdate(
            params_user,
            {
                $inc: {
                    commands: 1,
                },
            },
            {
                upsert: true,
            }
        );

    

        userModel.findOne(params_user, async(err, data) => {
            const hasCommand = Object.keys(data.commands).includes(command.name);
            if(!hasCommand) {
                data.commands[command.name] = 1;
            } else {
                data.commands[command.name] = data.commands[command.name] + 1;
            }

            await userModel.findOneAndUpdate(params_user, data);
        })
    }
    
    async function executecmd() {
        try {
            const experiencepoints = profileData.experiencepoints
            const experiencefull = calcexpfull(profileData.level)

            if(experiencepoints >= experiencefull) {
                
                await profileModel.updateOne(
                    {
                        userId: message.author.id,
                    },
                    {
                        $inc: {
                            experiencepoints: -experiencefull,
                            level: 1,
                        },
                    },
                    {
                        upsert: true,
                    }
                );

                profileData.level = profileData.level + 1
                profileData.experiencepoints = profileData.experiencepoints - experiencefull
            }

            const userID = message.author.id;
            const commandname = command.name;

            const params = {
                userId: userID
            }

            userModel.findOne(params, async(err, data) => {
                let cooldowntime = data.cooldowns[commandname]
                if(!data.cooldowns[commandname]) {
                    cooldowntime = 0
                }

                let cooldown_amount = (command.cooldown) * 1000;
            
                if(message.guild.id === '852261411136733195' || profileData.premium >= 1) {
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
                } else {
                    try {data.cooldowns[commandname] = Date.now() + cooldown_amount;
                    
                        await userModel.findOneAndUpdate(params, data);
                        command.execute(message, args, cmd, client, Discord, profileData, userData);
                        
                    } catch (error) {
                        message.reply("There was an error running this command.");
                        console.log(error);
                        return;
                    }
                    
                }
            })
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
            command.name === 'harv'
        ) {
            try {
                command.execute(message, args, cmd, client, Discord, profileData);
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