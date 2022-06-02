const { MessageEmbed } = require('discord.js');

const economyModel = require("../models/economySchema");
const allItems = require('../data/all_items');

module.exports = {
    name: "balance",
    aliases: ['bal', 'bl'],
    cooldown: 3,
    minArgs: 0,
    maxArgs: 1,
    description: "Check a user's balance.",
    async execute(message, args, cmd, client, Discord, userData) {
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

            const bankspace = targetData.bank.bankspace + targetData.bank.expbankspace + targetData.bank.bankmessagespace;
            const bank_percent_filled = ((targetData.bank.coins / bankspace) * 100).toFixed(2);
            let itemsworth = 0;

            if(!targetData.inventory) {
                itemsworth = 0;
            } else {
                Object.keys(targetData.inventory)
                .forEach((key) => {
                    if(targetData.inventory[key] === 0) {
                        return;
                    } else {
                        const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                        itemsworth = itemsworth + (item.value * targetData.inventory[key]);
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

            if(!userData.inventory) {
                itemsworth = 0;
            } else {
                Object.keys(userData.inventory)
                .forEach((key) => {
                    if(userData.inventory[key] === 0) {
                        return;
                    } else {
                        const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                        itemsworth = itemsworth + (item.value * userData.inventory[key]);
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

    },

}