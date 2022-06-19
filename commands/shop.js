const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')

const allItems = require('../data/all_items');

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
    name: "shop",
    aliases: ["store", "item"],
    cooldown: 5,
    maxArgs: 0,
    description: 'see what is in the item shop.',
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        let cooldown = 5;
        if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
            cooldown = premiumcooldowncalc(cooldown)
        }
        const cooldown_amount = (cooldown) * 1000;
        const timpstamp = Date.now() + cooldown_amount
        jsoncooldowns[message.author.id].shop = timpstamp
        fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})

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
            const shopmaparray = allItems.map((value) => {
                if(value.price === "unable to be bought") {
                    return;
                } else {
                    return {
                        price: value.price,
                        icon: value.icon,
                        name: value.name,
                        item: value.item
                    }
                }
            })
            .filter(Boolean)
            .sort(function(a, b) {
                return a.price - b.price; 
            })

            const shopList = shopmaparray
            .map((value) => {
                return `${value.icon} **${value.name}**    **───**   \`❀ ${value.price.toLocaleString()}\` (${inventoryData.inventory[value.item] ? inventoryData.inventory[value.item].toLocaleString() : 0})\nItem ID: \`${value.item}\``;
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
    
                embed = {
                    color: '#AF97FE',
                    title: `Xenon Shop`,
                    description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                    footer: {
                        text: `Page: ${page} | ${lastpage} | xe shop [item]`
                    }
                };

                message.reply({ embeds: [embed], components: [row] });
               
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

                embed = {
                    color: '#AF97FE',
                    title: `Xenon Shop`,
                    description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
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
                            leftfarbutton.setDisabled(false)
                            rightbutton.setDisabled();
                            rightfarbutton.setDisabled();

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
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
                            rightfarbutton.setDisabled(false);
                            leftfarbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
                        }
                    } else if(button.customId === "rightfar") {
                        page = lastpage
                        display_start = (page - 1) * itemsperpage;
                        display_end = page * itemsperpage;

                        if(page === lastpage) {
                            leftbutton.setDisabled(false)
                            leftfarbutton.setDisabled(false)
                            rightbutton.setDisabled();
                            rightfarbutton.setDisabled();

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
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
                            rightfarbutton.setDisabled(false);
                            leftfarbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
                        }
                    }  else if(button.customId === "left") {
                        page = page - 1
                        display_start = (page - 1) * itemsperpage;
                        display_end = page * itemsperpage;

                        if(page === 1) {
                            rightbutton.setDisabled(false)
                            rightfarbutton.setDisabled(false)
                            leftbutton.setDisabled();
                            leftfarbutton.setDisabled()

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
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
                            rightfarbutton.setDisabled(false);
                            leftfarbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
                                thumbnail: {
                                    url: 'https://images-ext-2.discordapp.net/external/QDfae-evLkOcmuA0mS8rMJZpgngH-PKH-TgWwk56jHQ/https/pedanticperspective.files.wordpress.com/2014/11/cash-register.gif',
                                },
                                footer: {
                                    text: `Page: ${page} | ${lastpage} | xe shop [item]`
                                }
                            };
                
                            await shop_msg.edit({ embeds: [embed], components: [row] });
                        }
                    } else if(button.customId === 'leftfar') {
                        page = 1
                        display_start = (page - 1) * itemsperpage;
                        display_end = page * itemsperpage;

                        if(page === 1) {
                            rightbutton.setDisabled(false)
                            rightfarbutton.setDisabled(false)
                            leftbutton.setDisabled();
                            leftfarbutton.setDisabled()

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
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
                            rightfarbutton.setDisabled(false);
                            leftfarbutton.setDisabled(false)

                            embed = {
                                color: '#AF97FE',
                                title: `Xenon Shop`,
                                description: `\`xe buy [item]\`\n\`xe shop rarity\`\n\n${shopList.slice(display_start, display_end).join("\n\n")}`,
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

                    return `${ifhasamountitem(value.q, inventoryData.inventory[toolitem.item]) === true ? `[\`${value.q.toLocaleString()}\`](https://www.google.com/)` : `\`${value.q.toLocaleString()}\``} ${toolitem.icon} \`${toolitem.item}\``;
                })
                .join('\n')
                
            }

            let craftitems;
            if(item.craftitems) {
                craftitems = item.craftitems.map(value => {
                    const craftitem = allItems.find(({ item }) => item === value.i);

                    return `${ifhasamountitem(value.q, inventoryData.inventory[craftitem.item]) === true ? `[\`${value.q.toLocaleString()}\`](https://www.google.com/)` : `\`${value.q.toLocaleString()}\``} ${craftitem.icon} \`${craftitem.item}\``;
                })
                .join('\n')
            }
            
            let lootboxitems;
            if(item.lootbox) {
                lootboxitems = item.lootbox.map(value => {
                    const craftitem = allItems.find(({ item }) => item === value.i);

                    return `${craftitem.icon} \`${craftitem.item}\` [\`${value.minq.toLocaleString()} - ${value.maxq.toLocaleString()}\`]`;
                })
                .join('\n')
            }


            const embed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`**${item.icon} ${item.name}** (${inventoryData.inventory[item.item] ? inventoryData.inventory[item.item].toLocaleString() : "0"} Owned)`)
                .setThumbnail(item.imageUrl)
                .setDescription(`> ${item.description}`)
                .addFields(
                    {
                        name: '_ _',
                        value: `**BUY:** \`❀ ${item.price?.toLocaleString()}\`\n**SELL:** \`❀ ${item.sell?.toLocaleString()}\`\n**TRADE:** \`❀ ${item.trade?.toLocaleString()}\``,
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
                )
                .setTimestamp()

            let messagecontents = { embeds: [embed] }


            if(craftitems) {
                embed.addFields(
                    {
                        name: 'Required Caft Tools',
                        value: `${crafttools}`,
                        inline: true,
                    }
                )
            }

            if(crafttools) {
                embed.addFields( 
                    {
                        name: 'Required Caft Materials',
                        value: `${craftitems}`,
                        inline: true,
                    }
                )
            }

            if(lootboxitems) {
                let itemsbutton = new MessageButton()
                    .setCustomId('itemsbutton')
                    .setLabel('Possible Items')
                    .setStyle('PRIMARY')

                let row = new MessageActionRow()
                    .addComponents(
                        itemsbutton
                    );

                messagecontents = { embeds: [embed], components: [row] }
            }

            const item_msg = await message.channel.send(messagecontents);

            if(lootboxitems) {
                const ephemeralitemsembed = new MessageEmbed()
                    .setTitle(`**Possible Items** [Possible Quantities]`)
                    .setDescription(lootboxitems)
                const collector = item_msg.createMessageComponentCollector({ time: 10 * 1000 });
                collector.on('collect', async (interaction) => {
                    if(interaction.customId === "itemsbutton") {
                        await interaction.reply({ embeds: [ephemeralitemsembed], ephemeral: true });
                    }
                    
                });

                collector.on('end', collected => {
                    item_msg.components[0].components.forEach(c => {
                        c.setDisabled()
                        c.setStyle('SECONDARY')
                    })
                    item_msg.edit({
                        components: item_msg.components
                    })
                });

            }


        }


    }
}