const profileModel = require("../models/profileSchema");
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "withdraw",
    aliases: ["with"],
    cooldown: 5,
    description: "withdraw coins into your bank.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const maxwallet = 1 * 1000 * 1000 * 1000 * 1000
        const bankspace = profileData.bankspace + profileData.expbankspace;
        const wallet_percent_filled = ((profileData.coins / maxwallet) * 100).toFixed(2);
        const availableWalletspace = maxwallet - profileData.coins;
        let amount = args[0]?.toLowerCase();

        if(availableWalletspace <= 0) {
            const embed = {
                color: '#FF0000',
                title: 'Your withdraw failed',
                description: `Your wallet can't hold anymore coins, the wallet cap is at ❀ \`${maxwallet.toLocaleString()}\`\n**Current Wallet Status:** ❀ \`${profileData.coins.toLocaleString()}\` | \`${maxwallet.toLocaleString()}\` \`${wallet_percent_filled}%\``,
                author: {
                    name: `_____________`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                },
                timestamp: new Date(),
            };
            return message.reply({ embeds: [embed] });
        }

        if(amount === 'max' || amount === 'all') {
            amount = profileData.bank;
            if(amount > availableWalletspace) {
                amount = availableWalletspace
            } 
        } else if(amount === 'half') {
            amount = Math.floor(profileData.bank / 2)
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


        if(profileData.bank <= 0) {
            return message.reply("You bank seems to be empty, therefore you can't withdraw anything. Awkward...");
        } else if(amount === 0){
            return message.reply("You withdraw nothing, so nothing changed. Are you good?");
        } else if(!amount) {
            const embed = {
                color: '#FF0000',
                title: `Withdraw Error`,
                description: `Specify the amount you want to withdraw.\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] })
        } else if(amount < 0 || amount % 1 != 0) {
            return message.reply("Withdraw amount must be a whole number.");
        } else if(amount > profileData.bank) {
            return message.reply(`You don't have that amount of coins to withdraw.`);
        } else if(amount > availableWalletspace) {
            const embed = {
                color: '#FF0000',
                title: 'Your withdraw failed',
                description: `Your wallet can't hold ❀ \`${amount.toLocaleString()}\` more coins. You need to find a way to increase wallet cap?\n**Current Wallet Status:** ❀ \`${profileData.coins.toLocaleString()}\` | \`${maxwallet.toLocaleString()}\` \`${wallet_percent_filled}%\`\n**Avaliable Bankspace:** ❀ \`${availableWalletspace.toLocaleString()}\``,
                author: {
                    name: `_____________`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                },
                timestamp: new Date(),
            };
            return message.reply({ embeds: [embed] });
        }
        
        const newWallet = profileData.coins + amount;
        const newBank = profileData.bank - amount;
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
    },
};