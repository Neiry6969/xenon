const profileModel = require("../models/profileSchema");
const allItems = require("../data/all_items");
const inventoryModel = require('../models/inventorySchema');

module.exports = {
    name: "use",
    aliases: [],
    cooldown: 5,
    minArgs: 0,
    maxArgs: 1,
    description: "use useable items.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const getItem = args[0].toLowerCase()
        let useAmount = args[1]

        if(!getItem) {
            return message.reply("Please specify an item to use.");
        }

        const validItem = !!allItems.find((val) => (val.item.toLowerCase() === getItem ||  val.aliases.includes(getItem)))

        if(!validItem) {
            return message.reply(`\`${getItem}\` is not an existent item.`);
        } else {
            const item = allItems.find((val) => (val.item.toLowerCase()) === getItem || val.aliases.includes(getItem));

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
                        if(useAmount === 'max' || useAmount === 'all'){
                            useAmount = data.inventory[item.item];
                        }
                        if(useAmount > data.inventory[item.item]) {
                            useAmount = parseInt(useAmount)
                            const embed = {
                                color: '#FF0000',
                                title: `Use Error`,
                                description: `You don't have \`${useAmount.toLocaleString()}\` of this item to use.\n**Item:** ${item.icon} \`${item.item}\`\n**Amount Owned:** \`${data.inventory[item.item]?.toLocaleString()}\``,
                                timestamp: new Date(),
                            };

                            return message.reply({ embeds: [embed] });
                        }

                        if(item.item === 'bankmessage') {
                            if(parseInt(useAmount) === 1) {
                                useAmount = parseInt(useAmount)
                                const expandedspace = Math.floor(Math.random() * (200000 * useAmount)) + 50000;
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
                                    description: `**Item:** ${item.icon} \`${item.item}\`\n**Amount Used:** \`${useAmount.toLocaleString()}\``,
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
                            } else if(useAmount > 1) {
                                useAmount = parseInt(useAmount)
                                const expandedspace = Math.floor(Math.random() * (200000 * useAmount)) + 50000 * useAmount;
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

                                data.inventory[item.item] = data.inventory[item.item] - useAmount;
                                await inventoryModel.findOneAndUpdate(params, data);


                                const embed = {
                                    color: 'RANDOM',
                                    title: `You expanded your bankspace`,
                                    description: `**Item:** ${item.icon} \`${item.item}\`\n**Amount Used:** \`${useAmount.toLocaleString()}\``,
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
                                useAmount = 1;
                                const expandedspace = Math.floor(Math.random() * (200000 * useAmount)) + 50000;
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
                                    description: `**Item:** ${item.icon} \`${item.item}\`\n**Amount Used:** \`${useAmount.toLocaleString()}\``,
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
                        } else if(item.item = 'preniumcard') {
                            if(profileData.prenium >= 1) {
                                return message.reply(`You can't use a ${item.icon} \`${item.item}\`, since you are already a prenium.`);
                            } else {
                                data.inventory[item.item] = data.inventory[item.item] - 1;

                                const response = await profileModel.findOneAndUpdate(
                                    {
                                        userId: message.author.id,
                                    },
                                    {
                                        $inc: {
                                            prenium: 1,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );

                                await inventoryModel.findOneAndUpdate(params, data);
                                return message.reply(`You used a ${item.icon} \`${item.item}\` and became a prenium forever!`);
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
}