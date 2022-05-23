const { MessageActionRow, MessageButton } = require('discord.js')

const allItems = require('../data/all_items');
const itemModel = require('../models/itemSchema');
const inventoryModel = require('../models/inventorySchema');

module.exports = {
    name: "shop",
    aliases: ["store", "item"],
    cooldown: 5,
    maxArgs: 0,
    description: 'see what is in the item shop.',
    async execute(message, args, cmd, client, Discord, profileData) {
        const getItem = args[0]?.toLowerCase();
        const ifcondition = args[0]?.toLowerCase();

        if(ifcondition === 'rarity') {
            embed = 
             embed = {
                color: '#AF97FE',
                title: `Xenon Item Rarity Chart`,
                description: `**Ranking from highest to lowest:**\n\n\`mythical\`\n\`godly\`\n\`legendary\`\n\`exotic\`\n\`epic\`\n\`rare\`\n\`uncommon\`\n\`common\``,
                timestamp: new Date(),
            };

            return message.channel.send({ embeds: [embed] });
        }

        if(!getItem) {
            const shopList = allItems
            .map((value) => {
                if(value.price === "unable to be bought") {
                    return;
                } else {
                    return `${value.icon} **${value.name}**    **───**   ❀ \`${value.price.toLocaleString()}\`\nItem ID: \`${value.item}\``;
                }
            }).filter(Boolean)

            const shop = Object.values(shopList).filter(Boolean);
            const shoplength = shop.length;
            const itemsperpage = 6;
            
            let lastpage;
            if(shoplength % itemsperpage > 0) {
                lastpage = Math.floor(shoplength / itemsperpage) + 1;
            } else {
                lastpage = shoplength / itemsperpage;
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
                    title: `Xenon Shop`,
                    description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                    footer: {
                        text: `Page: ${page} | ${lastpage} | xe shop [item]`
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
                    title: `Xenon Shop`,
                    description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                    thumbnail: {
                        url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                    },
                    footer: {
                        text: `Page: ${page} | ${lastpage} | xe shop [item]`
                    }
                };
            
                const shop_msg = await message.channel.send({ embeds: [embed], components: [row] });

                const collector = shop_msg.createMessageComponentCollector({ time: 20 * 1000 });

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
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
                        } else {
                            leftbutton.setDisabled(false)
                            rightbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
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
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
                        } else {
                            leftbutton.setDisabled(false)
                            rightbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
                        }
                    }
                    
                });

                collector.on('end', collected => {
                    shop_msg.components[0].components.forEach(c => {c.setDisabled()})
                    shop_msg.edit({
                        components: shop_msg.components
                    })
                });
            }

        } else if(getItem) {
            if(getItem.length < 3) {
                return message.reply(`\`${getItem}\` is not even an existing item.`);
            } else if (getItem.length > 250) {
                return message.reply(`Couldn't find that item because you typed passed the limit of 250 characters.`);
            }
            const itemssearch = allItems.filter((value) => {
                return (
                  value.item.includes(getItem)
                )
            })

            const item = itemssearch[0]

            
            if(item === undefined) {
                return message.reply(`\`${getItem}\` is not even an existing item.`);
            }

            const params_user = {
                userId: message.author.id,
            }
    
            inventoryModel.findOne(params_user, async(err, data) => {
                let itemOwned;

                function ifhasamountitem(reqm, hasa) {
                    if(hasa >= reqm) {
                        return true;
                    } else {
                        return false;
                    }
                } 

                let crafttools;
                if(item.crafttools) {
                    crafttools = item.crafttools.map(value => {
                        const toolitem = allItems.find(({ item }) => item === value.i);

                        return `${ifhasamountitem(value.q, data.inventory[toolitem.item]) === true ? `[\`${value.q.toLocaleString()}\`](https://www.google.com/)` : `\`${value.q.toLocaleString()}\``} ${toolitem.icon} \`${toolitem.item}\``;
                    })
                    .join('\n')
                    
                }

                let craftitems;
                if(item.craftitems) {
                    craftitems = item.craftitems.map(value => {
                        const craftitem = allItems.find(({ item }) => item === value.i);

                        return `${ifhasamountitem(value.q, data.inventory[craftitem.item]) === true ? `[\`${value.q.toLocaleString()}\`](https://www.google.com/)` : `\`${value.q.toLocaleString()}\``} ${craftitem.icon} \`${craftitem.item}\``;
                    })
                    .join('\n')
                }
                


                if(!data.inventory[item.item]) {
                    itemOwned = 0
                } else {
                    itemOwned = data.inventory[item.item]
                }
                
                let embed = {
                    color: 'RANDOM',
                    title: `**${item.icon} ${item.name}** (${itemOwned?.toLocaleString()} Owned)`,
                    thumbnail: {
                        url: item.imageUrl,
                    },
                    description: `> ${item.description}`,
                    fields: [
                        {
                            name: '_ _',
                            value: `**BUY:** ❀ \`${item.price?.toLocaleString()}\`\n**SELL:** ❀ \`${item.sell?.toLocaleString()}\`\n**TRADE:** ❀ \`${item.trade?.toLocaleString()}\``,
                        },
                        {
                            name: 'ID',
                            value: `\`${item.item}\``,
                            inline: true,
                        },
                        {
                            name: 'Rarity',
                            value: `\`${item.rarity}\``,
                            inline: true,
                        },
                        {
                            name: 'Type',
                            value: `\`${item.type}\``,
                            inline: true,
                        },
                    ],
                    timestamp: new Date(),
                };

                if(craftitems && crafttools) {
                    embed = {
                        color: 'RANDOM',
                        title: `**${item.icon} ${item.name}** (${itemOwned?.toLocaleString()} Owned)`,
                        thumbnail: {
                            url: item.imageUrl,
                        },
                        description: `> ${item.description}`,
                        fields: [
                            {
                                name: '_ _',
                                value: `**BUY:** ❀ \`${item.price?.toLocaleString()}\`\n**SELL:** ❀ \`${item.sell?.toLocaleString()}\`\n**TRADE:** ❀ \`${item.trade?.toLocaleString()}\``,
                            },
                            {
                                name: 'ID',
                                value: `\`${item.item}\``,
                                inline: true,
                            },
                            {
                                name: 'Rarity',
                                value: `\`${item.rarity}\``,
                                inline: true,
                            },
                            {
                                name: 'Type',
                                value: `\`${item.type}\``,
                                inline: true,
                            },
                            {
                                name: 'Required Caft Tools',
                                value: `${crafttools}`,
                                inline: true,
                            },
                            {
                                name: 'Required Caft Materials',
                                value: `${craftitems}`,
                                inline: true,
                            },
                        ],
                        timestamp: new Date(),
                    };
                }
    
                return message.reply({ embeds: [embed] });

                
            })


        } else {
            const shopList = allItems
            .map((value) => {
                if(value.price === "unable to be bought") {
                    return;
                } else {
                    return `${value.icon} **${value.name}**    **───**   ❀ \`${value.price.toLocaleString()}\`\nItem ID: \`${value.item}\``;
                }
            }).filter(Boolean)

            const shop = Object.values(shopList).filter(Boolean);
            const shoplength = shop.length;
            const itemsperpage = 6;
            
            let lastpage;
            if(shoplength % itemsperpage > 0) {
                lastpage = Math.floor(shoplength / itemsperpage) + 1;
            } else {
                lastpage = shoplength / itemsperpage;
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
                    title: `Xenon Shop`,
                    description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                    thumbnail: {
                        url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                    },
                    footer: {
                        text: `Page: ${page} | ${lastpage} | xe shop [item]`
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
                    title: `Xenon Shop`,
                    description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                    thumbnail: {
                        url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                    },
                    footer: {
                        text: `Page: ${page} | ${lastpage} | xe shop [item]`
                    }
                };
            
                const shop_msg = await message.channel.send({ embeds: [embed], components: [row] });

                const collector = shop_msg.createMessageComponentCollector({ time: 20 * 1000 });

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
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
                        } else {
                            leftbutton.setDisabled(false)
                            rightbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
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
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
                        } else {
                            leftbutton.setDisabled(false)
                            rightbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                description: `\`xe buy [item]\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
                        }
                    }
                    
                });

                collector.on('end', collected => {
                    shop_msg.components[0].components.forEach(c => {c.setDisabled()})
                    shop_msg.edit({
                        components: shop_msg.components
                    })
                });
            }
        }


    }
}