const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");

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
    name: 'monthly',
    aliases: ['month'],
    cooldown: 2678400,
    cdmsg: "You already collected your monthly rewards month",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        const params = {
            userId: message.author.id
        }
        const monthly_amount = 10000000;

        const totalamount = monthly_amount + userData.wallet;
        userData.wallet = totalamount
        userData.bank.expbankspace = userData.bank.expbankspace + Math.floor(Math.random() * 69)
        await economyModel.findOneAndUpdate(params, userData);

        const embed = {
            color: 'RANDOM',
            title: `Here, have your monthly rewards`,
            description: `**Monthly coins:** \`❀ ${monthly_amount.toLocaleString()}\`\n**User:** \`${message.author.username}\` [<@${message.author.id}>]\n\n**Your next monthly can be collected in:**\n\n\`31d 0h 0m 0s\``,
            timestamp: new Date(),
        };

        let cooldown = 2678400;
        if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
            cooldown = premiumcooldowncalc(cooldown)
        }
        const cooldown_amount = (cooldown) * 1000;
        const timpstamp = Date.now() + cooldown_amount
        jsoncooldowns[message.author.id].monthly = timpstamp
        fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})

        return message.reply({ embeds: [embed] });
        
    }
}
