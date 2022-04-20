const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const allItems = require('../items/all_items');

module.exports = {
    name: "sell",
    cooldown: 10,
    minArgs: 0,
    maxArgs: 1,
    description: "sell an item.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const expectedArgs = `**Expected Syntax:** \`xe sell [item] [amount]\``;
        const getItem = args[0]?.toLowerCase();
        const getAmount = parseInt(args[1]);
        const max_amount = args[1]?.toLowerCase();

        if(!getItem) {
            const embed = {
                color: '#FF0000',
                title: `Sell Error`,
                description: `Specify the item to sell.\n${expectedArgs}`,
            };
            return message.reply({ embeds: [embed] });
        } else if (!getAmount) {
            if(max_amount === "max" || max_amount === "all") {
                const validItem = !!allItems.find((val) => (val.item.toLowerCase() === getItem ||  val.aliases.includes(getItem)));

                if(!validItem) {
                    return message.reply(`\`${getItem}\` is a non-existent item.`);
                } else {
                    const item = allItems.find((val) => (val.item.toLowerCase()) === getItem || val.aliases.includes(getItem));

                    if(item.sell === "unable to be sold") {
                        const embed = {
                            color: '#FF0000',
                            title: `Sell Error`,
                            description: `This item is unable to be sold since it is a collectable.\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\``,
                        };
                        return message.reply({ embeds: [embed] });
                    } else {
                        const params_user = {
                            userId: message.author.id
                        }

                        inventoryModel.findOne(params_user, async(err, data) => {
                            const amount = data.inventory[item.item];

                            let ownedAmount;

                            if(!amount) {
                                ownedAmount = 0;
                            } else {
                                ownedAmount = data.inventory[item.item];
                            }

                            if(amount <= 0 || !amount) {
                                const embed = {
                                    color: '#FF0000',
                                    title: `Sell Error`,
                                    description: `You don't have any of this item to sell.\n**Item:** ${item.icon} \`${item.item}\`\n**Owned amount:** \`${ownedAmount.toLocaleString()}\``,
                                };
                                return message.reply({ embeds: [embed] });
                            } else {
                                const amount_gained = amount * item.sell

                                data.inventory[item.item] = 0;
                    
                                await inventoryModel.findOneAndUpdate(params_user, data);

                                const response = await profileModel.findOneAndUpdate(params_user,
                                    {
                                        $inc: {
                                            coins: amount_gained,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );
                                const embed = {
                                    color: '#00FF00',
                                    title: `Sell Receipt`,
                                    description: `**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${ownedAmount.toLocaleString()}\`\n**Sold For:** ❀ \`${amount_gained.toLocaleString()}\`\n**Each Sold For:** ❀ \`${item.sell.toLocaleString()}\``,
                                };
                                return message.reply({ embeds: [embed] });
                            }
                        })
                    }

                }
            } else {
                const validItem = !!allItems.find((val) => (val.item.toLowerCase() === getItem ||  val.aliases.includes(getItem)));

                if(!validItem) {
                    return message.reply(`\`${getItem}\` is a non-existent item.`);
                } else {
                    const item = allItems.find((val) => (val.item.toLowerCase()) === getItem || val.aliases.includes(getItem));

                    if(item.sell === "unable to be sold") {
                        const embed = {
                            color: '#FF0000',
                            title: `Sell Error`,
                            description: `This item is unable to be sold since it is a collectable.\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\``,
                        };
                        return message.reply({ embeds: [embed] });
                    } else {
                        const params_user = {
                            userId: message.author.id
                        }

                        inventoryModel.findOne(params_user, async(err, data) => {
                            const default_amount = 1;
                            let ownedAmount;

                            if(!data.inventory[item.item]) {
                                ownedAmount = 0;
                            } else {
                                ownedAmount = data.inventory[item.item];
                            }

                            if(default_amount > ownedAmount) {
                                const embed = {
                                    color: '#FF0000',
                                    title: `Sell Error`,
                                    description: `You don't have \`${default_amount.toLocaleString()}\` of this item to sell.\n**Item:** ${item.icon} \`${item.item}\`\n**Owned amount:** \`${ownedAmount.toLocaleString()}\``,
                                };
                                return message.reply({ embeds: [embed] });
                            } else {
                                const amount_gained = default_amount * item.sell;

                                data.inventory[item.item] = data.inventory[item.item] - default_amount;
                    
                                await inventoryModel.findOneAndUpdate(params_user, data);

                                const response = await profileModel.findOneAndUpdate(params_user,
                                    {
                                        $inc: {
                                            coins: amount_gained,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );
                                const embed = {
                                    color: '#00FF00',
                                    title: `Sell Receipt`,
                                    description: `**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${default_amount.toLocaleString()}\`\n**Sold For:** ❀ \`${amount_gained.toLocaleString()}\`\n**Each Sold For:** ❀ \`${item.sell.toLocaleString()}\``,
                                };
                                return message.reply({ embeds: [embed] });
                            }
                        })
                    }

                }
            }
        } else {
            const validItem = !!allItems.find((val) => (val.item.toLowerCase() === getItem ||  val.aliases.includes(getItem)));

            if(!validItem) {
                return message.reply(`\`${getItem}\` is a non-existent item.`);
            } else if (getAmount < 0) {
                const embed = {
                    color: '#FF0000',
                    title: `Sell Error`,
                    description: `You can only sell a whole number of an item.\n${expectedArgs}`,
                };
                return message.reply({ embeds: [embed] });
            } else if (getAmount === 0) {
                return message.reply(`So you want to sell 0 amount of this item, why bother me.`)
            } else {
                const item = allItems.find((val) => (val.item.toLowerCase()) === getItem || val.aliases.includes(getItem));

                if(item.sell === "unable to be sold") {
                    const embed = {
                        color: '#FF0000',
                        title: `Sell Error`,
                        description: `This item is unable to be sold since it is a collectable.\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\``,
                    };
                    return message.reply({ embeds: [embed] });
                } else {
                    const params_user = {
                        userId: message.author.id
                    }

                    inventoryModel.findOne(params_user, async(err, data) => {
                        let ownedAmount;

                        if(!data.inventory[item.item]) {
                            ownedAmount = 0;
                        } else {
                            ownedAmount = data.inventory[item.item];
                        }

                        if(getAmount > ownedAmount) {
                            const embed = {
                                color: '#FF0000',
                                title: `Sell Error`,
                                description: `You don't have \`${getAmount.toLocaleString()}\` of this item to sell.\n**Item:** ${item.icon} \`${item.item}\`\n**Owned amount:** \`${ownedAmount.toLocaleString()}\``,
                            };
                            return message.reply({ embeds: [embed] });
                        } else {
                            const amount_gained = getAmount * item.sell;

                            data.inventory[item.item] = data.inventory[item.item] - getAmount;
                
                            await inventoryModel.findOneAndUpdate(params_user, data);

                            const response = await profileModel.findOneAndUpdate(params_user,
                                {
                                    $inc: {
                                        coins: amount_gained,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );
                            const embed = {
                                color: '#00FF00',
                                title: `Sell Receipt`,
                                description: `**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${getAmount.toLocaleString()}\`\n**Sold For:** ❀ \`${amount_gained.toLocaleString()}\`\n**Each Sold For:** ❀ \`${item.sell.toLocaleString()}\``,
                            };
                            return message.reply({ embeds: [embed] });
                        }
                    })
                }

            }

        }
    }

}