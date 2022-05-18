const { MessageActionRow, MessageButton } = require('discord.js')

const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const userModel = require('../models/userSchema');
const allItems = require('../data/all_items');
const letternumbers = require('../reference/letternumber');


module.exports = {
    name: 'craft',
    aliases: ['make'],
    cooldown: 5,
    description: "Craft items.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const expectedsyntax = `\`xe craft [item] [amount]\``;
        let amount = args[1]?.toLowerCase();
        const getitem = args[0]?.toLowerCase();

        const iftable = args[0]?.toLowerCase()
        if(iftable === 'table' || iftable === 'list') {
            return message.reply('craft')
        } else {
            if(!getitem) {
                const embed = {
                    color: '#FF0000',
                    title: `Action error`,
                    description: `Specify the item to craft.\n**Expected Syntax:** ${expectedsyntax}`,
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
                    title: `Action error`,
                    description: `\`${getitem}\` is not existent item.\n**Expected Syntax:** ${expectedsyntax}`,
                };

                return message.reply({ embeds: [embed] });
            }

            if(!item.craftitems && !item.crafttools) {
                const embed = {
                    color: '#FF0000',
                    title: `Action error`,
                    description: `This item is not craftable\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\`\n\nTo see craftable items run: \`xe craft table\``,
                };

                return message.reply({ embeds: [embed] });
            }

            const params_user = {
                userId: message.author.id,
            }

            function ifhasamountitem(reqm, hasa) {
                if(hasa >= reqm) {
                    return true;
                } else {
                    return false;
                }
            } 

            inventoryModel.findOne(params_user, async(err, data) => {
                let missingitems = false;
                let crafttools;
                if(item.crafttools) {
                    crafttools = item.crafttools.map(value => {
                        const toolitem = allItems.find(({ item }) => item === value.i);
                        let hasamount = data.inventory[toolitem.item];
                        if(!data.inventory[toolitem.item]){
                            hasamount = 0
                        }

                        if(ifhasamountitem(value.q, hasamount) === false) {
                            missingitems = true;
                        }

                        let message = `\`${value.q.toLocaleString()}/${hasamount.toLocaleString()}\` ${toolitem.icon} \`${toolitem.item}\``;
                        
                        if(ifhasamountitem(value.q, hasamount) === true) {
                            message = `[\`${value.q.toLocaleString()}/${hasamount.toLocaleString()}\`](https://www.google.com/) ${toolitem.icon} \`${toolitem.item}\``
                        }

                        return message;

                    })
                    .join('\n')
                    
                }

                let craftitems;
                if(item.craftitems) {
                    craftitems = item.craftitems.map(value => {
                        const craftitem = allItems.find(({ item }) => item === value.i);
                        let hasamount = data.inventory[craftitem.item];
                        if(!data.inventory[craftitem.item]){
                            hasamount = 0
                        }

                        if(ifhasamountitem(value.q, hasamount) === false) {
                            missingitems = true;
                        }


                        let message = `\`${value.q.toLocaleString()}/${hasamount.toLocaleString()}\` ${craftitem.icon} \`${craftitem.item}\``;
                        
                        if(ifhasamountitem(value.q, hasamount) === true) {
                            message = `[\`${value.q.toLocaleString()}/${hasamount.toLocaleString()}\`](https://www.google.com/) ${craftitem.icon} \`${craftitem.item}\``
                        }

                        return message;
                    })
                    .join('\n')
                }

                if(missingitems === true) {
                    const embed = {
                        color: '#FF0000',
                        title: `Craft error`,
                        description: `You do not meet all of the requirements to craft that item\nItem: ${item.icon} \`${item.item}\`\nItem Type: \`${item.type}\`\n\n **Craft requirements:**\nCraft Tools:\n${crafttools}\n\nCraft Items:\n${craftitems}`,
                    };
    
                    return message.reply({ embeds: [embed] });
                }


                const craftitemamountmap = item.craftitems.map(value => {
                    const craftitem = allItems.find(({ item }) => item === value.i);

                    return Math.floor(data.inventory[craftitem.item] / value.q);
                })

                const maxcraftamount = Math.min(...craftitemamountmap)

                if(amount === 'max' || amount === 'all') {
                    amount = maxcraftamount;
                } else if(amount === 'half') {
                    amount = Math.floor(maxcraftamount / 2) + 1;
                } else if(!amount) {
                    amount = 1
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
    
                if(!amount || amount < 0) {
                    return message.reply("You can only craft a whole number of items.");
                } else if (amount === 0) {
                    return message.reply("So you want to craft nothing, why bother?");
                } else if (maxcraftamount < amount) {
                    const embed = {
                        color: '#FF0000',
                        title: `Craft error`,
                        description: `You don't have enough of the required items to craft that much of that item.\n\n**Item:** ${item.icon} \`${item.item}\`\n**Max Able To Be Crafted:** \`${maxcraftamount.toLocaleString()}\``,
                        timestamp: new Date(),
                    };
        
                    return message.reply({ embeds: [embed] });
                }
            })
        }
    }
}