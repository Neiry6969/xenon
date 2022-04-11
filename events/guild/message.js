const { prefix } = require('../../config.json');
const profileModel = require('../../models/profileSchema');
const { Collection } = require('discord.js')

const cooldowns = new Map();


module.exports = async(Discord, client, message) => {
    if(!message.content.startsWith(prefix.toLowerCase()) || message.author.bot) return;

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
    
            if(current_time < expiration_time){
                const time_left = (expiration_time - current_time) / 1000;
                
                const embed = {
                    color: '#000000',
                    title: `Slow it down! Don't try to break me!`,
                    description: `Try the command again in **${time_left.toFixed(1)}s**
                    Command Cooldown: \`${command.cooldown.toFixed(1)}s\``,
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
