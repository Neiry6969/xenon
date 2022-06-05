const profileModel = require("../models/profileSchema");
const userModel = require('../models/userSchema');

module.exports = {
    name: 'daily',
    aliases: ['dai'],
    cooldown: 86400,
    description: "collect your daily rewards.",
    async execute(message, args, cmd, client, Discord, profileData, userData) {
        const daily_amount = 100000;
        let streak = profileData.dailystreak;
        let streak_coins = 0;

        const then = new Date(userData.dailystreak);
        const now = new Date();

        const msBetweenDates = Math.abs(then.getTime() - now.getTime());
        const hoursBetweenDates = msBetweenDates / 1000 / 60 / 60;

        if (hoursBetweenDates > 48) {
            await profileModel.findOneAndUpdate(
                {
                    userId: message.author.id,
                },
                {
                    $set: {
                        dailystreak: 0,
                    },
                },
                {
                    upsert: true,
                }
            );
            streak = 1
        } else {
            streak = streak + 1;
            streak_coins =  streak * 1800;
        }

        const expbankspace_amount = Math.floor(Math.random() * 1000) + 69;
        const experiencepoints_amount = Math.floor(expbankspace_amount / 100);
        
        const totalamount = streak_coins + daily_amount

        const response = await profileModel.findOneAndUpdate(
            {
                userId: message.author.id,
            },
            {
                $inc: {
                    dailystreak: 1,
                    coins: totalamount,
                    expbankspace: expbankspace_amount,
                    experiencepoints: experiencepoints_amount,
                },
            },
            {
                upsert: true,
            }
        );


                
        await userModel.findOneAndUpdate(
            {
                userId: message.author.id,
            },
            {
                $set: {
                    dailystreak: Date.now(),

                },
            },
            {
                upsert: true,
            }
        );

        const embed = {
            color: 'RANDOM',
            title: `Here, have your daily rewards`,
            description: `**Daily coins:** \`❀ ${totalamount.toLocaleString()}\`\n**Streak:** <:streakflame:978108608254459954> \`${streak.toLocaleString()}\`\n**User:** \`${message.author.username}\` [<@${message.author.id}>]\n\n**Your next daily can be collected in:**\n\n\`${24}h 0m 0s\``,
            timestamp: new Date(),
        };

        return message.reply({ embeds: [embed] });
        
        
    }
}