const { Permissions, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')

const guildModel = require('../models/guildSchema')
const allhelp = require('../data/all_help');

module.exports = {
    name: 'guildconfiguration',
    aliases: ['serverconfig', 'guildconfig'],
    cooldown: 5,
    maxArgs: 0,
    cdmsg: "You are doing it too fast I can't keep up!",
    async execute(message, args, cmd, client, Discord, userData, togglesData, statsData, profileData) {
        
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

        const configopts = [
            {
                name: 'Toggle Command',
                desc: 'Disable or enable a command.',
                option: 'togglecommand',
                aliases: [
                    'togglec',
                    'tc'
                ],
            },
        ]    

        const configopts_map = configopts.map(v => {
            return `**${v.name}:** \`${v.option}\`\n${v.desc}\nAliases: \`${v.aliases.join("\` \`")}\``
        })
        .join('\n\n')
        const configoption = configopts.find(a => a.option && a.option === args[0]) || 
            configopts.find(a => a.aliases && a.aliases.includes(args[0]));

        try {
            configoption.option
        } catch (error) {
            const embed = new MessageEmbed()
                .setTitle("Guild Configuration Options")
                .setColor("RANDOM")
                .setDescription(`${configopts_map}`)
            
            return message.reply({ embeds: [embed] })
        }
        if(!args[0] || !configoption.option) {
            const embed = new MessageEmbed()
                .setTitle("Guild Configuration Options")
                .setColor("RANDOM")
                .setDescription(`${configopts_map}`)
            
            return message.reply({ embeds: [embed] })

        } else if(configoption.option === 'togglecommand') {
            guildModel.findOne({guildId: message.guild.id}, async(err, data) => {
                const disabledcmds_map = Object.keys(data.disabledcmds)
                    .map(key => {
                        return `${key} ${data.disabledcmds[key] === true ? '<a:cross:987458395823018044>' : '<a:checkmark:987475769422934066>'}`
                    })
                    .sort()

                if(args[1] === 'table' || !args[1]) {
                    const togglelistembed = new MessageEmbed()
                        .setTitle(`Toggled commands in ${message.guild.name}`)
                        .setDescription(`<a:checkmark:987475769422934066> = \`enabled\`, <a:cross:987458395823018044> = \`disabled\`\n\`Specify the command you want to toggle\`\n${disabledcmds_map}`)

                    if(disabledcmds_map.length === 0) {
                        togglelistembed
                            .setDescription(`<a:checkmark:987475769422934066> = \`enabled\`, <a:cross:987458395823018044> = \`disabled\`\n\`Specify the command you want to toggle\`\n\n\`There are no toggled commands in this server\``)
                        return message.reply({ embeds: [togglelistembed] })
                    } else {

                        async function handletogglemenu() {
                            const toggles = Object.values(data.disabledcmds).filter(Boolean);
                            const length = toggles.length;
                            const itemsperpage = 8;
                            
                            let lastpage;
                            if(length % itemsperpage > 0) {
                                lastpage = Math.floor(length / itemsperpage) + 1;
                            } else {
                                lastpage = length / itemsperpage;
                            }
            
                            let page = 1;
                            let display_start = (page - 1) * itemsperpage;
                            let display_end = page * itemsperpage;
                            
                            
                            if(lastpage === 1) {
                                let leftfarbutton = new MessageButton()
                                    .setCustomId('leftfar')
                                    .setLabel('<<')
                                    .setStyle('PRIMARY')
                                    .setDisabled()
                                
                                let leftbutton = new MessageButton()
                                    .setCustomId('left')
                                    .setLabel('<')
                                    .setStyle('PRIMARY')
                                    .setDisabled()
                
                                let rightfarbutton = new MessageButton()
                                    .setCustomId('rightfar')
                                    .setLabel('>>')
                                    .setStyle('PRIMARY')
                                    .setDisabled()
                    
                                let rightbutton = new MessageButton()
                                    .setCustomId('right')
                                    .setLabel('>')
                                    .setStyle('PRIMARY')
                                    .setDisabled()
                
                                let row = new MessageActionRow()
                                    .addComponents(
                                        leftfarbutton,
                                        leftbutton,
                                        rightbutton,
                                        rightfarbutton
                                    );
                    
                                let embed = {
                                    color: 'RANDOM',
                                    title:`Toggled commands in ${message.guild.name}`,
                                    description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                
                                    footer: {
                                        text: `Page: ${page} | ${lastpage}`
                                    }
                                };
            
                                const toggle_msg = await message.channel.send({ embeds: [embed], components: [row] });
                            
                            } else { 
                                
                                let leftfarbutton = new MessageButton()
                                    .setCustomId('leftfar')
                                    .setLabel('<<')
                                    .setStyle('PRIMARY')
                                    .setDisabled()
                                
                                let leftbutton = new MessageButton()
                                    .setCustomId('left')
                                    .setLabel('<')
                                    .setStyle('PRIMARY')
                                    .setDisabled()
            
                                let rightfarbutton = new MessageButton()
                                    .setCustomId('rightfar')
                                    .setLabel('>>')
                                    .setStyle('PRIMARY')
                
                                let rightbutton = new MessageButton()
                                    .setCustomId('right')
                                    .setLabel('>')
                                    .setStyle('PRIMARY')
            
                                let row = new MessageActionRow()
                                    .addComponents(
                                        leftfarbutton,
                                        leftbutton,
                                        rightbutton,
                                        rightfarbutton
                                    );
            
                                let embed = {
                                    color: 'RANDOM',
                                    title:`Toggled commands in ${message.guild.name}`,
                                    author: {
                                        name: `${message.author.username}#${message.author.discriminator}`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                
                                    footer: {
                                        text: `Page: ${page} | ${lastpage}`
                                    }
                                };
                            
                                const toggle_msg = await message.channel.send({ embeds: [embed], components: [row] });
            
                                const collector = toggle_msg.createMessageComponentCollector({ time: 20 * 1000 });
            
                                collector.on('collect', async (button) => {
                                    if(button.user.id != message.author.id) {
                                        return button.reply({
                                            content: 'This is not for you.',
                                            ephemeral: true,
                                        })
                                    } 
            
                                    button.deferUpdate()
            
                                    if(button.customId === "right") {
                                        page = page + 1
                                        display_start = (page - 1) * itemsperpage;
                                        display_end = page * itemsperpage;
            
                                        if(page === lastpage) {
                                            leftbutton.setDisabled(false)
                                            leftfarbutton.setDisabled(false)
                                            rightbutton.setDisabled();
                                            rightfarbutton.setDisabled()
            
                                            embed = {
                                                color: 'RANDOM',
                                                title:`Toggled commands in ${message.guild.name}`,
                                                author: {
                                                    name: `${message.author.username}#${message.author.discriminator}`,
                                                    icon_url: `${message.author.displayAvatarURL()}`,
                                                },
                                                description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                            
                                                footer: {
                                                    text: `Page: ${page} | ${lastpage}`
                                                }
                                            };
                                
                                            await toggle_msg.edit({ embeds: [embed], components: [row] });
                                        } else {
                                            leftbutton.setDisabled(false)
                                            rightbutton.setDisabled(false)
                                            rightfarbutton.setDisabled(false)
                                            leftfarbutton.setDisabled(false)
            
                                            embed = {
                                                color: 'RANDOM',
                                                title:`Toggled commands in ${message.guild.name}`,
                                                author: {
                                                    name: `${message.author.username}#${message.author.discriminator}`,
                                                    icon_url: `${message.author.displayAvatarURL()}`,
                                                },
                                                description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                            
                                                footer: {
                                                    text: `Page: ${page} | ${lastpage}`
                                                }
                                            };
                                
                                            await toggle_msg.edit({ embeds: [embed], components: [row] });
                                        }
                                    } else if(button.customId === "rightfar") {
                                        page = lastpage
                                        display_start = (page - 1) * itemsperpage;
                                        display_end = page * itemsperpage;
            
                                        if(page === lastpage) {
                                            leftbutton.setDisabled(false)
                                            leftfarbutton.setDisabled(false)
                                            rightbutton.setDisabled();
                                            rightfarbutton.setDisabled()
            
                                            embed = {
                                                color: 'RANDOM',
                                                title:`Toggled commands in ${message.guild.name}`,
                                                author: {
                                                    name: `${message.author.username}#${message.author.discriminator}`,
                                                    icon_url: `${message.author.displayAvatarURL()}`,
                                                },
                                                description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                            
                                                footer: {
                                                    text: `Page: ${page} | ${lastpage}`
                                                }
                                            };
                                
                                            await toggle_msg.edit({ embeds: [embed], components: [row] });
                                        } else {
                                            leftbutton.setDisabled(false)
                                            rightbutton.setDisabled(false)
                                            rightfarbutton.setDisabled(false)
                                            leftfarbutton.setDisabled(false)
            
                                            embed = {
                                                color: 'RANDOM',
                                                title:`Toggled commands in ${message.guild.name}`,
                                                author: {
                                                    name: `${message.author.username}#${message.author.discriminator}`,
                                                    icon_url: `${message.author.displayAvatarURL()}`,
                                                },
                                                description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                            
                                                footer: {
                                                    text: `Page: ${page} | ${lastpage}`
                                                }
                                            };
                                
                                            await toggle_msg.edit({ embeds: [embed], components: [row] });
                                        }
                                    } else if(button.customId === "left") {
                                        page = page - 1
                                        display_start = (page - 1) * itemsperpage;
                                        display_end = page * itemsperpage;
            
                                        if(page === 1) {
                                            rightbutton.setDisabled(false)
                                            rightfarbutton.setDisabled(false)
                                            leftbutton.setDisabled();
                                            leftfarbutton.setDisabled()
            
                                            embed = {
                                                color: 'RANDOM',
                                                title:`Toggled commands in ${message.guild.name}`,
                                                author: {
                                                    name: `${message.author.username}#${message.author.discriminator}`,
                                                    icon_url: `${message.author.displayAvatarURL()}`,
                                                },
                                                description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                            
                                                footer: {
                                                    text: `Page: ${page} | ${lastpage}`
                                                }
                                            };
                                
                                            await toggle_msg.edit({ embeds: [embed], components: [row] });
                                        } else {
                                            leftbutton.setDisabled(false)
                                            rightbutton.setDisabled(false)
                                            rightfarbutton.setDisabled(false)
                                            leftfarbutton.setDisabled(false)
            
                                            embed = {
                                                color: 'RANDOM',
                                                title:`Toggled commands in ${message.guild.name}`,
                                                author: {
                                                    name: `${message.author.username}#${message.author.discriminator}`,
                                                    icon_url: `${message.author.displayAvatarURL()}`,
                                                },
                                                description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                            
                                                footer: {
                                                    text: `Page: ${page} | ${lastpage}`
                                                }
                                            };
                                
                                            await toggle_msg.edit({ embeds: [embed], components: [row] });
                                        }
                                    } else if(button.customId === "leftfar") {
                                        page = 1
                                        display_start = (page - 1) * itemsperpage;
                                        display_end = page * itemsperpage;
            
                                        if(page === 1) {
                                            rightbutton.setDisabled(false)
                                            rightfarbutton.setDisabled(false)
                                            leftbutton.setDisabled();
                                            leftfarbutton.setDisabled()
            
                                            embed = {
                                                color: 'RANDOM',
                                                title:`Toggled commands in ${message.guild.name}`,
                                                author: {
                                                    name: `${message.author.username}#${message.author.discriminator}`,
                                                    icon_url: `${message.author.displayAvatarURL()}`,
                                                },
                                                description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                            
                                                footer: {
                                                    text: `Page: ${page} | ${lastpage}`
                                                }
                                            };
                                
                                            await toggle_msg.edit({ embeds: [embed], components: [row] });
                                        } else {
                                            leftbutton.setDisabled(false)
                                            rightbutton.setDisabled(false)
                                            rightfarbutton.setDisabled(false)
                                            leftfarbutton.setDisabled(false)
            
                                            embed = {
                                                color: 'RANDOM',
                                                title:`Toggled commands in ${message.guild.name}`,
                                                author: {
                                                    name: `${message.author.username}#${message.author.discriminator}`,
                                                    icon_url: `${message.author.displayAvatarURL()}`,
                                                },
                                                description: `${disabledcmds_map.slice(display_start, display_end).join("\n")}`,
                                            
                                                footer: {
                                                    text: `Page: ${page} | ${lastpage}`
                                                }
                                            };
                                
                                            await toggle_msg.edit({ embeds: [embed], components: [row] });
                                        }
                                    }
                                    
                                });
            
                                collector.on('end', collected => {
                                    toggle_msg.components[0].components.forEach(c => {c.setDisabled()})
                                    toggle_msg.edit({
                                        components: toggle_msg.components
                                    })
                                });
                            }
                        }

                        return handletogglemenu()
                    }
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
                    toggledboolean = true;
                }

                await guildModel.findOneAndUpdate({guildId: message.guild.id}, data);

                const embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`<a:checkmark:987475769422934066> **Successfully toggled the command disabled status:**\nAffected Command: \`${command.command}\`\nToggled to: \`${toggledboolean}\`\n**Enabled**: ${toggledboolean === true ? '<a:cross:987458395823018044>' : '<a:checkmark:987475769422934066>'}`)

                return message.reply({ embeds: [embed] })
                
            })
        } else {
            const embed = new MessageEmbed()
                .setTitle("Guild Configuration Options")
                .setColor("RANDOM")
                .setDescription(`${configopts_map}`)
            
            message.reply({ embeds: [embed] })
        }
    }
}