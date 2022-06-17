const { Permissions, MessageEmbed } = require('discord.js')

const guildModel = require('../models/guildSchema')
const allhelp = require('../data/all_help');

module.exports = {
    name: 'guildconfiguration',
    aliases: ['serverconfig', 'guildconfig'],
    cooldown: 5,
    maxArgs: 0,
    cdmsg: "You are doing it too fast I can't keep up!",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        
        if(!message.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            const errorembed = new MessageEmbed() 
            .setColor('RED')
            .setDescription(`<a:cross:987458395823018044> **You do not have permission to manage the bot settings in** \`${message.guild.name}\`\nYou need the following permissions:\n\`MANAGE_GUILD\``)
            .setFooter({
                text: `guildconfiguration`
            })
            
            const error_msg = await message.reply({ embeds: [errorembed] })

            setTimeout(() => {
                error_msg.delete()
            }, 6969)
    
            return;
        }

        const togglecmdaliases = [
            'togglec',
            'togglecommand'
        ]
        
        if(togglecmdaliases.includes(args[0])) {
            guildModel.findOne({guildId: message.guild.id}, async(err, data) => {
                if(!args[1]) {
                    return message.reply('Specify the command you want to toggle')
                }
                const command = allhelp.find(a => a.command && a.command === args[1]) || 
                    allhelp.find(a => a.aliases && a.aliases.includes(args[1]));
                
                if(!command) {
                    return message.reply(`That command doesn't exist`)
                }

                
                let toggledboolean;

                if(data.disabledcmds[command.command] === true) {
                    data.disabledcmds[command.command] = false;
                    toggledboolean = false;
                } else if(data.disabledcmds[command.command] === false) {
                    data.disabledcmds[command.command] = true;
                    toggledboolean = true;
                } else {
                    data.disabledcmds[command.command] = true;
                    toggledboolean = false;
                }

                await guildModel.findOneAndUpdate({guildId: message.guild.id}, data);

                const embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`<a:checkmark:987475769422934066> **Successfully toggled the command disabled status:**\nAffected Command: \`${command.command}\`\nToggled to: \`${toggledboolean}\``)

                return message.reply({ embeds: [embed] })
                
            })
        } else {
            message.reply('Specify some parameters for `guildconfiguration`')
        }
    }
}