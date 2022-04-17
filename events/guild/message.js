const { prefix } = require('../../config.json');
const profileModel = require('../../models/profileSchema');
const { Collection } = require('discord.js')

const cooldowns = new Map();


module.exports = async(Discord, client, message) => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

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
                commands: 0,
                dailystreak: 0,
                prestige: 0,
                commands: 0,
                deaths: 0,
            });
        
            profile.save();

            const embed = {
                color: '#0000FF',
                title: `Welcome to Xenon`,
                description: `I see a new user, your account has been created!`,
                timestamp: new Date(),
            };
            return message.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.log(error)
    }
   
    const args = message.content.slice(prefix.length).split(/ +/);
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
        const cooldown_amount = (command.cooldown) * 1000;
    
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
                
                const embed = {
                    color: '#000000',
                    title: `Slow it down! Don't try to break me!`,
                    description: `Try the command again in **${time_split(time_left)}**
                    Command Cooldown: \`${time_split(command.cooldown)}\``,
                    author: {
                        name: `${client.user.username}`,
                        icon_url: `${client.user.displayAvatarURL()}`,
                    },
                    timestamp: new Date(),
                };
    
                return message.reply({ embeds: [embed] });
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