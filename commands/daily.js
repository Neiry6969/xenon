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
    name: 'daily',
    aliases: ['dai'],
    cooldown: 86400,
    cdmsg: "You already collected your daily rewards today",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        const params = {
            userId: message.author.id
        }
        const dailybaseamount = 100000;
        let streak = userData.streaks.daily.strk;
        let streak_coins = 0;

        if(!userData.streaks.daily.lastclaimed) {
            userData.streaks.daily.lastclaimed = Date.now() 
        } else {
            const then = new Date(userData.streaks.daily.lastclaimed);
            const now = new Date();
    
            const msBetweenDates = Math.abs(then.getTime() - now.getTime());
            const hoursBetweenDates = msBetweenDates / 1000 / 60 / 60;
    
            if (hoursBetweenDates > 48) {
                userData.streaks.daily.strk = 0
            } else {
                userData.streaks.daily.strk = userData.streaks.daily.strk + 1;
                streak_coins =  userData.streaks.daily.strk * 1800;
            }
            userData.streaks.daily.lastclaimed = Date.now()
        }
        userData.bank.expbankspace = userData.bank.expbankspace + Math.floor(Math.random() * 69)
        const totalamount = streak_coins + dailybaseamount;
        userData.wallet = userData.wallet + streak_coins + dailybaseamount;
        await economyModel.findOneAndUpdate(params, userData);

        const embed = {
            color: 'RANDOM',
            title: `Here, have your daily rewards`,
            description: `**Daily coins:** \`❀ ${totalamount.toLocaleString()}\`\n**Streak:** <:streakflame:978108608254459954> \`${(userData.streaks.daily.strk).toLocaleString()}\`\n**User:** \`${message.author.username}\` [<@${message.author.id}>]\n\n**Your next daily can be collected in:**\n\n\`${24}h 0m 0s\``,
            timestamp: new Date(),
        };

        let cooldown = 86400;
        if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
            cooldown = premiumcooldowncalc(cooldown)
        }
        const cooldown_amount = (cooldown) * 1000;
        const timpstamp = Date.now() + cooldown_amount
        jsoncooldowns[message.author.id].daily = timpstamp
        fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})

        return message.reply({ embeds: [embed] });
        
        
    }
}