const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')

const economyModel = require("../models/economySchema");
const allItems = require("../data/all_items");
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "use",
    aliases: [],
    cooldown: 5,
    minArgs: 0,
    maxArgs: 1,
    description: "use useable items.",
    async execute(message, args, cmd, client, Discord, userData) {
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

        if(userData) {
            const hasItem = Object.keys(userData.inventory).includes(item.item);
            if(!hasItem || userData.inventory[item.item] === 0) {
                const embed = {
                    color: '#FF0000',
                    title: `Use Error`,
                    description: `You don't own this item.\n**Item:** ${item.icon} \`${item.item}\``,
                    timestamp: new Date(),
                };
    
                return message.reply({ embeds: [embed] });
            } else {
                if(useamount === 'max' || useamount === 'all') {
                    if(userData.inventory[item.item] <= 0) {
                        const embed = {
                            color: '#FF0000',
                            title: `Use Error`,
                            description: `You don't have \`${useamount.toLocaleString()}\` of this item to use.\n**Item:** ${item.icon} \`${item.item}\`\n**Amount Owned:** \`${userData.inventory[item.item]?.toLocaleString()}\``,
                            timestamp: new Date(),
                        };

                        return message.reply({ embeds: [embed] });
                    } else {
                        useamount = userData.inventory[item.item]
                    }
                } else if(useamount === 'half') {
                    useamount = Math.floor(userData.inventory[item.item] / 2)
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
                } else if (userData.inventory[item.item] < useamount) {
                    const embed = {
                        color: '#FF0000',
                        title: `Use Error`,
                        description: `You don't have \`${useamount.toLocaleString()}\` of this item to use.\n**Item:** ${item.icon} \`${item.item}\`\n**Amount Owned:** \`${userData.inventory[item.item]?.toLocaleString()}\``,
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
                    'chestofwooden',
                ]
                
                if(item.item === 'premiumcard') {
                    if(userData.premium.rank >= 1) {
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
                        useamount = parseInt(useamount)
                            const expandedspace = Math.floor(Math.random() * (200000 * useamount)) + (50000 * useamount);
                            const newbankspacetotal = expandedspace + userData.bank.bankspace + userData.bank.expbankspace + userData.bank.otherbankspace;
                            const averageexpansion = Math.floor(expandedspace / useamount);

                            userData.bank.bankspace = userData.bank.bankspace + expandedspace
                            userData.inventory[item.item] = userData.inventory[item.item] - useamount;
                            await economyModel.findOneAndUpdate(params, userData);


                            const embed = {
                                color: 'RANDOM',
                                title: `You expanded your bankspace`,
                                description: `**Item:** ${item.icon} \`${item.item}\`\n**Amount Used:** \`${useamount.toLocaleString()}\``,
                                fields: [
                                    {
                                        name: 'Expanded Bankspace',
                                        value: `+ \`${expandedspace.toLocaleString()}\``,
                                        inline: true,
                                    },
                                    {
                                        name: 'New Bankspace Total',
                                        value: `\`${newbankspacetotal.toLocaleString()}\``,
                                        inline: true,
                                    },
                                    {
                                        name: 'Average Per One',
                                        value: `+ \`${averageexpansion.toLocaleString()}\``,
                                        inline: false,
                                    },
                                ],
                                timestamp: new Date(),
                            };

                            return message.reply({ embeds: [embed] });
                    } else if(item.item === 'donut' || item.item === 'kfcchicken' || item.item === 'bread' || item.item === 'tomato') {
                        userData.inventory[item.item] = userData.inventory[item.item] - 1;

                        await economyModel.findOneAndUpdate(params, userData);
                        return message.reply(`You eat one ${item.icon} \`${item.item}\` and it tastes good!`);
                    } else if(item.item === 'premiumcard') {
                        if(userData.premium >= 1) {
                            return message.reply(`You can't use a ${item.icon} \`${item.item}\`, since you are already a premium.`);
                        } else {
                            userData.inventory[item.item] = userData.inventory[item.item] - 1;
                            userData.inventory.premium.rank = userData.premium.rank + 1
                            
                            await economyModel.findOneAndUpdate(params, userData);
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
                            const hasItem = Object.keys(userData.inventory).includes(value.item);
                            if(!hasItem) {
                                userData.inventory[value.item] = value.quantity;
                            } else {
                                userData.inventory[value.item] = userData.inventory[value.item] + value.quantity;
                            }

                        })

                        userData.inventory[item.item] = userData.inventory[item.item] - useamount;
                        await economyModel.findOneAndUpdate(params, userData);

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

                return handleUseitem();
                
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
