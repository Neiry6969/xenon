const { MessageActionRow, MessageButton } = require('discord.js')
const fs = require('fs')

const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");;
const allItems = require('../data/all_items');
const letternumbers = require('../reference/letternumber');
const interactionproccesses = require('../interactionproccesses.json')

const jsoncooldowns = require('../cooldowns.json');
function premiumcooldowncalc(defaultcooldown) {
    if(defaultcooldown <= 5 && defaultcooldown > 2) {
        return defaultcooldown - 2
    } else if(defaultcooldown <= 15) {
        return defaultcooldown - 5
    } else if(defaultcooldown <= 120) {
        return defaultcooldown - 10
    } else {
        return defaultcooldown
    }
}


module.exports = {
    name: "sell",
    cooldown: 10,
    minArgs: 0,
    maxArgs: 1,
    description: "sell an item.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        let cooldown = 10;
        if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
            cooldown = premiumcooldowncalc(cooldown)
        }
        const cooldown_amount = (cooldown) * 1000;
        const timpstamp = Date.now() + cooldown_amount
        jsoncooldowns[message.author.id].sell = timpstamp
        fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})

        const params = {
            userId: message.author.id
        }
        const expectedsyntax = `**Expected Syntax:** \`xe sell [item] [amount]\``;
        const getitem = args[0]?.toLowerCase();
        let sellamount = args[1]?.toLowerCase();

        if(!getitem) {
            const embed = {
                color: '#FF0000',
                title: `Sell error`,
                description: `Specify the item to sell.\n${expectedsyntax}`,
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
                title: `Sell error`,
                description: `\`${getitem}\` is not existent item.\n${expectedsyntax}`,
            };

            return message.reply({ embeds: [embed] });
        }

        if(item.sell === "unable to be sold") {
            const embed = {
                color: '#FF0000',
                title: `Sell error`,
                description: `This item is unable to be sold since it is a collectable.\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\``,
            };
            return message.reply({ embeds: [embed] });
        } 

        if(sellamount === 'max' || sellamount === 'all') {
            if(inventoryData.inventory[item.item] === 0 || !inventoryData.inventory[item.item]) {
                return message.reply(`You don't own any of this item, how are you going to sell it?`);
            } else {
                sellamount = inventoryData.inventory[item.item];
            }
        } else if(!sellamount) {
            sellamount = 1
        } else if(letternumbers.find((val) => val.letter === sellamount.slice(-1))) {
            if(parseInt(sellamount.slice(0, -1))) {
                const number = parseFloat(sellamount.slice(0, -1));
                const numbermulti = letternumbers.find((val) => val.letter === sellamount.slice(-1)).number;
                sellamount = number * numbermulti;
            } else {
                sellamount = null;
            }
        } else {
            sellamount = parseInt(sellamount)
        }   

        sellamount = parseInt(sellamount)

        if(!inventoryData[item.item] || inventoryData[item.item] <= 0) {
            return message.reply("You don't any of this item to sell.");
        }

        if(!sellamount || sellamount < 0) {
            return message.reply("You can only sell a whole number of items.");
        } else if (sellamount === 0) {
            return message.reply("So you want to sell nothing, why bother?");
        } else if (inventoryData.inventory[item.item] < sellamount) {
            const embed = {
                color: '#FF0000',
                title: `Sell error`,
                description: `You don't have enough of that item to sell that much.\n\n**Item:** ${item.icon} \`${item.item}\`\n**Quantity Owned:** \`${data.inventory[item.item].toLocaleString()}\``,
                timestamp: new Date(),
            };

            return message.reply({ embeds: [embed] });
        }

        const saleprice = sellamount * item.sell

        if(saleprice >= 10000) {
            interactionproccesses[message.author.id] = {
                interaction: true,
                proccessingcoins: true
            }
            fs.writeFile('./interactionproccesses.json', JSON.stringify(interactionproccesses), (err) => {if(err) {console.log(err)}})
            inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - sellamount;
            userData.wallet = userData.wallet + saleprice;
            userData.interactionproccesses.interaction = true
            userData.interactionproccesses.proccessingcoins = true

            await inventoryModel.findOneAndUpdate(params, inventoryData)
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
                title: `Confirm transaction`,
                description: `<@${message.author.id}>, are you sure you want to sell ${item.icon} \`${item.item}\` x\`${sellamount.toLocaleString()}\`\n**Sale Price:** \`❀ ${saleprice.toLocaleString()}\` (\`❀ ${item.sell.toLocaleString()}\` for each)`,
                timestamp: new Date(),
            };
            const sell_msg = await message.reply({ embeds: [embed], components: [row] });
            const collector = sell_msg.createMessageComponentCollector({ time: 20 * 1000 });

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
                    userData.bank.expbankspace = userData.bank.expbankspace + Math.floor(Math.random() * 69)
                    await economyModel.findOneAndUpdate(params, userData);

                    const embed = {
                        color: '#00FF00',
                        title: `Sell Receipt`,
                        description: `**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${sellamount.toLocaleString()}\`\n**Sold For:** \`❀ ${saleprice.toLocaleString()}\`\n**Each Sold For:** \`❀ ${item.sell.toLocaleString()}\`\n**Now You Have:** \`${inventoryData.inventory[item.item].toLocaleString()}\``,
                    };

                    confirm
                        .setDisabled()
                        .setStyle("SUCCESS")

                    cancel
                        .setDisabled()
                        .setStyle("SECONDARY")

                    return sell_msg.edit({
                        embeds: [embed],
                        components: [row]
                    })
                
                } else if(button.customId === "cancel") {
                    interactionproccesses[message.author.id] = {
                        interaction: false,
                        proccessingcoins: false
                    }
                    fs.writeFile('./interactionproccesses.json', JSON.stringify(interactionproccesses), (err) => {if(err) {console.log(err)}})
                    inventoryData.inventory[item.item] = inventoryData.inventory[item.item] + sellamount;
                    userData.wallet = userData.wallet - saleprice;
                    userData.interactionproccesses.interaction = false
                    userData.interactionproccesses.proccessingcoins = false
        
                    await economyModel.findOneAndUpdate(params, userData);

                    const embed = {
                        color: '#FF0000',
                        title: `Sell cancelled`,
                        description: `<@${message.author.id}>, confirm that want to sell the following:\n**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${sellamount.toLocaleString()}\`\n**Sale Price:** \`❀ ${saleprice.toLocaleString()}\` (\`❀ ${item.sell.toLocaleString()}\` for each)\nI guess not. Come back later if you change your mind.`,
                        timestamp: new Date(),
                    };
                    
                    confirm
                        .setDisabled()
                        .setStyle("SECONDARY")

                    cancel.setDisabled()
                    
                    return sell_msg.edit({
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
                    inventoryData.inventory[item.item] = inventoryData.inventory[item.item] + sellamount;
                    userData.wallet = userData.wallet - saleprice;
                    userData.interactionproccesses.interaction = false
                    userData.interactionproccesses.proccessingcoins = false
        
                    await inventoryModel.findOneAndUpdate(params, inventoryData)
                    await economyModel.findOneAndUpdate(params, userData);

                    const embed = {
                        color: '#FF0000',
                        title: `Sell timeout`,
                        description: `<@${message.author.id}>, confirm that want to sell the following:\n**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${sellamount.toLocaleString()}\`\n**Sale Price:** \`❀ ${saleprice.toLocaleString()}\` (\`❀ ${item.sell.toLocaleString()}\` for each)\nI guess not. Come back later if you change your mind.`,
                        timestamp: new Date(),
                    };
                    
                    confirm
                        .setDisabled()
                        .setStyle("SECONDARY")

                    cancel
                        .setDisabled()
                        .setStyle("SECONDARY")
                    
                    return sell_msg.edit({
                        embeds: [embed],
                        components: [row]
                    })
                }
            });
        } else {
            inventoryData.inventory[item.item] = inventoryData.inventory[item.item] - sellamount;
            userData.wallet = userData.wallet + saleprice;
            await inventoryModel.findOneAndUpdate(params, inventoryData)
            await economyModel.findOneAndUpdate(params, userData);

            const embed = {
                color: '#00FF00',
                title: `Sell Receipt`,
                description: `**Item:** ${item.icon} \`${item.item}\`\n**Quantity:** \`${sellamount.toLocaleString()}\`\n**Sold For:** \`❀ ${saleprice.toLocaleString()}\`\n**Each Sold For:** \`❀ ${item.sell.toLocaleString()}\`\n**Now You Have:** \`${inventoryData.inventory[item.item].toLocaleString()}\``,
            };
            return message.reply({ embeds: [embed] });
        }

    }

}