const { MessageEmbed } = require('discord.js');


const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const allItems = require('../data/all_items');

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

module.exports = {
    name: "balance",
    aliases: ['bal', 'bl'],
    cooldown: 3,
    minArgs: 0,
    maxArgs: 1,
    cdmsg: `You can't be checking you balance so fast, chilldown!`,
    description: "Check a user's balance.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        const user = message.author;
        let target;

        if(message.mentions.users.first()) {
            target = message.mentions.users.first()
        } else {
            try {
                const featch_user = await message.guild.members.fetch(args[0])
                target = featch_user.user
            } catch (error) {
                target = null
            }
        }

        const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle(`Balance`)
            .setTimestamp()
            
        
        if(target) {
            let targetData;
            try {   
                targetData = await economyModel.findOne({ userId: target.id });
                if(!targetData) {
                    let targetuser = await economyModel.create({
                        userId: target.id,
                    });

                    targetData = targetuser
                
                    targetuser.save();
                }
            } catch(error) {
                console.log(error)
            }

            let targetinvData;
            try {   
                targetinvData = await inventoryModel.findOne({ userId: target.id });
                if(!targetinvData) {
                    let targetuser = await inventoryModel.create({
                        userId: target.id,
                    });

                    targetinvData = targetuser
                
                    targetuser.save();
                }
            } catch(error) {
                console.log(error)
            }

            let targetprofileData;
            try {   
                targetprofileData = await economyModel.findOne({ userId: target.id });
                if(!targetprofileData) {
                    let targetuser = await economyModel.create({
                        userId: target.id,
                    });

                    targetprofileData = targetuser
                
                    targetuser.save();
                }
            } catch(error) {
                console.log(error)
            }

            
            let targetstatsData;
            try {   
                targetstatsData = await economyModel.findOne({ userId: target.id });
                if(!targetstatsData) {
                    let targetuser = await economyModel.create({
                        userId: target.id,
                    });

                    targetstatsData = targetuser
                
                    targetuser.save();
                }
            } catch(error) {
                console.log(error)
            }

            const bankspace = targetData.bank.bankspace + targetData.bank.expbankspace + targetData.bank.otherbankspace;
            const bank_percent_filled = ((targetData.bank.coins / bankspace) * 100).toFixed(2);
            let itemsworth = 0;

            if(!targetinvData.inventory) {
                itemsworth = 0;
            } else {
                Object.keys(targetinvData.inventory)
                .forEach((key) => {
                    if(targetinvData.inventory[key] === 0) {
                        return;
                    } else {
                        const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                        itemsworth = itemsworth + (item.value * targetinvData.inventory[key]);
                    }

                })
            }

            const networth = targetData.wallet + targetData.bank.coins + itemsworth;

            embed
                .setDescription(
                    `Wallet: \`❀ ${targetData.wallet.toLocaleString()}\`\nBank: \`❀ ${targetData.bank.coins.toLocaleString()} / ${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``
                )
                .setAuthor(
                    {
                        name: `${target.username}#${target.discriminator}`,
                        iconURL: target.displayAvatarURL(),
                    }
                )
                .addFields({
                    name: `Net Worth`,
                    value: `\`❀ ${networth.toLocaleString()}\``
                })

        } else {
            const bankspace = userData.bank.bankspace + userData.bank.expbankspace + userData.bank.otherbankspace;
            const bank_percent_filled = ((userData.bank.coins / bankspace) * 100).toFixed(2);
            let itemsworth = 0;

            if(!inventoryData.inventory) {
                itemsworth = 0;
            } else {
                Object.keys(inventoryData.inventory)
                .forEach((key) => {
                    if(inventoryData.inventory[key] === 0) {
                        return;
                    } else {
                        const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                        itemsworth = itemsworth + (item.value * inventoryData.inventory[key]);
                    }

                })
            }

            const networth = userData.wallet + userData.bank.coins + itemsworth;

            embed
                .setDescription(
                    `Wallet: \`❀ ${userData.wallet.toLocaleString()}\`\nBank: \`❀ ${userData.bank.coins.toLocaleString()} / ${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``
                )
                .setAuthor(
                    {
                        name: `${user.username}#${user.discriminator}`,
                        iconURL: user.displayAvatarURL(),
                    }
                )
                .addFields({
                    name: `Net Worth`,
                    value: `\`❀ ${networth.toLocaleString()}\``
                })
    
        }

        message.reply({ embeds: [embed] })

        let cooldown = 3;
        if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
            cooldown = premiumcooldowncalc(cooldown)
        }
        const cooldown_amount = (cooldown) * 1000;
        const timpstamp = Date.now() + cooldown_amount
        jsoncooldowns[message.author.id].balance = timpstamp
        fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})
    },

}