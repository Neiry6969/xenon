const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const shopItems = require('../items/shop_items');

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

        const validItem = !!shopItems.find((val) => (val.item.toLowerCase() === getItem));

        if(!validItem) {
            return message.reply(`\`${getItem}\` is not existent or not buyable.`);
        }


        const item = shopItems.find((val) => (val.item.toLowerCase()) === getItem).item;
        const itemPrice = shopItems.find((val) => (val.item.toLowerCase()) === getItem).price;
        const itemIcon = shopItems.find((val) => (val.item.toLowerCase()) === getItem).icon;

        if(profileData.coins < itemPrice) {
            if(netBal < itemPrice) {
                const embed = {
                    color: '#FF0000',
                    title: `Purchase Error`,
                    description: `You don't have enough coins in your bank or wallet to buy that item.\n\n**Item:** ${itemIcon} \`${item}\`\n**Item Cost:** ❀ \`${itemPrice.toLocaleString()}\`\n**Current Net Balance:** ❀ \`${netBal.toLocaleString()}\``,
                    timestamp: new Date(),
                };
    
                return message.reply({ embeds: [embed] });
            } else {
                const embed = {
                    color: '#FF0000',
                    title: `Purchase Error`,
                    description: `You don't have enough coins in your wallet to buy that item, maybe withdraw some from your bank?\n\n**Item:** ${itemIcon} \`${item}\`\n**Item Cost:** ❀ \`${itemPrice.toLocaleString()}\`\n**Current Net Balance:** ❀ \`${netBal.toLocaleString()}\``,
                    timestamp: new Date(),
                };
    
                return message.reply({ embeds: [embed] });
            }
        } 


        if(itemAmount === "max" || itemAmount === "all") {
            const maxItemAmmount = Math.floor(profileData.coins / itemPrice);
            const price = maxItemAmmount * itemPrice;
            const params = {
                userId: message.author.id,
            }
    
            inventoryModel.findOne(params, async(err, data) => {
                if(data) {
                    const hasItem = Object.keys(data.inventory).includes(getItem);
                    if(!hasItem) {
                        data.inventory[getItem] = maxItemAmmount;
                    } else {
                        data.inventory[getItem] = data.inventory[getItem] + maxItemAmmount;
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
                            [getItem]: maxItemAmmount
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
                    description: `**Item:** ${itemIcon} \`${item}\`\n**Price:** ❀ \`${price.toLocaleString()}\`\n**Quantity:** \`${maxItemAmmount}\``,
                    timestamp: new Date(),
                };
    
                return message.reply({ embeds: [embed] });
            })
        } else if (parseInt(itemAmount)){
            const buy_amount = parseInt(itemAmount)
            const total_price = buy_amount * itemPrice;
            
            if(total_price > profileData.coins) {
                if(netBal < total_price) {
                    const embed = {
                        color: '#FF0000',
                        title: `Purchase Error`,
                        description: `You don't have enough coins in your bank or wallet to buy that item.\n\n**Item:** ${itemIcon} \`${item}\`\n**Item Cost:** ❀ \`${total_price.toLocaleString()}\`\n**Current Net Balance:** ❀ \`${netBal.toLocaleString()}\``,
                        timestamp: new Date(),
                    };
        
                    return message.reply({ embeds: [embed] });
                } else {
                    const embed = {
                        color: '#FF0000',
                        title: `Purchase Error`,
                        description: `You don't have enough coins in your wallet to buy that item, maybe withdraw some from your bank?\n\n**Item:** ${itemIcon} \`${item}\`\n**Item Cost:** ❀ \`${itemPrice.toLocaleString()}\`\n**Current Net Balance:** ❀ \`${netBal.toLocaleString()}\``,
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
                        const hasItem = Object.keys(data.inventory).includes(getItem);
                        if(!hasItem) {
                            data.inventory[getItem] = buy_amount;
                        } else {
                            data.inventory[getItem] = data.inventory[getItem] + buy_amount;
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
                                [getItem]: buy_amount
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
                        description: `**Item:** ${itemIcon} \`${item}\`\n**Price:** ❀ \`${total_price.toLocaleString()}\`\n**Quantity:** \`${buy_amount}\``,
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
                    const hasItem = Object.keys(data.inventory).includes(getItem);
                    if(!hasItem) {
                        data.inventory[getItem] = 1;
                    } else {
                        data.inventory[getItem]++;
                    }
                    await inventoryModel.findOneAndUpdate(params, data);
    
                    const response = await profileModel.findOneAndUpdate(
                        {
                            userId: message.author.id,
                        },
                        {
                            $inc: {
                                coins: -itemPrice,
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
                            [getItem]: 1
                        }
                    }).save();
    
                    const response = await profileModel.findOneAndUpdate(
                        {
                            userId: message.author.id,
                        },
                        {
                            $inc: {
                                coins: -itemPrice,
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
                    description: `**Item:** ${itemIcon} \`${item}\`\n**Price:** ❀ \`${itemPrice.toLocaleString()}\`\n**Quantity:** \`${1}\``,
                    timestamp: new Date(),
                };
    
                return message.reply({ embeds: [embed] });
            })
        }


        
    }
}