const { MessageActionRow, MessageButton } = require('discord.js')

const allhelp = require('../data/all_help');

const jsoncooldowns = require('../cooldowns.json');
const fs = require('fs')
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

module.exports = {
    name: "help",
    aliases: [],
    cooldown: 5,
    description: 'Commands for the bot.',
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        const getcommand = args[0]?.toLocaleString();

        if(!getcommand) {
            const helpList = allhelp
            .map((value) => {
                return `**${value.command}**\n${value.aliases ? `Aliases: \`${value.aliases.join("\` \`")}\`\n` : ""}<:subtopic:971147593998532628>${value.description}`;
            })
            .sort()
            .filter(Boolean)


            const help = Object.values(helpList).filter(Boolean);
            const helplength = help.length;
            const itemsperpage = 5;
            
            let lastpage;
            if(helplength % itemsperpage > 0) {
                lastpage = Math.floor(helplength / itemsperpage) + 1;
            } else {
                lastpage = helplength / itemsperpage;
            }

            let page = 1;
            let display_start = (page - 1) * itemsperpage;
            let display_end = page * itemsperpage;

            if(lastpage === 1) {
                let leftbutton = new MessageButton()
                    .setCustomId('left')
                    .setLabel('<')
                    .setStyle('PRIMARY')
                    .setDisabled()

                let rightbutton = new MessageButton()
                    .setCustomId('right')
                    .setLabel('>')
                    .setStyle('PRIMARY')
                    .setDisabled()

                let row = new MessageActionRow()
                    .addComponents(
                        leftbutton,
                        rightbutton
                    );
    
                embed = {
                    color: '#AF97FE',
                    title: `Xenon Help`,
                    thumbnail: {
                        url: client.user.displayAvatarURL(),
                    },
                    description: `${helpList.slice(display_start, display_end).join("\n\n")}`,
                    footer: {
                        text: `Page: ${page} | ${lastpage} | xe help [command]`
                    }
                };

                message.reply({ embeds: [embed], components: [row] });
               
            } else { 
                let leftbutton = new MessageButton()
                    .setCustomId('left')
                    .setLabel('<')
                    .setStyle('PRIMARY')
                    .setDisabled()

                let rightbutton = new MessageButton()
                    .setCustomId('right')
                    .setLabel('>')
                    .setStyle('PRIMARY')

                let row = new MessageActionRow()
                    .addComponents(
                        leftbutton,
                        rightbutton
                    );

                embed = {
                    color: '#AF97FE',
                    title: `Xenon Help`,
                    thumbnail: {
                        url: client.user.displayAvatarURL(),
                    },
                    description: `${helpList.slice(display_start, display_end).join("\n\n")}`,
                    footer: {
                        text: `Page: ${page} | ${lastpage} | xe help [command]`
                    }
                };
            
                const help_msg = await message.channel.send({ embeds: [embed], components: [row] });

                const collector = help_msg.createMessageComponentCollector({ time: 20 * 1000 });

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
                            rightbutton.setDisabled();

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Help`,
                                thumbnail: {
                                    url: client.user.displayAvatarURL(),
                                },
                                description: `${helpList.slice(display_start, display_end).join("\n\n")}`,
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe help [command]`
                                }
                            };
                
                            await help_msg.edit({ embeds: [embed], components: [row] });
                        } else {
                            leftbutton.setDisabled(false)
                            rightbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Help`,
                                thumbnail: {
                                    url: client.user.displayAvatarURL(),
                                },
                                description: `${helpList.slice(display_start, display_end).join("\n\n")}`,
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe help [command]`
                                }
                            };
                
                            await help_msg.edit({ embeds: [embed], components: [row] });
                        }
                    } else if(button.customId === "left") {
                        page = page - 1
                        display_start = (page - 1) * itemsperpage;
                        display_end = page * itemsperpage;

                        if(page === 1) {
                            rightbutton.setDisabled(false)
                            leftbutton.setDisabled();

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Help`,
                                thumbnail: {
                                    url: client.user.displayAvatarURL(),
                                },
                                description: `${helpList.slice(display_start, display_end).join("\n\n")}`,
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe help [command]`
                                }
                            };
                
                            await help_msg.edit({ embeds: [embed], components: [row] });
                        } else {
                            leftbutton.setDisabled(false)
                            rightbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Help`,
                                thumbnail: {
                                    url: client.user.displayAvatarURL(),
                                },
                                description: `${helpList.slice(display_start, display_end).join("\n\n")}`,
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe help [command]`
                                }
                            };
                
                            await help_msg.edit({ embeds: [embed], components: [row] });
                        }
                    }
                    
                });

                collector.on('end', collected => {
                    help_msg.components[0].components.forEach(c => {c.setDisabled()})
                    help_msg.edit({
                        components: help_msg.components
                    })
                });
            }

        } else if(getcommand) {
            return message.reply('New command spoted! Not finished!')
        }

        let cooldown = 5;
        if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
            cooldown = premiumcooldowncalc(cooldown)
        }
        const cooldown_amount = (cooldown) * 1000;
        const timpstamp = Date.now() + cooldown_amount
        jsoncooldowns[message.author.id].help = timpstamp
        fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})
    }
}