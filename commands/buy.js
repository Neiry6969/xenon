const { MessageActionRow, MessageButton } = require('discord.js')
const fs = require('fs')

const economyModel = require("../models/economySchema");
const allItems = require('../data/all_items');
const letternumbers = require('../reference/letternumber');
const interactionproccesses = require('../interactionproccesses.json')


module.exports = {
    name: 'buy',
    aliases: ['purchase'],
    cooldown: 5,
    description: "buy items.",
    minArgs: 0,
    maxArgs: 1,
    async execute(message, args, cmd, client, Discord, userData) {
        const params = {
            userId: message.author.id
        }
        const expectedsyntax = `**Expected Syntax:** \`xe buy [item] [amount]\``;
        let buyamount = args[1]?.toLowerCase();
        const getitem = args[0]?.toLowerCase();

        if(!getitem) {
            const embed = {
                color: '#FF0000',
                title: `Purchase Error`,
                description: `Specify the item to buy.\n${expectedsyntax}`,
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
                title: `Purchase Error`,
                description: `\`${getitem}\` is not existent item.\n${expectedsyntax}`,
            };

            return message.reply({ embeds: [embed] });
        }

        if(item.price === 'unable to be bought') {
            const embed = {
                color: '#FF0000',
                title: `Purchase Error`,
                description: `This item is unable to be bought since it is not in the Xenon shop.\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\``,
            };
            return message.reply({ embeds: [embed] });
        } 

        if(buyamount === 'max' || buyamount === 'all') {
            if(userData.wallet < item.value) {
                return message.reply(`You need atleast \`❀ ${item.value}\` in your wallet to buy a ${item.icon} \`${item.item}\``);
            } else {
                buyamount = Math.floor(userData.wallet / item.value)
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

        buyamount = parseInt(buyamount)

        const totalprice = item.value * buyamount;

        if(!buyamount || buyamount < 0) {
            return message.reply("You can only buy a whole number of items.");
        } else if (buyamount === 0) {
            return message.reply("So you want to buy nothing, why bother?");
        } else if (userData.wallet < totalprice) {
            const embed = {
                color: '#FF0000',
                title: `Purchase Error`,
                description: `You don't have enough coins in your wallet to buy that many of that item.\n\n**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Purchase Cost:** \`❀ ${totalprice.toLocaleString()}\`\n**Current Wallet:** \`❀ ${userData.wallet.toLocaleString()}\``,
                timestamp: new Date(),
            };

            return message.reply({ embeds: [embed] });
        }

        if(totalprice >= 100000) {
            interactionproccesses[message.author.id] = {
                interaction: true,
                proccessingcoins: true
            }
            fs.writeFile('./interactionproccesses.json', JSON.stringify(interactionproccesses), (err) => {if(err) {console.log(err)}})
            const hasItem = Object.keys(userData.inventory).includes(item.item);
            if(!hasItem) {
                userData.inventory[item.item] = buyamount;
            } else {
                userData.inventory[item.item] = userData.inventory[item.item] + buyamount;
            }
            userData.wallet = userData.wallet - totalprice
            userData.interactionproccesses.interaction = true
            userData.interactionproccesses.proccessingcoins = true

            await economyModel.findOneAndUpdate(params, userData);

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
                title: `Confirm purchase`,
                description: `<@${message.author.id}>, are you sure you want to buy ${item.icon} \`${item.item}\` x\`${buyamount.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (\`❀ ${item.price.toLocaleString()}\` for each)`,
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
                    interactionproccesses[message.author.id] = {
                        interaction: false,
                        proccessingcoins: false
                    }
                    fs.writeFile('./interactionproccesses.json', JSON.stringify(interactionproccesses), (err) => {if(err) {console.log(err)}})
                    userData.interactionproccesses.interaction = false
                    userData.interactionproccesses.proccessingcoins = false
                    await economyModel.findOneAndUpdate(params, userData);

                    const amountowned = userData.inventory[item.item]
                    const embed = {
                        color: '#A8FE97',
                        title: `Purchase Receipt`,
                        description: `**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Bought For:** \`❀ ${totalprice.toLocaleString()}\`\n**Each Bought For:** \`❀ ${item.price.toLocaleString()}\`\n**Now You Have** \`${amountowned.toLocaleString()}\``,
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
                
                } else if(button.customId === "cancel") {
               interactionproccesses[message.author.id] = {
                        interaction: false,
                        proccessingcoins: false
                    }
                    fs.writeFile('./interactionproccesses.json', JSON.stringify(interactionproccesses), (err) => {if(err) {console.log(err)}})
                    userData.inventory[item.item] = userData.inventory[item.item] - buyamount;
                    userData.wallet = userData.wallet + totalprice
                    userData.interactionproccesses.interaction = false
                    userData.interactionproccesses.proccessingcoins = false

                    await economyModel.findOneAndUpdate(params, userData);
                    const embed = {
                        color: '#FF0000',
                        title: `Purchase cancelled`,
                        description: `<@${message.author.id}>, confirm that want to buy the following:\n**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (\`❀ ${item.price.toLocaleString()}\` for each)\nI guess not. Come back later if you change your mind.`,
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

            collector.on('end', async collected => {
                if(collected.size > 0) {

                } else {
               interactionproccesses[message.author.id] = {
                        interaction: false,
                        proccessingcoins: false
                    }
                    fs.writeFile('./interactionproccesses.json', JSON.stringify(interactionproccesses), (err) => {if(err) {console.log(err)}})
                    userData.inventory[item.item] = userData.inventory[item.item] - buyamount;
                    userData.wallet = userData.wallet + totalprice
                    userData.interactionproccesses.interaction = false
                    userData.interactionproccesses.proccessingcoins = false

                    await economyModel.findOneAndUpdate(params, userData);

                    const embed = {
                        color: '#FF0000',
                        title: `Purchase timeout`,
                        description: `<@${message.author.id}>, confirm that want to buy the following:\n**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` \nI guess not. Come back later if you change your mind.`,
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
             const hasItem = Object.keys(userData.inventory).includes(item.item);
            if(!hasItem) {
                userData.inventory[item.item] = buyamount;
            } else {
                userData.inventory[item.item] = userData.inventory[item.item] + buyamount;
            }
            userData.wallet = userData.wallet - totalprice

            await economyModel.findOneAndUpdate(params, userData);
            
            const embed = {
                color: '#A8FE97',
                title: `Purchase Receipt`,
                description: `**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Bought For:** \`❀ ${totalprice.toLocaleString()}\`\n**Each Bought For:** \`❀ ${item.price.toLocaleString()}\`\n**Now You Have:** \`${userData.inventory[item.item].toLocaleString()}\``,
                timestamp: new Date(),
            };

            return message.reply({ embeds: [embed] });
        }
    }
}
