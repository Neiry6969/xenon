const profileModel = require("../models/profileSchema");
const allItems = require("../data/all_items");
const inventoryModel = require('../models/inventorySchema');
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "use",
    aliases: [],
    cooldown: 5,
    minArgs: 0,
    maxArgs: 1,
    description: "use useable items.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const getItem = args[0]?.toLowerCase()
        let useamount = args[1]?.toLowerCase();

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

        const params = {
            userId: message.author.id,
        }
        inventoryModel.findOne(params, async(err, data) => {
            if(data) {
                const hasItem = Object.keys(data.inventory).includes(item.item);
                if(!hasItem) {
                    const embed = {
                        color: '#FF0000',
                        title: `Use Error`,
                        description: `You don't own this item.\n**Item:** ${item.icon} \`${item.item}\``,
                        timestamp: new Date(),
                    };
        
                    return message.reply({ embeds: [embed] });
                } else if(data.inventory[item.item] === 0) {
                    const embed = {
                        color: '#FF0000',
                        title: `Use Error`,
                        description: `You don't own this item.\n**Item:** ${item.icon} \`${item.item}\``,
                        timestamp: new Date(),
                    };
        
                    return message.reply({ embeds: [embed] });
                } else {
                    if(useamount === 'max' || useamount === 'all') {
                        if(data.inventory[item.item] <= 0) {
                            const embed = {
                                color: '#FF0000',
                                title: `Use Error`,
                                description: `You don't have \`${useamount.toLocaleString()}\` of this item to use.\n**Item:** ${item.icon} \`${item.item}\`\n**Amount Owned:** \`${data.inventory[item.item]?.toLocaleString()}\``,
                                timestamp: new Date(),
                            };
    
                            return message.reply({ embeds: [embed] });
                        } else {
                            useamount = parseInt(useamount)
                        }
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
            
                    const totalprice = item.value * useamount;
            
                    if(!useamount || useamount < 0) {
                        return message.reply("You can only use a whole number of items.");
                    } else if (useamount === 0) {
                        return message.reply("You used none of that item, you are joking right?");
                    } else if (puseamount = data.inventory[item.item] < useamount) {
                        const embed = {
                            color: '#FF0000',
                            title: `Use Error`,
                            description: `You don't have \`${useamount.toLocaleString()}\` of this item to use.\n**Item:** ${item.icon} \`${item.item}\`\n**Amount Owned:** \`${data.inventory[item.item]?.toLocaleString()}\``,
                            timestamp: new Date(),
                        };

                        return message.reply({ embeds: [embed] });
                    }

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

                            data.inventory[item.item] = data.inventory[item.item] - 1;
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

                            data.inventory[item.item] = data.inventory[item.item] - useamount;
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

                            data.inventory[item.item] = data.inventory[item.item] - 1;
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
                        data.inventory[item.item] = data.inventory[item.item] - 1;

                        await inventoryModel.findOneAndUpdate(params, data);
                        return message.reply(`You eat one ${item.icon} \`${item.item}\` and it tastes good!`);
                    } else if(item.item === 'premiumcard') {
                        if(profileData.premium >= 1) {
                            return message.reply(`You can't use a ${item.icon} \`${item.item}\`, since you are already a premium.`);
                        } else {
                            data.inventory[item.item] = data.inventory[item.item] - 1;

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

                            await inventoryModel.findOneAndUpdate(params, data);
                            return message.reply(`You used a ${item.icon} \`${item.item}\` and became a premium forever!`);
                        }
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
            } else {
                const embed = {
                    color: '#FF0000',
                    title: `Use Error`,
                    description: `You don't own this item.\n**Item:** ${item.icon} \`${item.item}\``,
                    timestamp: new Date(),
                };
    
                return message.reply({ embeds: [embed] });
            }
        })
        
    }
}