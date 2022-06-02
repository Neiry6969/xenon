const economyModel = require("../models/economySchema");

module.exports = {
    name: 'daily',
    aliases: ['dai'],
    cooldown: 86400,
    description: "Collect your daily rewards.",
    async execute(message, args, cmd, client, Discord, userData) {
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

        return message.reply({ embeds: [embed] });
        
        
    }
}