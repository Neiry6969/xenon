const profileModel = require("../models/profileSchema");
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "withdraw",
    aliases: ["with"],
    cooldown: 5,
    description: "withdraw coins into your bank.",
    async execute(message, args, cmd, client, Discord, profileData) {
        let amount = args[0]?.toLowerCase();

        const ifletternum = !!letternumbers.find((val) => val.letter === amount?.slice(-1))

        if(amount === 'max' || amount === 'all') {
            amount = profileData.bank;
        } else if(amount === 'half') {
            amount = Math.floor(profileData.bank / 2)
        } else if(ifletternum === true) {
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