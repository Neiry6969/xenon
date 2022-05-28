const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')

const profileModel = require("../models/profileSchema");
const allItems = require("../data/all_items");
const userModel = require('../models/userSchema');
const inventoryModel = require('../models/inventorySchema');
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "use",
    aliases: [],
    cooldown: 5,
    minArgs: 0,
    maxArgs: 1,
    description: "use useable items.",
    async execute(message, args, cmd, client, Discord, profileData, userData, inventoryData) {
        const expectedsyntax = `**Expected Syntax:** \`xe use [item]\``
        const getItem = args[0]?.toLowerCase();
        let useamount = args[1]?.toLowerCase();

        if(!getItem) {
            const embed = {
                color: '#FF0000',
                title: `Action Error`,
                description: `What item do you want to use!\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] });
        } else if(getItem.length < 3) {
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

        const params = {
            userId: message.author.id,
        }

        if(inventoryData) {
            const hasItem = Object.keys(inventoryData.inventory).includes(item.item);
            if(!hasItem || inventoryData.inventory[item.item] === 0) {
                const embed = {
                    color: '#FF0000',
                    title: `Use Error`,
                    description: `You don't own this item.\n**Item:** ${item.icon} \`${item.item}\``,
                    timestamp: new Date(),
                };
    
                return message.reply({ embeds: [embed] });
            } else {
                if(useamount === 'max' || useamount === 'all') {
                    if(inventoryData.inventory[item.item] <= 0) {
                        const embed = {
                            color: '#FF0000',
                            title: `Use Error`,
                            description: `You don't have \`${useamount.toLocaleString()}\` of this item to use.\n**Item:** ${item.icon} \`${item.item}\`\n**Amount Owned:** \`${inventoryData.inventory[item.item]?.toLocaleString()}\``,
                            timestamp: new Date(),
                        };

                        return message.reply({ embeds: [embed] });
                    } else {
                        useamount = inventoryData.inventory[item.item]
                    }
                } else if(useamount === 'half') {
                    useamount = Math.floor(inventoryData.inventory[item.item] / 2)
                } else if(!useamount || !parseInt(useamount)) {
                    useamount = 1
                } else if(letternumbers.find((val) => val.letter === useamount.slice(-1))) {
                    if(parseInt(useamount.slice(0, -1))) {
                        const number = parseFloat(useamount.slice(0, -1));
                        const numbermulti = letternumbers.find((val) => val.letter === useamount.slice(-1)).number;
                        useamount = number * numbermulti;
                    } else {
                        useamount = null;
                    }
                } else {
                    useamount = parseInt(useamount)
                }   

                useamount = parseInt(useamount)
        
                const totalprice = item.value * useamount;
        
                if(!useamount || useamount < 0) {
                    return message.reply("You can only use a whole number of items.");
                } else if (useamount === 0) {
                    return message.reply("You used none of that item, you are joking right?");
                } else if (inventoryData.inventory[item.item] < useamount) {
                    const embed = {
                        color: '#FF0000',
                        title: `Use Error`,
                        description: `You don't have \`${useamount.toLocaleString()}\` of this item to use.\n**Item:** ${item.icon} \`${item.item}\`\n**Amount Owned:** \`${inventoryData.inventory[item.item]?.toLocaleString()}\``,
                        timestamp: new Date(),
                    };

                    return message.reply({ embeds: [embed] });
                }

                const useableitems = [
                    'bankmessage',
                    'donut',
                    'kfcchicken',
                    'bread', 
                    'tomato',
                    'premiumcard',
                    'chestofcommon',
                    'chestofgods',
                    'chestofangelic',
                    'chestofjade',
                    'chestofshadow',
                    'chestofwooden',
                ]
                
                if(item.item === 'premiumcard') {
                    if(profileData.premium >= 1) {
                        const embed = {
                            color: '#FF0000',
                            title: `You failed to use an item`,
                            description: `You can't use a ${item.icon} \`${item.item}\`, since you are already a premium.`,
                            timestamp: new Date(),
                        };
                        return message.reply({ embeds: [embed] });
                    } 
                } else if(!useableitems.includes(item.item)) {
                    const embed = {
                        color: '#FF0000',
                        title: `Use Error`,
                        description: `This item is not usable.\n**Item:** ${item.icon} \`${item.item}\``,
                        timestamp: new Date(),
                    };

                    return message.reply({ embeds: [embed] });
                } 

                const handleUseitem = async() => {
                    if(item.item === 'bankmessage') {
                        if(parseInt(useamount) === 1) {
                            useamount = parseInt(useamount)
                            const expandedspace = Math.floor(Math.random() * (200000 * useamount)) + 50000;
                            const newbankspacetotal = expandedspace + profileData.bankspace + profileData.expbankspace;

                            const response = await profileModel.findOneAndUpdate(
                                {
                                    userId: message.author.id,
                                },
                                {
                                    $inc: {
                                        bankspace: expandedspace,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );

                            inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - 1;
                            await inventoryModel.findOneAndUpdate(params, inventoryData);

                            const embed = {
                                color: 'RANDOM',
                                title: `You expanded your bankspace`,
                                description: `**Item:** ${item.icon} \`${item.item}\`\n**Amount Used:** \`${useamount.toLocaleString()}\``,
                                fields: [
                                    {
                                        name: 'Expanded Bankspace',
                                        value: `\`${expandedspace.toLocaleString()}\``,
                                        inline: true,
                                    },
                                    {
                                        name: 'New Bankspace Total',
                                        value: `\`${newbankspacetotal.toLocaleString()}\``,
                                        inline: true,
                                    },
                                ],
                                timestamp: new Date(),
                            };

                            return message.reply({ embeds: [embed] });
                        } else if(useamount > 1) {
                            useamount = parseInt(useamount)
                            const expandedspace = Math.floor(Math.random() * (200000 * useamount)) + 50000 * useamount;
                            const newbankspacetotal = expandedspace + profileData.bankspace + profileData.expbankspace;

                            const response = await profileModel.findOneAndUpdate(
                                {
                                    userId: message.author.id,
                                },
                                {
                                    $inc: {
                                        bankspace: expandedspace,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );

                            inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - useamount;
                            await inventoryModel.findOneAndUpdate(params, inventoryData);


                            const embed = {
                                color: 'RANDOM',
                                title: `You expanded your bankspace`,
                                description: `**Item:** ${item.icon} \`${item.item}\`\n**Amount Used:** \`${useamount.toLocaleString()}\``,
                                fields: [
                                    {
                                        name: 'Expanded Bankspace',
                                        value: `\`${expandedspace.toLocaleString()}\``,
                                        inline: true,
                                    },
                                    {
                                        name: 'New Bankspace Total',
                                        value: `\`${newbankspacetotal.toLocaleString()}\``,
                                        inline: true,
                                    },
                                ],
                                timestamp: new Date(),
                            };

                            return message.reply({ embeds: [embed] });
                        } else {
                            useamount = 1;
                            const expandedspace = Math.floor(Math.random() * (200000 * useamount)) + 50000;
                            const newbankspacetotal = expandedspace + profileData.bankspace + profileData.expbankspace;

                            const response = await profileModel.findOneAndUpdate(
                                {
                                    userId: message.author.id,
                                },
                                {
                                    $inc: {
                                        bankspace: expandedspace,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );

                            inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - 1;
                            await inventoryModel.findOneAndUpdate(params, data);


                            const embed = {
                                color: 'RANDOM',
                                title: `You expanded your bankspace`,
                                description: `**Item:** ${item.icon} \`${item.item}\`\n**Amount Used:** \`${useamount.toLocaleString()}\``,
                                fields: [
                                    {
                                        name: 'Expanded Bankspace',
                                        value: `\`${expandedspace.toLocaleString()}\``,
                                        inline: true,
                                    },
                                    {
                                        name: 'New Bankspace Total',
                                        value: `\`${newbankspacetotal.toLocaleString()}\``,
                                        inline: true,
                                    },
                                ],
                                timestamp: new Date(),
                            };

                            return message.reply({ embeds: [embed] });
                        }
                    } else if(item.item === 'donut' || item.item === 'kfcchicken' || item.item === 'bread' || item.item === 'tomato') {
                        inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - 1;

                        await inventoryModel.findOneAndUpdate(params, inventoryData);
                        return message.reply(`You eat one ${item.icon} \`${item.item}\` and it tastes good!`);
                    } else if(item.item === 'premiumcard') {
                        if(profileData.premium >= 1) {
                            return message.reply(`You can't use a ${item.icon} \`${item.item}\`, since you are already a premium.`);
                        } else {
                            inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - 1;

                            const response = await profileModel.findOneAndUpdate(
                                {
                                    userId: message.author.id,
                                },
                                {
                                    $inc: {
                                        premium: 1,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );

                            await inventoryModel.findOneAndUpdate(params, inventoryData);
                            return message.reply(`You used a ${item.icon} \`${item.item}\` and became a premium forever!`);
                        }
                    } else if(item.type = "lootbox") {
                        let itemsarray = [];

                        let i;
                        for (i = 0; i < useamount; i++) {
                            const resultitemnumber = Math.floor(Math.random() * item.lootbox.length)
                            const resultitemobject = item.lootbox[resultitemnumber]
                            const resultitem = resultitemobject.i
                            const maxq = resultitemobject.maxq - resultitemobject.minq;
                            const minq = resultitemobject.minq;
                            const resultamount = Math.floor(Math.random() * maxq) + minq

                            const hasitem = itemsarray.find(({ item }) => item === resultitem)
                            if(hasitem) {
                                const index = itemsarray.findIndex(object => {
                                    return object.item === hasitem.item;
                                });
                                
                                const added_amount = hasitem.quantity + resultamount
                            
                                itemsarray[index].quantity = added_amount
                            } else {
                            itemsarray.push({
                                    item: resultitem,
                                    quantity: resultamount,
                                })
                            }
                        }
                        
                        
                        

                        itemsarray.forEach(value => {
                            const hasItem = Object.keys(inventoryData.inventory).includes(value.item);
                            if(!hasItem) {
                                inventoryData.inventory[value.item] = value.quantity;
                            } else {
                                inventoryData.inventory[value.item] = inventoryData.inventory[value.item] + value.quantity;
                            }

                        })

                        inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - useamount;
                        await inventoryModel.findOneAndUpdate(params, inventoryData);

                        const resultsmap = itemsarray.map(value => {
                            const lootitem = allItems.find(({ item }) => item === value.item)  

                            return `\`${value.quantity.toLocaleString()}x\` ${lootitem.icon} \`${lootitem.item}\``
                        })
                        .sort()
                        .join('\n')

                        const embed = new MessageEmbed()
                            .setTitle(`${message.author.username}'s ${item.name}`)
                            .setThumbnail(item.imageUrl)
                            .setDescription(resultsmap)
                            .setFooter({ text: `${useamount.toLocaleString()}x ${item.item}`, iconURL: message.author.displayAvatarURL() });

                        return message.reply({ embeds: [embed] });  
                    } else {
                        const embed = {
                            color: '#FF0000',
                            title: `Use Error`,
                            description: `You can't use this item.\n**Item:** ${item.icon} \`${item.item}\``,
                            timestamp: new Date(),
                        };

                        return message.reply({ embeds: [embed] });
                    }
                }

                const confirmationitems = [
                    'bankmessage',
                    'premiumcard',
                ]
    
                if(totalprice >= 1000000 && confirmationitems.includes(item.item)) {
                    let expandedspace; 
                    if(item.item === 'bankmessage') {
                        expandedspace = Math.floor(Math.random() * (200000 * useamount)) + 50000 * useamount;
                    } else {
                        expandedspace = 0;
                    }

                    async function preuse(step) {
                        if(step === 'start') {
                            if(item.item === 'bankmessage') {
    
                                const response = await profileModel.findOneAndUpdate(
                                    {
                                        userId: message.author.id,
                                    },
                                    {
                                        $inc: {
                                            bankspace: expandedspace,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );
    
                                inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - useamount;
                                await inventoryModel.findOneAndUpdate(params, inventoryData);
                            } else if(item.item === 'premiumcard') {
                                inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - 1;
        
                                const response = await profileModel.findOneAndUpdate(
                                    {
                                        userId: message.author.id,
                                    },
                                    {
                                        $inc: {
                                            premium: 1,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );
    
                                await inventoryModel.findOneAndUpdate(params, inventoryData);
                            }
                        } else {
                            if(item.item === 'bankmessage') {
    
                                const response = await profileModel.findOneAndUpdate(
                                    {
                                        userId: message.author.id,
                                    },
                                    {
                                        $inc: {
                                            bankspace: -expandedspace,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );
    
                                inventoryData.inventory[item.item] = inventoryData.inventory[item.item] + useamount;
                                await inventoryModel.findOneAndUpdate(params, inventoryData);
                            } else if(item.item === 'premiumcard') {
                                inventoryData.inventory[item.item] = inventoryData.inventory[item.item] + 1;
        
                                const response = await profileModel.findOneAndUpdate(
                                    {
                                        userId: message.author.id,
                                    },
                                    {
                                        $inc: {
                                            premium: -1,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );
    
                                await inventoryModel.findOneAndUpdate(params, inventoryData);
                            }
                        }
                    }

                    preuse('start');

                    let confirm = new MessageButton()
                        .setCustomId('confirm')
                        .setLabel('Confirm')
                        .setStyle('PRIMARY')
            
                    let cancel = new MessageButton()
                        .setCustomId('cancel')
                        .setLabel('Cancel')
                        .setStyle('DANGER')
            
                    let row = new MessageActionRow()
                        .addComponents(
                            confirm,
                            cancel
                        );

                    const embed = {
                        color: 'RANDOM',
                        author: {
                            name: `_____________`,
                            icon_url: `${message.author.displayAvatarURL()}`,
                        },
                        title: `Confirm action`,
                        description: `<@${message.author.id}>, do you are you sure you want to use \`${useamount.toLocaleString()}\` ${item.icon} \`${item.item}\`?\nWorth: \`❀ ${totalprice.toLocaleString()}\``,
                        timestamp: new Date(),
                    };
                    const use_msg = await message.reply({ embeds: [embed], components: [row] });
            
                    const collector = use_msg.createMessageComponentCollector({ time: 20 * 1000 });

                    await userModel.updateOne(
                        { userId: message.author.id },
                        {
                            $set: {
                                awaitinginteraction: true
                            }
                        },
                        {
                            upsert: true,
                        }
                    )
            
                    collector.on('collect', async (button) => {
                        if(button.user.id != message.author.id) {
                            return button.reply({
                                content: 'This is not for you.',
                                ephemeral: true,
                            })
                        } 
                        
                        
                        button.deferUpdate()
                        if(button.customId === "confirm") {
                            await userModel.updateOne(
                                { userId: message.author.id },
                                {
                                    $set: {
                                        awaitinginteraction: false
                                    }
                                },
                                {
                                    upsert: true,
                                }
                            )

                            let embed;
                            if(item.item === 'bankmessage') {
                                const newbankspacetotal = expandedspace + profileData.bankspace + profileData.expbankspace;
                                    
                                    embed = {
                                        color: 'RANDOM',
                                        title: `You expanded your bankspace`,
                                        description: `**Item:** ${item.icon} \`${item.item}\`\n**Amount Used:** \`${useamount.toLocaleString()}\``,
                                        fields: [
                                            {
                                                name: 'Expanded Bankspace',
                                                value: `\`${expandedspace.toLocaleString()}\``,
                                                inline: true,
                                            },
                                            {
                                                name: 'New Bankspace Total',
                                                value: `\`${newbankspacetotal.toLocaleString()}\``,
                                                inline: true,
                                            },
                                        ],
                                        timestamp: new Date(),
                                    };
                            } else if(item.item === 'premiumcard') {
                                embed = {
                                    color: 'RANDOM',
                                    title: `You used an item`,
                                    description: `You used a ${item.icon} \`${item.item}\` and became a premium forever!`,
                                    timestamp: new Date(),
                                };
                            } else {
                                const embed = {
                                    color: '#FF0000',
                                    title: `Use Error`,
                                    description: `You can't use this item.\n**Item:** ${item.icon} \`${item.item}\``,
                                    timestamp: new Date(),
                                };
        
                                return message.reply({ embeds: [embed] });
                            }
            
                            confirm
                                .setDisabled()
                                .setStyle("SUCCESS")
            
                            cancel
                                .setDisabled()
                                .setStyle("SECONDARY")
            
                            use_msg.edit({
                                embeds: [embed],
                                components: [row]
                            })
                        
                        } else if(button.customId === "cancel") {
                            await userModel.updateOne(
                                { userId: message.author.id },
                                {
                                    $set: {
                                        awaitinginteraction: false
                                    }
                                },
                                {
                                    upsert: true,
                                }
                            )

                            preuse('end');
                            const embed = {
                                color: '#FF0000',
                                author: {
                                    name: `_____________`,
                                    icon_url: `${message.author.displayAvatarURL()}`,
                                },
                                title: `Action cancelled`,
                                description: `<@${message.author.id}>, do you are you sure you want to use \`${useamount.toLocaleString()}\` ${item.icon} \`${item.item}\`?\nWorth: \`❀ ${totalprice.toLocaleString()}\`\nI guess not.`,
                                timestamp: new Date(),
                            };
                            
                            confirm
                                .setDisabled()
                                .setStyle("SECONDARY")
            
                            cancel.setDisabled()
                            
                            use_msg.edit({
                                embeds: [embed],
                                components: [row]
                            })
                    
                        }
                        
                    });
            
                    collector.on('end', async collected => {
                        if(collected.size > 0) {
            
                        } else {
                            await userModel.updateOne(
                                { userId: message.author.id },
                                {
                                    $set: {
                                        awaitinginteraction: false
                                    }
                                },
                                {
                                    upsert: true,
                                }
                            )
                            preuse('end');
                            const embed = {
                                color: '#FF0000',
                                author: {
                                    name: `_____________`,
                                    icon_url: `${message.author.displayAvatarURL()}`,
                                },
                                title: `Action timeout`,
                                description: `<@${message.author.id}>, do you are you sure you want to use \`${useamount.toLocaleString()}\` ${item.icon} \`${item.item}\`?\nWorth: \`❀ ${totalprice.toLocaleString()}\`\nI guess not.`,
                                timestamp: new Date(),
                            };
                            
                            confirm
                                .setDisabled()
                                .setStyle("SECONDARY")
            
                            cancel
                                .setDisabled()
                                .setStyle("SECONDARY")
                            
                            use_msg.edit({
                                embeds: [embed],
                                components: [row]
                            })
                        }
                    });

                } else {
                    return handleUseitem();
                }
                
            }
        } else {
            const embed = {
                color: '#FF0000',
                title: `Use Error`,
                description: `You don't own this item.\n**Item:** ${item.icon} \`${item.item}\``,
                timestamp: new Date(),
            };

            return message.reply({ embeds: [embed] });
        }
        
    }
}
