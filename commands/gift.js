const { MessageActionRow, MessageButton } = require('discord.js')

const inventoryModel = require("../models/inventorySchema");
const allItems = require("../data/all_items");

module.exports = {
    name: "gift",
    aliases: ['yeet', 'send'],
    cooldown: 10,
    minArgs: 0,
    maxArgs: 2,
    description: "gift items to other users.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const target = message.mentions.users.first()
        const get_amount = parseInt(args[1]);
        const getItem = args[2];

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
        } else if (!getItem) {
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
            const validItem = !!allItems.find((val) => (val.item.toLowerCase() === getItem ||  val.aliases.includes(getItem)));

            if(!validItem) {
                return message.reply(`\`${getItem}\` is not existent or not buyable.`);
            } else {
                const item = allItems.find((val) => (val.item.toLowerCase()) === getItem || val.aliases.includes(getItem));

                const params = {
                    userId: message.author.id,
                }
        
                inventoryModel.findOne(params, async(err, data) => {
                    if(!data) {
                        return message.reply("You got nothing to share.");
                    } else if (data) {
                        if(!data.inventory[item.item] || data.inventory[item.item] === 0) {
                            return message.reply(`You have 0 ${item.icon} \`${item.item}\`, so how are you going to gift that?`);
                        } else if(get_amount > data.inventory[item.item]) {
                            const embed = {
                                color: '#FF0000',
                                title: `Gift Error`,
                                description: `You do not have enough of that item to gift that amount!\n**Item:** ${item.icon} ${item.item}\n**Amount Possessed:** \`${data.inventory[item.item]?.toLocaleString()}\``,
                            };
                            return message.reply({ embeds: [embed] });
                       
                        } else {                               
                            const params_user = {
                                userId: message.author.id,
                            }
                            inventoryModel.findOne(params_user, async(err, data) => {
                                data.inventory[item.item] = data.inventory[item.item] - get_amount;
                                await inventoryModel.findOneAndUpdate(params, data);

                            })

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
                                title: `Confirm transaction`,
                                description: `<@${message.author.id}>, do you want to gift \`${get_amount.toLocaleString()}\` ${item.icon} **${item.item}** to <@${target.id}>?`,
                                timestamp: new Date(),
                            };
                            const gift_msg = await message.reply({ embeds: [embed], components: [row] });

                            const collector = gift_msg.createMessageComponentCollector({ time: 20 * 1000 });

                            collector.on('collect', async (button) => {
                                if(button.user.id != message.author.id) {
                                    return button.reply({
                                        content: 'This is not for you.',
                                        ephemeral: true,
                                    })
                                } 
                                
                                button.deferUpdate()

                                if(button.customId === "confirm") {

                                    const params_target = {
                                        userId: target.id,
                                    }

        
                                    inventoryModel.findOne(params_target, async(err, data) => {
                                        if(data) {
                                            const hasItem = Object.keys(data.inventory).includes(item.item);
                                            if(!hasItem) {
                                                data.inventory[item.item] = get_amount;
                                            } else {
                                                data.inventory[item.item] = data.inventory[item.item] + get_amount;
                                            }
                                            await inventoryModel.findOneAndUpdate(params_target, data);
                                        } else {
                                            new inventoryModel({
                                                userId: target.id,
                                                inventory: {
                                                    [item.item]: get_amount
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
                                                value: `${item.icon} \`${item.item}\``,
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

                                    confirm
                                        .setDisabled()
                                        .setStyle("SUCCESS")

                                    cancel
                                        .setDisabled()
                                        .setStyle("SECONDARY")

                                    gift_msg.edit({
                                        embeds: [embed],
                                        components: [row]
                                    })
                                
                                } else if(button.customId === "cancel") {
                                                                
                                    const params_user = {
                                        userId: message.author.id,
                                    }
                                    inventoryModel.findOne(params_user, async(err, data) => {
                                        data.inventory[item.item] = data.inventory[item.item] + get_amount;
                                        await inventoryModel.findOneAndUpdate(params, data);
        
                                    })

                                    const embed = {
                                        color: '#FF0000',
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${message.author.displayAvatarURL()}`,
                                        },
                                        title: `Transaction cancelled`,
                                        description: `<@${message.author.id}>, do you want to gift \`${get_amount.toLocaleString()}\` ${item.icon} **${item.item}** to <@${target.id}>?\nI guess not...`,
                                        timestamp: new Date(),
                                    };
                                    
                                    confirm
                                        .setDisabled()
                                        .setStyle("SECONDARY")

                                    cancel.setDisabled()
                                    
                                    gift_msg.edit({
                                        embeds: [embed],
                                        components: [row]
                                    })
                            
                                }
                                
                            });

                            collector.on('end', collected => {
                                if(collected.size > 0) {

                                } else {
                                    const params_user = {
                                        userId: message.author.id,
                                    }
                                    inventoryModel.findOne(params_user, async(err, data) => {
                                        data.inventory[item.item] = data.inventory[item.item] + get_amount;
                                        await inventoryModel.findOneAndUpdate(params, data);
        
                                    })

                                    const embed = {
                                        color: '#FF0000',
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${message.author.displayAvatarURL()}`,
                                        },
                                        title: `Transaction timeout`,
                                        description: `<@${message.author.id}>, do you want to gift \`${get_amount.toLocaleString()}\` ${item.icon} **${item.item}** to <@${target.id}>?\nI guess not...`,
                                        timestamp: new Date(),
                                    };
                                    
                                    confirm
                                        .setDisabled()
                                        .setStyle("SECONDARY")

                                    cancel
                                        .setDisabled()
                                        .setStyle("SECONDARY")
                                    
                                    gift_msg.edit({
                                        embeds: [embed],
                                        components: [row]
                                    })
                                }
                            });
                            
                         

                        }
                    }             
                })
            }
        } 

    }
}