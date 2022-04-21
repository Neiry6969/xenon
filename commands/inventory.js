const { MessageActionRow, MessageButton } = require('discord.js')

const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const allItems = require('../data/all_items');

module.exports = {
    name: 'inventory',
    aliases: ['inv'],
    cooldown: 3,
    description: "check your inventory.",
    async execute(message, args, cmd, client, Discord, profileData) {
        if(message.mentions.users.first()) {
            const target = message.mentions.users.first()
            const target_id = target.id

            const params = {
                userId: target_id,
            }
    
            inventoryModel.findOne(params, async(err, data) => {
                if(!data) return message.reply("This user has nothing in their inventory move along.");
    
                const mappedData = Object.keys(data.inventory)
                    .sort()
                    .map((key) => {
                        if(data.inventory[key] === 0) {
                            return;
                        } else {
                            const itemIcon = allItems.find((val) => (val.item.toLowerCase()) === key).icon;
                            return `${itemIcon} ${key} ── \`${data.inventory[key].toLocaleString()}\``;
                        }
                    }
                    )
                    .filter(Boolean)
                
                if(mappedData.length === 0) {
                    return message.reply("This user has nothing in their inventory move along.");
                } else {    
                    const inventory = Object.values(data.inventory).filter(Boolean);
                    const invlength = inventory.length;
                    const itemsperpage = 8;
                    
                    let lastpage;
                    if(invlength % itemsperpage > 0) {
                        lastpage = Math.floor(invlength / itemsperpage) + 1;
                    } else {
                        lastpage = invlength / itemsperpage;
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
                            color: 'RANDOM',
                            title: `${target.username}'s Inventory`,
                            author: {
                                name: `_____________`,
                                icon_url: `${target.displayAvatarURL()}`,
                            },
                            description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                            timestamp: new Date(),
                            footer: {
                                text: `Page: ${page} | ${lastpage}`
                            }
                        };

                        const inv_msg = await message.channel.send({ embeds: [embed], components: [row] });
                    
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
                            color: 'RANDOM',
                            title: `${target.username}'s Inventory`,
                            author: {
                                name: `_____________`,
                                icon_url: `${target.displayAvatarURL()}`,
                            },
                            description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                            timestamp: new Date(),
                            footer: {
                                text: `Page: ${page} | ${lastpage}`
                            }
                        };
                    
                        const inv_msg = await message.channel.send({ embeds: [embed], components: [row] });

                        const collector = inv_msg.createMessageComponentCollector({ time: 20 * 1000 });

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
                                    leftbutton.setDisabled(false);
                                    rightbutton.setDisabled();

                                    embed = {
                                        color: 'RANDOM',
                                        title: `${target.username}'s Inventory`,
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                } else {
                                    leftbutton.setDisabled(false)
                                    rightbutton.setDisabled(false)

                                    embed = {
                                        color: 'RANDOM',
                                        title: `${target.username}'s Inventory`,
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                }
                            } else if(button.customId === "left") {
                                page = page - 1
                                display_start = (page - 1) * itemsperpage;
                                display_end = page * itemsperpage;

                                console.log(page === lastpage)

                                if(page === 1) {
                                    leftbutton.setDisabled();
                                    rightbutton.setDisabled(false);

                                    embed = {
                                        color: 'RANDOM',
                                        title: `$target.username}'s Inventory`,
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                } else {
                                    leftbutton.setDisabled(false)
                                    rightbutton.setDisabled(false)

                                    embed = {
                                        color: 'RANDOM',
                                        title: `${target.username}'s Inventory`,
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                }
                            }
                            
                        });

                        collector.on('end', collected => {
                            inv_msg.components[0].components.forEach(c => {c.setDisabled()})
                            inv_msg.edit({
                                components: inv_msg.components
                            })
                        });
                    }
                }

            })
        } else {
            const params = {
                userId: message.author.id,
            }
    
            inventoryModel.findOne(params, async(err, data) => {
                if(!data) return message.reply("This user has nothing in their inventory move along.");
    
                const mappedData = Object.keys(data.inventory)
                    .sort()
                    .map((key) => {
                        if(data.inventory[key] === 0) {
                            return;
                        } else {
                            const itemIcon = allItems.find((val) => (val.item.toLowerCase()) === key).icon;
                            return `${itemIcon} ${key} ── \`${data.inventory[key].toLocaleString()}\``;
                        }
                    }
                    )
                    .filter(Boolean)

                if(mappedData.length === 0) {
                    return message.reply("This user has nothing in their inventory move along.");
                } else {
                    const inventory = Object.values(data.inventory).filter(Boolean);
                    const invlength = inventory.length;
                    const itemsperpage = 8;
                    
                    let lastpage;
                    if(invlength % itemsperpage > 0) {
                        lastpage = Math.floor(invlength / itemsperpage) + 1;
                    } else {
                        lastpage = invlength / itemsperpage;
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
                            color: 'RANDOM',
                            title: `${message.author.username}'s Inventory`,
                            author: {
                                name: `_____________`,
                                icon_url: `${message.author.displayAvatarURL()}`,
                            },
                            description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                            timestamp: new Date(),
                            footer: {
                                text: `Page: ${page} | ${lastpage}`
                            }
                        };

                        const inv_msg = await message.channel.send({ embeds: [embed], components: [row] });
                    
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
                            color: 'RANDOM',
                            title: `${message.author.username}'s Inventory`,
                            author: {
                                name: `_____________`,
                                icon_url: `${message.author.displayAvatarURL()}`,
                            },
                            description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                            timestamp: new Date(),
                            footer: {
                                text: `Page: ${page} | ${lastpage}`
                            }
                        };
                    
                        const inv_msg = await message.channel.send({ embeds: [embed], components: [row] });

                        const collector = inv_msg.createMessageComponentCollector({ time: 20 * 1000 });

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
                                        color: 'RANDOM',
                                        title: `${message.author.username}'s Inventory`,
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${message.author.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    await inv_msg.edit({ embeds: [embed], components: [row] });
                                } else {
                                    leftbutton.setDisabled(false)
                                    rightbutton.setDisabled(false)

                                    embed = {
                                        color: 'RANDOM',
                                        title: `${message.author.username}'s Inventory`,
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${message.author.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    await inv_msg.edit({ embeds: [embed], components: [row] });
                                }
                            } else if(button.customId === "left") {
                                page = page - 1
                                display_start = (page - 1) * itemsperpage;
                                display_end = page * itemsperpage;

                                if(page === 1) {
                                    rightbutton.setDisabled(false)
                                    leftbutton.setDisabled();

                                    embed = {
                                        color: 'RANDOM',
                                        title: `${message.author.username}'s Inventory`,
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${message.author.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    await inv_msg.edit({ embeds: [embed], components: [row] });
                                } else {
                                    leftbutton.setDisabled(false)
                                    rightbutton.setDisabled(false)

                                    embed = {
                                        color: 'RANDOM',
                                        title: `${message.author.username}'s Inventory`,
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${message.author.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                        timestamp: new Date(),
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    await inv_msg.edit({ embeds: [embed], components: [row] });
                                }
                            }
                            
                        });

                        collector.on('end', collected => {
                            inv_msg.components[0].components.forEach(c => {c.setDisabled()})
                            inv_msg.edit({
                                components: inv_msg.components
                            })
                        });
                    }
                }


                
            })
        }
    }
}