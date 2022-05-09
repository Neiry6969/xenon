const { MessageActionRow, MessageButton } = require('discord.js')

const inventoryModel = require("../models/inventorySchema");
const allItems = require("../data/all_items");
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "gift",
    aliases: ['yeet', 'send'],
    cooldown: 10,
    minArgs: 0,
    maxArgs: 2,
    description: "gift items to other users.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const expectedsyntax = `**Expected Syntax:** \`xe gift [user] [item] [amount]\``;
        const getitem = args[1]?.toLowerCase();
        let amount = args[2]?.toLowerCase();
        const target = message.mentions.users.first()

        const params = {
            userId: message.author.id,
        }

        inventoryModel.findOne(params, async(err, data) => {
            if(!target) {
                const embed = {
                    color: '#FF0000',
                    title: `Gift Error`,
                    description: `Mention a user to gift items with!\n${expectedsyntax}`,
                };
                return message.reply({ embeds: [embed] });
            } else if (target.id === message.author.id) {
                const embed = {
                    color: '#FF0000',
                    title: `Gift Error`,
                    description: `You can't gift items to yourself you already have it. Well thats depressing.\n**Expected Syntax:** \`xe gift [user] [amount] [item]\``,
                };
                return message.reply({ embeds: [embed] });
            }

            if(!data) {
                return message.reply("You got nothing to gift.");
            } 
            

            if(!getitem) {
                const embed = {
                    color: '#FF0000',
                    title: `Gift Error`,
                    description: `Specify the item to gift.\n${expectedsyntax}`,
                };
    
                return message.reply({ embeds: [embed] });
            }

            if(getitem.length < 3) {
                return message.reply(`\`${getitem}\` is not even an existing item.`);
            } else if (getitem.length > 250) {
                return message.reply(`Couldn't find that item because you typed passed the limit of 250 characters.`);
            }
            const itemssearch = allItems.filter((value) => {
                return (
                    value.item.includes(getitem)
                )
            })
    
            const item = itemssearch[0]
    
            
            if(item === undefined) {
                const embed = {
                    color: '#FF0000',
                    title: `Gift Error`,
                    description: `\`${getitem}\` is not existent item.\n${expectedsyntax}`,
                };
    
                return message.reply({ embeds: [embed] });
            }
    

            if(amount === 'max' || amount === 'all') {
                amount = data.inventory[item.item];
            } else if(amount === 'half') {
                amount = Math.floor(data.inventory[item.item] / 2)
            } else if(letternumbers.find((val) => val.letter === amount.slice(-1))) {
                if(parseInt(amount.slice(0, -1))) {
                    const number = parseFloat(amount.slice(0, -1));
                    const numbermulti = letternumbers.find((val) => val.letter === amount.slice(-1)).number;
                    amount = number * numbermulti;
                } else {
                    amount = null;
                }
            } else {
                amount = parseInt(amount)
            }

            if(amount === 0) {
                const embed = {
                    color: '#FF0000',
                    title: `Gift Error`,
                    description: `Ok so you want to gift nothing, pretend you did that in your mind.\n${expectedsyntax}`,
                };
                return message.reply({ embeds: [embed] });
            } else if (!amount) {
                const embed = {
                    color: '#FF0000',
                    title: `Gift Error`,
                    description: `Specify the amount of that item you want to gift.\n${expectedsyntax}`,
                };
                return message.reply({ embeds: [embed] })
            } else if(amount < 0 || amount % 1 != 0) {
                return message.reply("You can only gift a whole number of an item.");
            } else if(amount > data.inventory[item.item]) {
                return message.reply(`You don't have that amount of that item to share. You have: \`${data.inventory[item.item]?.toLocaleString()}\` ${item.icon} \`${item.item}\``);
            } 

            if(!data.inventory[item.item] || data.inventory[item.item] === 0) {
                return message.reply(`You have 0 ${item.icon} \`${item.item}\`, so how are you going to gift that?`);
            } 
  

            const params_user = {
                userId: message.author.id,
            }
            inventoryModel.findOne(params_user, async(err, data) => {
                data.inventory[item.item] = data.inventory[item.item] - amount;
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
                description: `<@${message.author.id}>, do you want to gift \`${amount.toLocaleString()}\` ${item.icon} **${item.item}** to <@${target.id}>?`,
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
                                data.inventory[item.item] = amount;
                            } else {
                                data.inventory[item.item] = data.inventory[item.item] + amount;
                            }
                            await inventoryModel.findOneAndUpdate(params_target, data);
                        } else {
                            new inventoryModel({
                                userId: target.id,
                                inventory: {
                                    [item.item]: amount
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
                                value: `\`${amount.toLocaleString()}\``,
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
                        data.inventory[item.item] = data.inventory[item.item] + amount;
                        await inventoryModel.findOneAndUpdate(params, data);
    
                    })
    
                    const embed = {
                        color: '#FF0000',
                        author: {
                            name: `_____________`,
                            icon_url: `${message.author.displayAvatarURL()}`,
                        },
                        title: `Transaction cancelled`,
                        description: `<@${message.author.id}>, do you want to gift \`${amount.toLocaleString()}\` ${item.icon} **${item.item}** to <@${target.id}>?\nI guess not...`,
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
                        data.inventory[item.item] = data.inventory[item.item] + amount;
                        await inventoryModel.findOneAndUpdate(params, data);
    
                    })
    
                    const embed = {
                        color: '#FF0000',
                        author: {
                            name: `_____________`,
                            icon_url: `${message.author.displayAvatarURL()}`,
                        },
                        title: `Transaction timeout`,
                        description: `<@${message.author.id}>, do you want to gift \`${amount.toLocaleString()}\` ${item.icon} **${item.item}** to <@${target.id}>?\nI guess not...`,
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
        })
        

    }
}