const profileModel = require("../models/profileSchema");
module.exports = {
name: "deposit",
aliases: ["dep"],
cooldown: 5,
description: "deposit coins into your bank.",
async execute(message, args, cmd, client, Discord, profileData) {
        const getAmount = args[0]?.toLowerCase();
        const bankspace = profileData.bankspace + profileData.expbankspace;
        const bank_percent_filled = ((profileData.bank / bankspace) * 100).toFixed(2);
        const availableBankspace = bankspace - profileData.bank;

        if(getAmount === 'max' || getAmount === 'all') {

            const amount = profileData.coins;

            if (bankspace === profileData.bank) {
                const embed = {
                    color: '#FF0000',
                    title: 'Your deposit failed',
                    description: `Your bank can't hold anymore coins...\n**Current Bank Status:** ❀ \`${profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``,
                    author: {
                        name: `_____________`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                    },
                    timestamp: new Date(),
                };
                return message.reply({ embeds: [embed] });
            } else if(amount > availableBankspace) {
                const new_amount = bankspace - profileData.bank;
                const new_bank = profileData.bank + new_amount;
                const new_wallet = profileData.coins - new_amount;
                try {
                    await profileModel.findOneAndUpdate(
                        {
                            userId: message.author.id,
                        },
                        {
                            $inc: {
                                coins: -new_amount,
                                bank: new_amount,
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
                                value: `❀ \`${parseInt(new_amount).toLocaleString()}\``,
                            },
                            {
                                name: 'Current Bank Balance',
                                value: `❀ \`${new_bank.toLocaleString()}\``,
                                inline: true,
                            },
                            {
                                name: 'Current Wallet Balance',
                                value: `❀ \`${new_wallet.toLocaleString()}\``,
                                inline: true,
                            },
                            
                        ],
                        timestamp: new Date(),
                    };
                    return message.reply({ embeds: [embed] });
                } catch (err) {
                    console.log(err);
                }
            } else if (amount === 0) {
                return message.reply("You got nothing to deposit bro....");
            } else {
                const new_bank = profileData.bank + amount;
                try {
                    await profileModel.findOneAndUpdate(
                        {
                            userId: message.author.id,
                        },
                        {
                            $inc: {
                                coins: -amount,
                                bank: amount,
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
                                value: `❀ \`${parseInt(amount).toLocaleString()}\``,
                            },
                            {
                                name: 'Current Bank Balance',
                                value: `❀ \`${new_bank.toLocaleString()}\``,
                                inline: true,
                            },
                            {
                                name: 'Current Wallet Balance',
                                value: `❀ \`0\``,
                                inline: true,
                            },
                            
                        ],
                        timestamp: new Date(),
                    };
                    return message.reply({ embeds: [embed] });
                } catch (err) {
                    console.log(err);
                }
            }

        } else if (parseInt(getAmount) === 0) {
            return message.reply("So you want to deposit nothing, ok den.");
        } else if(getAmount % 1 != 0 || getAmount < 0) {
            return message.reply("Deposit amount must be a whole number.");
        } else {
            const newWallet = profileData.coins - parseInt(getAmount);
            const newBank = profileData.bank + parseInt(getAmount);
            const availableBankspace = bankspace - profileData.bank;

            if (parseInt(getAmount) > profileData.coins) {
                return message.reply(`You don't have that amount of coins to deposit.`);
            } else if (bankspace === profileData.bank) {
                const embed = {
                    color: '#FF0000',
                    title: 'Your deposit failed',
                    description: `Your bank can't hold anymore coins...\n**Current Bank Status:** ❀ \`${profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``,
                    author: {
                        name: `_____________`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                    },
                    timestamp: new Date(),
                };
                return message.reply({ embeds: [embed] }); 
            } else if (getAmount > availableBankspace) {
                const embed = {
                    color: '#FF0000',
                    title: 'Your deposit failed',
                    description: `That many more coins...\n**Current Bank Status:** ❀ \`${profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\`\n**Avaliable Bankspace:** ❀ \`${availableBankspace.toLocaleString()}\``,
                    author: {
                        name: `_____________`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                    },
                    timestamp: new Date(),
                };
                return message.reply({ embeds: [embed] });
            } else {
                try {
                    await profileModel.findOneAndUpdate(
                        {
                            userId: message.author.id,
                        },
                        {
                            $inc: {
                                coins: -getAmount,
                                bank: getAmount,
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
                                value: `❀ \`${parseInt(getAmount).toLocaleString()}\``,
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
            
        }   
    },
};