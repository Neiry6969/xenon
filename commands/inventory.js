const { MessageActionRow, MessageButton } = require('discord.js')

const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const allItems = require('../data/all_items');

module.exports = {
    name: 'inventory',
    aliases: ['inv'],
    cooldown: 3,
    description: "check your inventory.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        let target;

        if(message.mentions.users.first()) {
            target = message.mentions.users.first()
        } else {
            try {
                const featch_user = await message.guild.members.fetch(args[0])
                target = featch_user.user
            } catch (error) {
                target = null
            }
        }

        
        if(target) {
            inventoryModel.findOne({ userId: target.id }, async(err, data) => {
                if(!data) {
                    return message.reply("This user has nothing in their inventory move along.")
                } 
    
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
                    const itemsperpage = 16;
                    
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
                            color: 'RANDOM',
                            title: `Inventory`,
                            author: {
                                name: `${target.username}#${target.discriminator}`,
                                icon_url: `${target.displayAvatarURL()}`,
                            },
                            description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                       
                            footer: {
                                text: `Page: ${page} | ${lastpage}`
                            }
                        };

                        const inv_msg = await message.channel.send({ embeds: [embed], components: [row] });
                    
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
                            color: 'RANDOM',
                            title: `Inventory`,
                            author: {
                                name: `${target.username}#${target.discriminator}`,
                                icon_url: `${target.displayAvatarURL()}`,
                            },
                            description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                       
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
                                    leftfarbutton.setDisabled(false)
                                    rightbutton.setDisabled();
                                    rightfarbutton.setDisabled()

                                    embed = {
                                        color: 'RANDOM',
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                   
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                } else {
                                    leftbutton.setDisabled(false)
                                    rightbutton.setDisabled(false)
                                    leftfarbutton.setDisabled(false)
                                    rightfarbutton.setDisabled(false)

                                    embed = {
                                        color: 'RANDOM',
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                   
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                }
                            } else if(button.customId === "rightfar") {
                                page = lastpage
                                display_start = (page - 1) * itemsperpage;
                                display_end = page * itemsperpage;

                                if(page === lastpage) {
                                    leftbutton.setDisabled(false);
                                    leftfarbutton.setDisabled(false)
                                    rightbutton.setDisabled();
                                    rightfarbutton.setDisabled()

                                    embed = {
                                        color: 'RANDOM',
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                   
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                } else {
                                    leftbutton.setDisabled(false)
                                    rightbutton.setDisabled(false)
                                    leftfarbutton.setDisabled(false)
                                    rightfarbutton.setDisabled(false)

                                    embed = {
                                        color: 'RANDOM',
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                   
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

                                if(page === 1) {
                                    leftbutton.setDisabled();
                                    leftfarbutton.setDisabled()
                                    rightbutton.setDisabled(false);
                                    rightfarbutton.setDisabled(false)

                                    embed = {
                                        color: 'RANDOM',
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                   
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                } else {
                                    leftbutton.setDisabled(false)
                                    rightbutton.setDisabled(false)
                                    leftfarbutton.setDisabled(false)
                                    rightfarbutton.setDisabled(false)
                                    embed = {
                                        color: 'RANDOM',
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                   
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                } 
                            } else if(button.customId === 'leftfar') {
                                page = 1
                                display_start = (page - 1) * itemsperpage;
                                display_end = page * itemsperpage;

                                if(page === 1) {
                                    leftbutton.setDisabled();
                                    leftfarbutton.setDisabled()
                                    rightbutton.setDisabled(false);
                                    rightfarbutton.setDisabled(false)

                                    embed = {
                                        color: 'RANDOM',
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                   
                                        footer: {
                                            text: `Page: ${page} | ${lastpage}`
                                        }
                                    };
                        
                                    inv_msg.edit({ embeds: [embed], components: [row] });
                                } else {
                                    leftbutton.setDisabled(false)
                                    rightbutton.setDisabled(false)
                                    leftfarbutton.setDisabled(false)
                                    rightfarbutton.setDisabled(false)
                                    embed = {
                                        color: 'RANDOM',
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                                   
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
            if(!inventoryData.inventory) return message.reply("You got nothing in your inventory.");

            const mappedData = Object.keys(inventoryData.inventory)
                .sort()
                .map((key) => {
                    if(inventoryData.inventory[key] === 0) {
                        return;
                    } else {
                        const itemIcon = allItems.find((val) => (val.item.toLowerCase()) === key).icon;
                        return `${itemIcon} ${key} ── \`${inventoryData.inventory[key].toLocaleString()}\``;
                    }
                }
                )
                .filter(Boolean)

            if(mappedData.length === 0) {
                return message.reply("You got nothing in your inventory.");
            } else {
                const inventory = Object.values(inventoryData.inventory).filter(Boolean);
                const invlength = inventory.length;
                const itemsperpage = 16;
                
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
                        color: 'RANDOM',
                        title: `Inventory`,
                        author: {
                            name: `${message.author.username}#${message.author.discriminator}`,
                            icon_url: `${message.author.displayAvatarURL()}`,
                        },
                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                   
                        footer: {
                            text: `Page: ${page} | ${lastpage}`
                        }
                    };

                    const inv_msg = await message.channel.send({ embeds: [embed], components: [row] });
                
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
                        color: 'RANDOM',
                        title: `Inventory`,
                        author: {
                            name: `${message.author.username}#${message.author.discriminator}`,
                            icon_url: `${message.author.displayAvatarURL()}`,
                        },
                        description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                   
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
                                leftfarbutton.setDisabled(false)
                                rightbutton.setDisabled();
                                rightfarbutton.setDisabled()

                                embed = {
                                    color: 'RANDOM',
                                    title: `Inventory`,
                                    author: {
                                        name: `${message.author.username}#${message.author.discriminator}`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                               
                                    footer: {
                                        text: `Page: ${page} | ${lastpage}`
                                    }
                                };
                    
                                await inv_msg.edit({ embeds: [embed], components: [row] });
                            } else {
                                leftbutton.setDisabled(false)
                                rightbutton.setDisabled(false)
                                rightfarbutton.setDisabled(false)
                                leftfarbutton.setDisabled(false)

                                embed = {
                                    color: 'RANDOM',
                                    title: `Inventory`,
                                    author: {
                                        name: `${message.author.username}#${message.author.discriminator}`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                               
                                    footer: {
                                        text: `Page: ${page} | ${lastpage}`
                                    }
                                };
                    
                                await inv_msg.edit({ embeds: [embed], components: [row] });
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
                                    title: `Inventory`,
                                    author: {
                                        name: `${message.author.username}#${message.author.discriminator}`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                               
                                    footer: {
                                        text: `Page: ${page} | ${lastpage}`
                                    }
                                };
                    
                                await inv_msg.edit({ embeds: [embed], components: [row] });
                            } else {
                                leftbutton.setDisabled(false)
                                rightbutton.setDisabled(false)
                                rightfarbutton.setDisabled(false)
                                leftfarbutton.setDisabled(false)

                                embed = {
                                    color: 'RANDOM',
                                    title: `Inventory`,
                                    author: {
                                        name: `${message.author.username}#${message.author.discriminator}`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                               
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
                                rightfarbutton.setDisabled(false)
                                leftbutton.setDisabled();
                                leftfarbutton.setDisabled()

                                embed = {
                                    color: 'RANDOM',
                                    title: `Inventory`,
                                    author: {
                                        name: `${message.author.username}#${message.author.discriminator}`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                               
                                    footer: {
                                        text: `Page: ${page} | ${lastpage}`
                                    }
                                };
                    
                                await inv_msg.edit({ embeds: [embed], components: [row] });
                            } else {
                                leftbutton.setDisabled(false)
                                rightbutton.setDisabled(false)
                                rightfarbutton.setDisabled(false)
                                leftfarbutton.setDisabled(false)

                                embed = {
                                    color: 'RANDOM',
                                    title: `Inventory`,
                                    author: {
                                        name: `${message.author.username}#${message.author.discriminator}`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                               
                                    footer: {
                                        text: `Page: ${page} | ${lastpage}`
                                    }
                                };
                    
                                await inv_msg.edit({ embeds: [embed], components: [row] });
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
                                    title: `Inventory`,
                                    author: {
                                        name: `${message.author.username}#${message.author.discriminator}`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                               
                                    footer: {
                                        text: `Page: ${page} | ${lastpage}`
                                    }
                                };
                    
                                await inv_msg.edit({ embeds: [embed], components: [row] });
                            } else {
                                leftbutton.setDisabled(false)
                                rightbutton.setDisabled(false)
                                rightfarbutton.setDisabled(false)
                                leftfarbutton.setDisabled(false)

                                embed = {
                                    color: 'RANDOM',
                                    title: `Inventory`,
                                    author: {
                                        name: `${message.author.username}#${message.author.discriminator}`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData.slice(display_start, display_end).join("\n")}`,
                               
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
        }
    }
}