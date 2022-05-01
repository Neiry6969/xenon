const { MessageActionRow, MessageButton } = require('discord.js')

const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const allItems = require('../data/all_items');
const letternumbers = require('../reference/letternumber');


module.exports = {
    name: 'buy',
    cooldown: 5,
    description: "buy items.",
    minArgs: 0,
    maxArgs: 1,
    async execute(message, args, cmd, client, Discord, profileData) {
        let buyamount = args[1]?.toLowerCase();
        const getitem = args[0]?.toLowerCase();

        if(!getitem) {
            return message.reply("Please specify an item to buy.");
        }

        const validItem = !!allItems.find((val) => (val.item.toLowerCase() === getitem ||  val.aliases.includes(getitem)))

        if(!validItem) {
            return message.reply(`\`${getitem}\` is not existent item.`);
        }

        const item = allItems.find((val) => (val.item.toLowerCase()) === getitem || val.aliases.includes(getitem));

        if(item.price === 'unable to be bought') {
            const embed = {
                color: '#FF0000',
                title: `Buy Error`,
                description: `This item is unable to be bought since it is not in the Xenon shop.\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\``,
            };
            return message.reply({ embeds: [embed] });
        } 

        if(buyamount === 'max' || buyamount === 'all') {
            if(profileData.coins < item.value) {
                return message.reply(`You need atleast ❀ \`${item.value}\` in your wallet to buy a ${item.icon} \`${item.item}\``);
            } else {
                buyamount = Math.floor(profileData.coins / item.value)
            }
        } else if(!buyamount) {
            buyamount = 1
        } else if(letternumbers.find((val) => val.letter === buyamount.slice(-1))) {
            if(parseInt(buyamount.slice(0, -1))) {
                const number = parseFloat(buyamount.slice(0, -1));
                const numbermulti = letternumbers.find((val) => val.letter === buyamount.slice(-1)).number;
                buyamount = number * numbermulti;
            } else {
                buyamount = null;
            }
        } else {
            buyamount = parseInt(buyamount)
        }   

        const totalprice = item.value * buyamount;

        if(!buyamount || buyamount < 0) {
            return message.reply("You can only buy a whole number of items.");
        } else if (buyamount === 0) {
            return message.reply("So you want to buy nothing, why bother?");
        } else if (profileData.coins < totalprice) {
            const embed = {
                color: '#FF0000',
                title: `Purchase Error`,
                description: `You don't have enough coins in your wallet to buy that many of item.\n\n**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Purchase Cost:** ❀ \`${totalprice.toLocaleString()}\`\n**Current Wallet:** ❀ \`${profileData.coins.toLocaleString()}\`\n**Current Bank:** ❀ \`${profileData.bank.toLocaleString()}\``,
                timestamp: new Date(),
            };

            return message.reply({ embeds: [embed] });
        }

        if(totalprice >= 1000000) {
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
                    title: `Confirm transaction`,
                    description: `<@${message.author.id}>, are you sure you want to buy ${item.icon} \`${item.item}\` x\`${buyamount.toLocaleString()}\`\n**Total Price:** ❀ \`${totalprice.toLocaleString()}\``,
                    timestamp: new Date(),
                };
            const buy_msg = await message.reply({ embeds: [embed], components: [row] });
            const collector = buy_msg.createMessageComponentCollector({ time: 20 * 1000 });

        collector.on('collect', async (button) => {
            if(button.user.id != message.author.id) {
                return button.reply({
                    content: 'This is not for you.',
                    ephemeral: true,
                })
            } 

            button.deferUpdate()

            if(button.customId === "confirm") {
                const params = {
                    userId: message.author.id,
                }
        
                inventoryModel.findOne(params, async(err, data) => {
                    if(data) {
                        const hasItem = Object.keys(data.inventory).includes(item.item);
                        if(!hasItem) {
                            data.inventory[item.item] = buyamount;
                        } else {
                            data.inventory[item.item] = data.inventory[item.item] + buyamount;
                        }
                        await inventoryModel.findOneAndUpdate(params, data);
        
                        const response = await profileModel.findOneAndUpdate(
                            {
                                userId: message.author.id,
                            },
                            {
                                $inc: {
                                    coins: -totalprice,
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
                                [item.item]: buyamount
                            }
                        }).save();
        
                        const response = await profileModel.findOneAndUpdate(
                            {
                                userId: message.author.id,
                            },
                            {
                                $inc: {
                                    coins: -totalprice,
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
                        description: `**Item:** ${item.icon} \`${item.item}\`\n**Price:** ❀ \`${totalprice.toLocaleString()}\`\n**Quantity:** \`${buyamount.toLocaleString()}\``,
                        timestamp: new Date(),
                    };

                    confirm
                        .setDisabled()
                        .setStyle("SUCCESS")

                    cancel
                        .setDisabled()
                        .setStyle("SECONDARY")

                    return buy_msg.edit({
                        embeds: [embed],
                        components: [row]
                    })
                })
            
            } else if(button.customId === "cancel") {
                const embed = {
                    color: '#FF0000',
                    title: `Transaction cancelled`,
                    description: `<@${message.author.id}>, confirm that want to buy the following:\n**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Total Price:** ❀ \`${totalprice.toLocaleString()}\`\nI guess not. Come back later if you change your mind.`,
                    timestamp: new Date(),
                };
                
                confirm
                    .setDisabled()
                    .setStyle("SECONDARY")

                cancel.setDisabled()
                
                return buy_msg.edit({
                    embeds: [embed],
                    components: [row]
                })
        
            }
            
        });

        collector.on('end', collected => {
            if(collected.size < 0) {
                const embed = {
                    color: '#FF0000',
                    author: {
                        name: `_____________`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                    },
                    title: `Transaction timeout`,
                    description: `<@${message.author.id}>, confirm that want to buy the following:\n**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Total Price:** ❀ \`${totalprice.toLocaleString()}\`\nI guess not. Come back later if you change your mind.`,
                    timestamp: new Date(),
                };
                
                confirm
                    .setDisabled()
                    .setStyle("SECONDARY")

                cancel
                    .setDisabled()
                    .setStyle("SECONDARY")
                
                return buy_msg.edit({
                    embeds: [embed],
                    components: [row]
                })
            }
        });
            
        } else {
            const params = {
                userId: message.author.id,
            }
    
            inventoryModel.findOne(params, async(err, data) => {
                if(data) {
                    const hasItem = Object.keys(data.inventory).includes(item.item);
                    if(!hasItem) {
                        data.inventory[item.item] = buyamount;
                    } else {
                        data.inventory[item.item] = data.inventory[item.item] + buyamount;
                    }
                    await inventoryModel.findOneAndUpdate(params, data);
    
                    const response = await profileModel.findOneAndUpdate(
                        {
                            userId: message.author.id,
                        },
                        {
                            $inc: {
                                coins: -totalprice,
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
                            [item.item]: buyamount
                        }
                    }).save();
    
                    const response = await profileModel.findOneAndUpdate(
                        {
                            userId: message.author.id,
                        },
                        {
                            $inc: {
                                coins: -totalprice,
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
                    description: `**Item:** ${item.icon} \`${item.item}\`\n**Price:** ❀ \`${totalprice.toLocaleString()}\`\n**Quantity:** \`${buyamount.toLocaleString()}\``,
                    timestamp: new Date(),
                };
    
                return message.reply({ embeds: [embed] });
            })    
        }
    }
}