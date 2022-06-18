const { MessageActionRow, MessageButton } = require('discord.js')

const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const allItems = require('../data/all_items');
const searchplaces = require('../data/search_places')

const jsoncooldowns = require('../cooldowns.json');
const fs = require('fs')
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

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function itemtruefalse(number) {
    const random = Math.floor(Math.random() * 10000)
    if(random <= number ) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    name: "search",
    aliases: ["scout"],
    cooldown: 30,
    minArgs: 0,
    maxArgs: 1,
    description: "sell an item.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        let cooldown = 30;
        if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
            cooldown = premiumcooldowncalc(cooldown)
        }
        const cooldown_amount = (cooldown) * 1000;
        const timpstamp = Date.now() + cooldown_amount
        jsoncooldowns[message.author.id].search = timpstamp
        fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})

        const params = {
            userId: message.author.id,
        }
        const displayedplaces = getRandom(searchplaces, 3)

        let placesearched;

        let display_1 = new MessageButton()
            .setCustomId(displayedplaces[0].place)
            .setLabel(displayedplaces[0].place)
            .setStyle('PRIMARY')

        let display_2 = new MessageButton()
            .setCustomId(displayedplaces[1].place)
            .setLabel(displayedplaces[1].place)
            .setStyle('PRIMARY')

        let display_3 = new MessageButton()
            .setCustomId(displayedplaces[2].place)
            .setLabel(displayedplaces[2].place)
            .setStyle('PRIMARY')

        let row = new MessageActionRow()
            .addComponents(
                display_1,
                display_2,
                display_3
            );

        const embed = {
            color: "RANDOM",
            title: `Where do you plan to search?`,
            description: `Pick an option below to start searching that location.\n\`You got 10 seconds to choose!\``,
            timestamp: new Date(),
        };

        const search_msg = await message.reply({ embeds: [embed], components: [row] });

        const collector = search_msg.createMessageComponentCollector({ time: 10 * 1000 });

        collector.on('collect', async (button) => {
            if(button.user.id != message.author.id) {
                return button.reply({
                    content: 'This is not for you.',
                    ephemeral: true,
                })
            } 

            button.deferUpdate()

            if(button.customId === displayedplaces[0].place) {
                placesearched = displayedplaces[0].place;
                const placesearched_items = searchplaces.find((val) => (val.place.toLowerCase()) === placesearched);
                const coins = Math.floor(Math.random() * placesearched_items.coins) + 500;
                const search_result = placesearched_items.message.replace('COINS', coins.toLocaleString())
                const experiencepoints_amount = Math.floor(4) + 1;
                userData.bank.expbankspace = userData.bank.expbankspace + Math.floor(Math.random() * 69)
                userData.experiencepoints = userData.experiencepoints + experiencepoints_amount;

                if(placesearched_items.items) {
                    if(itemtruefalse(placesearched_items.itempecrent) === true) {
                        const percent = (placesearched_items.itempecrent / 100).toFixed(2)
                        const item = allItems.find((val) => (val.item.toLowerCase()) === placesearched_items.items);
                        userData.wallet = userData.wallet + coins
                        const hasItem = Object.keys(inventoryData.inventory).includes(item.item);
                        if(!hasItem) {
                            inventoryData.inventory[item.item] = 1;
                        } else {
                            inventoryData.inventory[item.item] = inventoryData.inventory[item.item] + 1;
                        }
    
                        const embed = {
                            color: "RANDOM",
                            title: `${message.author.username} searched ${placesearched_items.place}`,
                            description: `${search_result}\nYou also got lucky and found \`1\` ${item.icon}\n\`${percent}%\` chance of happening`,
                            timestamp: new Date(),
                        };
                        display_1.setDisabled()
                        display_2
                            .setStyle("SECONDARY")
                            .setDisabled()
                        display_3
                            .setStyle("SECONDARY")
                            .setDisabled()
                        search_msg.edit({ embeds: [embed], components: [row] })
                    } else {
                        userData.wallet = userData.wallet + coins

                        const embed = {
                            color: "RANDOM",
                            title: `${message.author.username} searched ${placesearched_items.place}`,
                            description: `${search_result}`,
                            timestamp: new Date(),
                        };
                        display_1.setDisabled()
                        display_2
                            .setStyle("SECONDARY")
                            .setDisabled()
                        display_3
                            .setStyle("SECONDARY")
                            .setDisabled()
                        search_msg.edit({ embeds: [embed], components: [row] })
                    }
                } else {
                    userData.wallet = userData.wallet + coins

                    const embed = {
                        color: "RANDOM",
                        title: `${message.author.username} searched ${placesearched_items.place}`,
                        description: `${search_result}`,
                        timestamp: new Date(),
                    };
                    display_1.setDisabled()
                    display_2
                        .setStyle("SECONDARY")
                        .setDisabled()
                    display_3
                        .setStyle("SECONDARY")
                        .setDisabled()
                    search_msg.edit({ embeds: [embed], components: [row] })
                }

                await economyModel.findOneAndUpdate(params, userData);
            
            } else if(button.customId === displayedplaces[1].place) {
                placesearched = displayedplaces[1].place;
                const placesearched_items = searchplaces.find((val) => (val.place.toLowerCase()) === placesearched);
                const coins = Math.floor(Math.random() * placesearched_items.coins) + 500;
                const search_result = placesearched_items.message.replace('COINS', coins.toLocaleString())
                const experiencepoints_amount = Math.floor(4) + 1;
                userData.bank.expbankspace = userData.bank.expbankspace + Math.floor(Math.random() * 69)
                userData.experiencepoints = userData.experiencepoints + experiencepoints_amount;

                if(placesearched_items.items) {
                    if(itemtruefalse(placesearched_items.itempecrent) === true) {
                        const percent = (placesearched_items.itempecrent / 100).toFixed(2)
                        const item = allItems.find((val) => (val.item.toLowerCase()) === placesearched_items.items);
                        userData.wallet = userData.wallet + coins;

                        const hasItem = Object.keys(inventoryData.inventory).includes(item.item);
                        if(!hasItem) {
                            inventoryData.inventory[item.item] = 1;
                        } else {
                            inventoryData.inventory[item.item] = inventoryData.inventory[item.item] + 1;
                        }
    
                        const embed = {
                            color: "RANDOM",
                            title: `${message.author.username} searched ${placesearched_items.place}`,
                            description: `${search_result}\nYou also got lucky and found \`1\` ${item.icon}\n\`${percent}%\` chance of happening`,
                            timestamp: new Date(),
                        };
                        display_2.setDisabled()
                        display_1
                            .setStyle("SECONDARY")
                            .setDisabled()
                        display_3
                            .setStyle("SECONDARY")
                            .setDisabled()
                        search_msg.edit({ embeds: [embed], components: [row] })

                        
                    } else {
                        userData.wallet = userData.wallet + coins;
    
                        const embed = {
                            color: "RANDOM",
                            title: `${message.author.username} searched ${placesearched_items.place}`,
                            description: `${search_result}`,
                            timestamp: new Date(),
                        };
                        display_2.setDisabled()
                        display_1
                            .setStyle("SECONDARY")
                            .setDisabled()
                        display_3
                            .setStyle("SECONDARY")
                            .setDisabled()
                        search_msg.edit({ embeds: [embed], components: [row] })
                    }
                } else {
                    userData.wallet = userData.wallet + coins;

                    const embed = {
                        color: "RANDOM",
                        title: `${message.author.username} searched ${placesearched_items.place}`,
                        description: `${search_result}`,
                        timestamp: new Date(),
                    };
                    display_2.setDisabled()
                    display_1
                        .setStyle("SECONDARY")
                        .setDisabled()
                    display_3
                        .setStyle("SECONDARY")
                        .setDisabled()
                    search_msg.edit({ embeds: [embed], components: [row] })
                }
                await economyModel.findOneAndUpdate(params, userData);

            } else if(button.customId === displayedplaces[2].place) {
                placesearched = displayedplaces[2].place;
                const placesearched_items = searchplaces.find((val) => (val.place.toLowerCase()) === placesearched);
                const coins = Math.floor(Math.random() * placesearched_items.coins) + 500;
                const search_result = placesearched_items.message.replace('COINS', coins.toLocaleString())
                const experiencepoints_amount = Math.floor(4) + 1;
                userData.bank.expbankspace = userData.bank.expbankspace + Math.floor(Math.random() * 69)
                userData.experiencepoints = userData.experiencepoints + experiencepoints_amount;


                if(placesearched_items.items) {
                
                    const percent = (placesearched_items.itempecrent / 100).toFixed(2)
                    if(itemtruefalse(placesearched_items.itempecrent) === true) {
                        const item = allItems.find((val) => (val.item.toLowerCase()) === placesearched_items.items);
                        userData.wallet = userData.wallet + coins;

                        console.log(item)

                        const hasItem = Object.keys(inventoryData.inventory).includes(item.item);
                        if(!hasItem) {
                            inventoryData.inventory[item.item] = 1;
                        } else {
                            inventoryData.inventory[item.item] = inventoryData.inventory[item.item] + 1;
                        }
    
                        const embed = {
                            color: "RANDOM",
                            title: `${message.author.username} searched ${placesearched_items.place}`,
                            description: `${search_result}\nYou also got lucky and found \`1\` ${item.icon}\n\`${percent}%\` chance of happening`,
                            timestamp: new Date(),
                        };
                        display_3.setDisabled()
                        display_1
                            .setStyle("SECONDARY")
                            .setDisabled()
                        display_2
                            .setStyle("SECONDARY")
                            .setDisabled()
                        search_msg.edit({ embeds: [embed], components: [row] })
                    } else {
                        userData.wallet = userData.wallet + coins;
    
                        const embed = {
                            color: "RANDOM",
                            title: `${message.author.username} searched ${placesearched_items.place}`,
                            description: `${search_result}`,
                            timestamp: new Date(),
                        };
                        display_3.setDisabled()
                        display_1
                            .setStyle("SECONDARY")
                            .setDisabled()
                        display_2
                            .setStyle("SECONDARY")
                            .setDisabled()
                        search_msg.edit({ embeds: [embed], components: [row] })
                    }
                } else {
                    userData.wallet = userData.wallet + coins;

                    const embed = {
                        color: "RANDOM",
                        title: `${message.author.username} searched ${placesearched_items.place}`,
                        description: `${search_result}`,
                        timestamp: new Date(),
                    };
                    display_3.setDisabled()
                    display_1
                        .setStyle("SECONDARY")
                        .setDisabled()
                    display_2
                        .setStyle("SECONDARY")
                        .setDisabled()
                    search_msg.edit({ embeds: [embed], components: [row] })
                }
                await economyModel.findOneAndUpdate(params, userData);
            }
        })

        collector.on('end', collected => {
            if(collected.size > 0) {
                return;
            } else {


                const embed = {
                    color: "RANDOM",
                    title: `Search timed out`,
                    description: `So I guess your not going to search anywhere.`,
                    timestamp: new Date(),
                };
                search_msg.components[0].components.forEach(c => {c.setDisabled()})
                search_msg.edit({ embeds: [embed], components: search_msg.components })
            }
        });
        
    },
}