const economyModel = require("../models/economySchema");
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "withdraw",
    aliases: ["with"],
    cooldown: 5,
    description: "Withdraw coins into your wallet.",
    async execute(message, args, cmd, client, Discord, userData) {
        let amount = args[0]?.toLowerCase();
        const bankcoins = userData.bank.coins;
        const walletcoins = userData.wallet;

        const expectedsyntax = `**Expected Syntax:** \`xe withdraw [amount]\``

        if(!amount) {
            const embed = {
                color: '#FF0000',
                title: `Withdrawal failed`,
                description: `Specify the amount you want to withdraw.\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] })
        } if(amount === 'max' || amount === 'all') {
            amount = bankcoins;
        } else if(amount === 'half') {
            amount = Math.floor(walletcoins / 2)
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

        amount = parseInt(amount)



        if(amount === 0){
            return message.reply("You withdrawn nothing, so nothing changed. Are you good?");
        } else if(amount < 0 || amount % 1 != 0) {
            return message.reply("Withdrawal amount must be a whole number.");
        } else if(amount > bankcoins) {
            return message.reply(`You don't have that amount of coins to withdraw.`);
        } 

        const new_bank = bankcoins - amount;
        const new_wallet = walletcoins + amount;
        try {
            const params = {
                userId: message.author.id
            }
            userData.wallet = new_wallet
            userData.bank.coins = new_bank

            await economyModel.findOneAndUpdate(params, userData);

            const embed = {
                color: 'RANDOM',
                title: `Withdrawal`,
                author: {
                    name: `${message.author.username}#${message.author.discriminator}`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                },
                description: `Withdrawn: \`❀ ${amount.toLocaleString()}\`\nCurrent Bank Balance: \`❀ ${new_bank.toLocaleString()}\`\nCurrent Wallet Balance: \`❀ ${new_wallet.toLocaleString()}\``,
                timestamp: new Date(),
            };
            return message.reply({ embeds: [embed] });
        } catch (err) {
            console.log(err);
        } 
    },
};