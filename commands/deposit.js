const profileModel = require("../models/profileSchema");
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "deposit",
    aliases: ["dep"],
    cooldown: 5,
    description: "deposit coins into your bank.",
    async execute(message, args, cmd, client, Discord, profileData) {
        let amount = args[0]?.toLowerCase();
        const bankspace = profileData.bankspace + profileData.expbankspace;
        const bank_percent_filled = ((profileData.bank / bankspace) * 100).toFixed(2);
        const availableBankspace = bankspace - profileData.bank;

        const expectedsyntax = `**Expected Syntax:** \`xe deposit [amount]\``

        if(availableBankspace <= 0) {
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
        }

        if(amount === 'max' || amount === 'all') {
            amount = profileData.coins;
            if(amount > availableBankspace) {
                amount = availableBankspace
            } 
        } else if(amount === 'half') {
            amount = Math.floor(profileData.coins / 2)
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



        if(amount === 0){
            return message.reply("You deposited nothing, so nothing changed. Are you good?");
        } else if(!amount) {
            const embed = {
                color: '#FF0000',
                title: `Deposit Error`,
                description: `Specify the amount you want to deposit.\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] })
        } else if(amount < 0 || amount % 1 != 0) {
            return message.reply("Deposit amount must be a whole number.");
        } else if(amount > profileData.coins) {
            return message.reply(`You don't have that amount of coins to deposit.`);
        } else if(amount > availableBankspace) {
            const embed = {
                color: '#FF0000',
                title: 'Your deposit failed',
                description: `Your bank can't hold ❀ \`${amount.toLocaleString()}\` more coins. Run more commands to gain experience bankspace or buy bankmessages to use.\n**Current Bank Status:** ❀ \`${profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\`\n**Avaliable Bankspace:** ❀ \`${availableBankspace.toLocaleString()}\``,
                author: {
                    name: `_____________`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                },
                timestamp: new Date(),
            };
            return message.reply({ embeds: [embed] });
        }

        const new_bank = profileData.bank + amount;
        const new_wallet = profileData.coins - amount;
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
                        value: `❀ \`${amount.toLocaleString()}\``,
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
    },
};