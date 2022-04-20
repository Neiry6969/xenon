const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const allItems = require('../data/all_items');

module.exports = {
    name: 'buy',
    cooldown: 5,
    description: "buy items.",
    minArgs: 0,
    maxArgs: 1,
    async execute(message, args, cmd, client, Discord, profileData) {
        const itemAmount = args[1]?.toLowerCase();
        const getItem = args[0]?.toLowerCase();
        const netBal = profileData.coins + profileData.bank;

        if(!getItem) {
            return message.reply("Please specify a item to buy.");
        }

        const validItem = !!allItems.find((val) => (val.item.toLowerCase() === getItem ||  val.aliases.includes(getItem)))

        if(!validItem) {
            return message.reply(`\`${getItem}\` is not existent.`);
        } else {
            const item = allItems.find((val) => (val.item.toLowerCase()) === getItem || val.aliases.includes(getItem));

            if(item.price === 'unable to be bought') {
                const embed = {
                    color: '#FF0000',
                    title: `Buy Error`,
                    description: `This item is unable to be bought since it is not in the Xenon shop.\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\``,
                };
                return message.reply({ embeds: [embed] });
            } else {
                if(profileData.coins < item.price) {
                    if(netBal < item.price) {
                        const embed = {
                            color: '#FF0000',
                            title: `Purchase Error`,
                            description: `You don't have enough coins in your bank or wallet to buy that item.\n\n**Item:** ${item.icon} \`${item.item}\`\n**Purchase Cost:** ❀ \`${item.price.toLocaleString()}\`\n**Current Wallet:** \`${profileData.coins.toLocaleString()}\`\n**Current Net Balance:** ❀ \`${netBal.toLocaleString()}\``,
                            timestamp: new Date(),
                        };
            
                        return message.reply({ embeds: [embed] });
                    } else {
                        const embed = {
                            color: '#FF0000',
                            title: `Purchase Error`,
                            description: `You don't have enough coins in your wallet to buy that item, maybe withdraw some from your bank?\n\n**Item:** ${item.icon} \`${item.item}\`\n**Purchase Cost:** ❀ \`${item.price.toLocaleString()}\`\n**Current Wallet:** \`${profileData.coins.toLocaleString()}\`\n**Current Net Balance:** ❀ \`${netBal.toLocaleString()}\``,
                            timestamp: new Date(),
                        };
            
                        return message.reply({ embeds: [embed] });
                    }
                } 

                
                if(itemAmount === "max" || itemAmount === "all") {
                    const maxItemAmmount = Math.floor(profileData.coins / item.price);
                    const price = maxItemAmmount * item.price;
                    const params = {
                        userId: message.author.id,
                    }
            
                    inventoryModel.findOne(params, async(err, data) => {
                        if(data) {
                            const hasItem = Object.keys(data.inventory).includes(item.item);
                            if(!hasItem) {
                                data.inventory[item.item] = maxItemAmmount;
                            } else {
                                data.inventory[item.item] = data.inventory[item.item] + maxItemAmmount;
                            }
                            await inventoryModel.findOneAndUpdate(params, data);
            
                            const response = await profileModel.findOneAndUpdate(
                                {
                                    userId: message.author.id,
                                },
                                {
                                    $inc: {
                                        coins: -price,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );
                        } else {
                            new inventoryModel({
                                userId: message.author.id,
                                inventory: {
                                    [item.item]: maxItemAmmount
                                }
                            }).save();
            
                            const response = await profileModel.findOneAndUpdate(
                                {
                                    userId: message.author.id,
                                },
                                {
                                    $inc: {
                                        coins: -price,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );
                        }
                        const embed = {
                            color: '#A8FE97',
                            title: `Purchase Receipt`,
                            description: `**Item:** ${item.icon} \`${item.item}\`\n**Price:** ❀ \`${price.toLocaleString()}\`\n**Quantity:** \`${maxItemAmmount.toLocaleString()}\``,
                            timestamp: new Date(),
                        };
            
                        return message.reply({ embeds: [embed] });
                    })
                } else if(parseInt(itemAmount)){
                    const buy_amount = parseInt(itemAmount)
                    const total_price = buy_amount * item.price;
                    
                    if(buy_amount <= 0) {
                        return message.reply("You can only buy a whole number of items.");
                    } else if(total_price > profileData.coins) {
                        if(netBal < total_price) {
                            const embed = {
                                color: '#FF0000',
                                title: `Purchase Error`,
                                description: `You don't have enough coins in your bank or wallet to buy that item.\n\n**Item:** ${item.icon} \`${item.item}\`\n**Purchase Cost:** ❀ \`${total_price.toLocaleString()}\`\n**Current Wallet:** \`${profileData.coins.toLocaleString()}\`\n**Current Net Balance:** ❀ \`${netBal.toLocaleString()}\``,
                                timestamp: new Date(),
                            };
                
                            return message.reply({ embeds: [embed] });
                        } else {
                            const embed = {
                                color: '#FF0000',
                                title: `Purchase Error`,
                                description: `You don't have enough coins in your wallet to buy that item, maybe withdraw some from your bank?\n\n**Item:** ${item.icon} \`${item.item}\`\n**Purchase Cost:** ❀ \`${total_price.toLocaleString()}\`\n**Current Wallet:** \`${profileData.coins.toLocaleString()}\`\n**Current Net Balance:** ❀ \`${netBal.toLocaleString()}\``,
                                timestamp: new Date(),
                            };
                
                            return message.reply({ embeds: [embed] });
                        }
                    } else {     
                        const params = {
                            userId: message.author.id,
                        }
                
                        inventoryModel.findOne(params, async(err, data) => {

                            if(data) {
                                const hasItem = Object.keys(data.inventory).includes(item.item);
                                if(!hasItem) {
                                    data.inventory[item.item] = buy_amount;
                                } else {
                                    data.inventory[item.item] = data.inventory[item.item] + buy_amount;
                                }
                                await inventoryModel.findOneAndUpdate(params, data);
                
                                const response = await profileModel.findOneAndUpdate(
                                    {
                                        userId: message.author.id,
                                    },
                                    {
                                        $inc: {
                                            coins: -total_price,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );
                            } else {
                                new inventoryModel({
                                    userId: message.author.id,
                                    inventory: {
                                        [item.item]: buy_amount
                                    }
                                }).save();
                
                                const response = await profileModel.findOneAndUpdate(
                                    {
                                        userId: message.author.id,
                                    },
                                    {
                                        $inc: {
                                            coins: -total_price,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );
                            }
                            const embed = {
                                color: '#A8FE97',
                                title: `Purchase Receipt`,
                                description: `**Item:** ${item.icon} \`${item.item}\`\n**Price:** ❀ \`${total_price.toLocaleString()}\`\n**Quantity:** \`${buy_amount.toLocaleString()}\``,
                                timestamp: new Date(),
                            };
                
                            return message.reply({ embeds: [embed] });
                        })
                    }
                } else {
                    const params = {
                        userId: message.author.id,
                    }
            
                    inventoryModel.findOne(params, async(err, data) => {
                        if(data) {
                            const hasItem = Object.keys(data.inventory).includes(item.item);
                            if(!hasItem) {
                                data.inventory[item.item] = 1;
                            } else {
                                data.inventory[item.item]++;
                            }
                            await inventoryModel.findOneAndUpdate(params, data);
            
                            const response = await profileModel.findOneAndUpdate(
                                {
                                    userId: message.author.id,
                                },
                                {
                                    $inc: {
                                        coins: -item.price,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );
                        } else {
                            new inventoryModel({
                                userId: message.author.id,
                                inventory: {
                                    [item.item]: 1
                                }
                            }).save();
            
                            const response = await profileModel.findOneAndUpdate(
                                {
                                    userId: message.author.id,
                                },
                                {
                                    $inc: {
                                        coins: -item.price,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );
                        }
                        const embed = {
                            color: '#A8FE97',
                            title: `Purchase Receipt`,
                            description: `**Item:** ${item.icon} \`${item.item}\`\n**Price:** ❀ \`${item.price.toLocaleString()}\`\n**Quantity:** \`${1}\``,
                            timestamp: new Date(),
                        };
            
                        return message.reply({ embeds: [embed] });
                    })
                }
            }
        }
        
    }
}