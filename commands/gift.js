const inventoryModel = require("../models/inventorySchema");
const allItems = require("../items/all_items");

module.exports = {
    name: "gift",
    aliases: ['yeet', 'send'],
    cooldown: 5,
    minArgs: 0,
    maxArgs: 2,
    description: "gift items to other users.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const target = message.mentions.users.first()
        const get_amount = parseInt(args[1]);
        const get_item = args[2];

        if(!target) {
            const embed = {
                color: '#FF0000',
                title: `Gift Error`,
                description: `Mention a user to gift items with!\n**Expected Syntax:** \`xe gift [user] [amount] [item]\``,
            };
            return message.reply({ embeds: [embed] });
        } else if(get_amount === 0) {
            const embed = {
                color: '#FF0000',
                title: `Gift Error`,
                description: `Ok so you want to gift nothing.\n**Expected Syntax:** \`xe gift [user] [amount] [item]\``,
            };
            return message.reply({ embeds: [embed] });
        } else if (!get_amount || get_amount < 0) {
            const embed = {
                color: '#FF0000',
                title: `Gift Error`,
                description: `You can only gift a whole number of an item!\n**Expected Syntax:** \`xe gift [user] [amount] [item]\``,
            };
            return message.reply({ embeds: [embed] });
        } else if (!get_item) {
            const embed = {
                color: '#FF0000',
                title: `Gift Error`,
                description: `Specify an item to share dumb!\n**Expected Syntax:** \`xe gift [user] [amount] [item]\``,
            };
            return message.reply({ embeds: [embed] });
        } else if (target.id === message.author.id) {
            const embed = {
                color: '#FF0000',
                title: `Gift Error`,
                description: `You can't gift items to yourself you already have it. Well thats depressing.\n**Expected Syntax:** \`xe gift [user] [amount] [item]\``,
            };
            return message.reply({ embeds: [embed] });
        } else {   
            const validItem = !!allItems.find((val) => (val.item.toLowerCase() === get_item));

            if(!validItem) {
                return message.reply(`\`${get_item}\` is not existent or not buyable.`);
            } else {
                const itemIcon = allItems.find((val) => (val.item.toLowerCase()) === get_item).icon;

                const params = {
                    userId: message.author.id,
                }
        
                inventoryModel.findOne(params, async(err, data) => {
                    if(!data) {
                        return message.reply("You got nothing to share.");
                    } else if (data) {
                        if(!data.inventory[get_item] || data.inventory[get_item] === 0) {
                            return message.reply(`You have 0 \`${get_item}\`, so how are you going to gift that?`);
                        } else if(get_amount > data.inventory[get_item]) {
                            const embed = {
                                color: '#FF0000',
                                title: `Gift Error`,
                                description: `You do not have enought of that item to gift that amount!\n**Item:** ${itemIcon} ${get_item}\n**Amount Possessed:** \`${data.inventory[get_item]?.toLocaleString()}\``,
                            };
                            return message.reply({ embeds: [embed] });
                       
                        } else {
                            const params_user = {
                                userId: message.author.id,
                            }
                            const params_target = {
                                userId: target.id,
                            }
                    
                    
                            inventoryModel.findOne(params_user, async(err, data) => {
                                data.inventory[get_item] = data.inventory[get_item] - get_amount;
                                await inventoryModel.findOneAndUpdate(params, data);
                            })

                            inventoryModel.findOne(params_target, async(err, data) => {
                                if(data) {
                                    const hasItem = Object.keys(data.inventory).includes(get_item);
                                    if(!hasItem) {
                                        data.inventory[get_item] = get_amount;
                                    } else {
                                        data.inventory[get_item] = data.inventory[get_item] + get_amount;
                                    }
                                    await inventoryModel.findOneAndUpdate(params_target, data);
                                } else {
                                    new inventoryModel({
                                        userId: target.id,
                                        inventory: {
                                            [get_item]: get_amount
                                        }
                                    }).save();
                                }

                             
                            })
                            
                                
                            const embed = {
                                color: '#A8FE97',
                                title: `Gift Successful`,
                                description: `<@${message.author.id}> gifted items to <@${target.id}>, here are the details:`,
                                fields: [
                                    {
                                        name: 'Item',
                                        value: `${itemIcon} \`${get_item}\``,
                                        inline: true,
                                    },
                                    {
                                        name: 'Quantity',
                                        value: `\`${get_amount.toLocaleString()}\``,
                                        inline: true,
                                    },
                                ],
                                timestamp: new Date(),
                            };
                            
                            return message.reply({ embeds: [embed] });

                        }
                    }             
                })
            }
        } 

    }
}