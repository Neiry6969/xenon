const profileModel = require("../models/profileSchema");
const inventoryModel = require("../models/inventorySchema")
const beg_data = require('../data/beg_data');
const allItems = require('../data/all_items')
const { MessageEmbed } = require("discord.js");

function randomizer(precent) {
    const randomnum = Math.floor(Math.random() * 10000);

    if(randomnum < precent) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    name: "beg",
    aliases: [],
    cooldown: 45,
    description: "check the user balance.",
    async execute(message, args, cmd, client, Discord, profileData, userData, inventoryData) {
        const searchidexrandom = Math.floor(Math.random() * beg_data.length)
        const beginteraction = beg_data[searchidexrandom]
        const resultsuccess = randomizer(beginteraction.successrate)
        const resultdeath = randomizer(beginteraction.deathrate)

        const params = {
            userId: message.author.id
        }

        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(beginteraction.title)

        if(resultsuccess === true) {
            const maxcoins = beginteraction.maxcoins - beginteraction.mincoins;
            const mincoins = beginteraction.mincoins
            const coins = Math.floor(Math.random() * maxcoins) + mincoins;
            const beg_result = beginteraction.description.replace('COINS', coins.toLocaleString())

            await profileModel.findOneAndUpdate(params,  {
                $inc: {
                    coins: coins
                }
            })


            if(beginteraction.items) {
                const ifgetitems = randomizer(beginteraction.itemsprecent) 
                embed.setDescription(beg_result)
                if(ifgetitems === true) {
                    const itemnum = Math.floor(Math.random() * beginteraction.items.length);
                    const resultitem = allItems.find(({ item }) => item === beginteraction.items[itemnum])
                    const beg_resultitem = beginteraction.itemdescription.replace('ITEM', `${resultitem.icon} \`${resultitem.item}\``)
                    embed.setDescription(`${beg_result}\n${beg_resultitem}`)

                    const hasItem = Object.keys(inventoryData.inventory).includes(resultitem.item);
                    if(!hasItem) {
                        inventoryData.inventory[resultitem.item] = 1;
                    } else {
                        inventoryData.inventory[resultitem.item] = inventoryData.inventory[resultitem.item] + 1;
                    }
                    await inventoryModel.findOneAndUpdate(params, inventoryData);
                }
            } 
        } else if(resultdeath ===  true) {
            const lostcoins = profileData.coins
            const dmdeathembed = new MessageEmbed()
                .setColor('#FFA500')

            
            embed.setDescription(beginteraction.deathdescription)
            await profileModel.findOneAndUpdate(params,  {
                $inc: {
                    coins: -lostcoins,
                    deaths: 1
                }
            })


            const hasLife = Object.keys(inventoryData.inventory).includes('lifesaver');
            if(!hasLife || hasLife < 1) {
                dmdeathembed.setTitle(`You died, rip. <:ghost:978412292012146688>`)
                dmdeathembed.setDescription(`You didn't have any items to save you from this death. You lost your whole wallet.\n\nDeath: \`begging\`\nCoins Lost: ❀ \`${lostcoins.toLocaleString()}\``)
            } else { 
                inventoryData.inventory['lifesaver'] = inventoryData.inventory['lifesaver'] - 1;
                await inventoryModel.findOneAndUpdate(params, inventoryData);

                dmdeathembed.setColor('##edfaf1')
                dmdeathembed.setTitle(`You were saved from death's grasps because of a lifesaver!`)
                dmdeathembed.setDescription(`Since you had a <:lifesaver:978754575098085426> \`lifesaver\` in your inventory, death was scared and ran away, but after the <:lifesaver:978754575098085426> \`lifesaver\` disappeared. Whew, close shave!\n\nDeath: \`begging\`\nAvoided Coin Loss: ❀ \`${lostcoins.toLocaleString()}\`\nLifes Left: <:lifesaver:978754575098085426> \`${inventoryData.inventory['lifesaver'].toLocaleString()}\``)

            }

            client.users.fetch(message.author.id, false).then((user) => {
                user.send({ embeds: [dmdeathembed] });
            });
        } else {
            embed.setDescription(beginteraction.faildescription)
        }

        message.reply({ embeds: [embed] })

    },
}