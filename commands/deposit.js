const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const letternumbers = require('../reference/letternumber');

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
    name: "deposit",
    aliases: ["dep"],
    cooldown: 5,
    description: "deposit coins into your bank.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        let amount = args[0]?.toLowerCase();
        const bankcoins = userData.bank.coins;
        const walletcoins = userData.wallet;
        const bankspace = userData.bank.bankspace + userData.bank.expbankspace + userData.bank.otherbankspace;
        const bank_percent_filled = ((bankcoins / bankspace) * 100).toFixed(2);
        const availableBankspace = bankspace - bankcoins;

        const expectedsyntax = `**Expected Syntax:** \`xe deposit [amount]\``

        if(availableBankspace <= 0) {
            const embed = {
                color: '#FF0000',
                title: 'Your deposit failed',
                description: `Your bank can't hold anymore coins...\n**Current Bank Status:** \`❀ ${bankcoins.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``,
                author: {
                    name: `_____________`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                },
                timestamp: new Date(),
            };
            return message.reply({ embeds: [embed] });
        }

        if(!amount) {
            const embed = {
                color: '#FF0000',
                title: `Deposit Error`,
                description: `Specify the amount you want to deposit.\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] })
        } if(amount === 'max' || amount === 'all') {
            amount = walletcoins;
            if(amount > availableBankspace) {
                amount = availableBankspace
            } 
        } else if(amount === 'half') {
            amount = Math.floor(walletcoins / 2)
            if(amount > availableBankspace) {
                amount = availableBankspace
            } 
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
            return message.reply("You deposited nothing, so nothing changed. Are you good?");
        } else if(amount < 0 || amount % 1 != 0) {
            return message.reply("Deposit amount must be a whole number.");
        } else if(amount > walletcoins) {
            return message.reply(`You don't have that amount of coins to deposit.`);
        } else if(amount > availableBankspace) {
            const embed = {
                color: '#FF0000',
                title: 'Your deposit failed',
                description: `Your bank can't hold \`❀ ${amount.toLocaleString()}\` more coins. Run more commands to gain experience bankspace or buy bankmessages to use.\n**Current Bank Status:** \`❀ ${profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\`\n**Avaliable Bankspace:** \`❀ ${availableBankspace.toLocaleString()}\``,
                author: {
                    name: `_____________`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                },
                timestamp: new Date(),
            };
            return message.reply({ embeds: [embed] });
        }

        const new_bank = bankcoins + amount;
        const new_wallet = walletcoins - amount;
        try {
            const params = {
                userId: message.author.id
            }
            userData.wallet = new_wallet
            userData.bank.coins = new_bank

            await economyModel.findOneAndUpdate(params, userData);

            const embed = {
                color: 'RANDOM',
                title: `Deposit`,
                author: {
                    name: `${message.author.username}#${message.author.discriminator}`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                },
                description: `Deposited: \`❀ ${amount.toLocaleString()}\`\nCurrent Bank Balance: \`❀ ${new_bank.toLocaleString()}\`\nCurrent Wallet Balance: \`❀ ${new_wallet.toLocaleString()}\``,
                timestamp: new Date(),
            };
            let cooldown = 5;
            if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
                cooldown = premiumcooldowncalc(cooldown)
            }
            const cooldown_amount = (cooldown) * 1000;
            const timpstamp = Date.now() + cooldown_amount
            jsoncooldowns[message.author.id].deposit = timpstamp
            fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})
            return message.reply({ embeds: [embed] });
        } catch (err) {
            console.log(err);
        } 
    },
};
