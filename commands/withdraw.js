const profileModel = require("../models/profileSchema");
module.exports = {
name: "withdraw",
aliases: ["with"],
cooldown: 5,
description: "withdraw coins into your bank.",
async execute(message, args, cmd, client, Discord, profileData) {
        const getAmount = args[0];
        if (getAmount === 'max' || getAmount === 'all') {
            const amount = profileData.bank;
            const newWallet = profileData.coins + amount;
            
            if(amount === 0) {
                return message.reply("You bank seems to be empty, therefore you can't withdraw anything.");
            } else {
                try {
                    await profileModel.findOneAndUpdate(
                        {
                            userId: message.author.id,
                        },
                        {
                            $inc: {
                                coins: amount,
                                bank: -amount,
                            },
                        }
                    );
    
                    const embed = {
                        color: 'RANDOM',
                        author: {
                            name: `_____________`,
                            icon_url: `${message.author.displayAvatarURL()}`,
                        },
                        fields: [
                            {
                                name: 'Withdrawn',
                                value: `❀ \`${amount.toLocaleString()}\``,
                            },
                            {
                                name: 'Current Bank Balance',
                                value: `❀ \`0\``,
                                inline: true,
                            },
                            {
                                name: 'Current Wallet Balance',
                                value: `❀ \`${newWallet.toLocaleString()}\``,
                                inline: true,
                            },
                            
                        ],
                        timestamp: new Date(),
                    };
                    message.reply({ embeds: [embed] });
                } catch (err) {
                    console.log(err);
                }
            }
        } else if (parseInt(getAmount) === 0) {
            return message.reply("So you want to withdraw nothing, ok den.");
        } else if(getAmount % 1 != 0 || getAmount < 0) {
            return message.reply("Withdraw amount must be a whole number.");
        } else {
            const newBank = profileData.bank - getAmount;
            const newWallet = profileData.coins + parseInt(getAmount);
            try {
                if (getAmount > profileData.bank) return message.reply(`You don't have that amount of coins to withdraw.`);
                await profileModel.findOneAndUpdate(
                    {
                        userId: message.author.id,
                    },
                    {
                        $inc: {
                            coins: getAmount,
                            bank: -getAmount,
                        },
                    }
                );

                const embed = {
                    color: 'RANDOM',
                    author: {
                        name: `_____________`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                    },
                    fields: [
                        {
                            name: 'Deposited',
                            value: `❀ \`${getAmount.toLocaleString()}\``,
                        },
                        {
                            name: 'Current Bank Balance',
                            value: `❀ \`${newBank.toLocaleString()}\``,
                            inline: true,
                        },
                        {
                            name: 'Current Wallet Balance',
                            value: `❀ \`${newWallet.toLocaleString()}\``,
                            inline: true,
                        },
                        
                    ],
                    timestamp: new Date(),
                };
                message.reply({ embeds: [embed] });
            } catch (err) {
            console.log(err);
            }
        }   
    },
};