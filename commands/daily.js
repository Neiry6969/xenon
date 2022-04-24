const profileModel = require("../models/profileSchema");

module.exports = {
    name: 'daily',
    aliases: ['dai'],
    cooldown: 86400,
    description: "collect your daily rewards.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const daily_amount = 100000;
        
        if(!profileData) {
            return;
        } else {
            const expbankspace_amount = Math.floor(Math.random() * 1000) + 69;
            const experiencepoints_amount = Math.floor(expbankspace_amount / 100);

            const response = await profileModel.findOneAndUpdate(
                {
                    userId: message.author.id,
                },
                {
                    $inc: {
                        coins: daily_amount,
                        expbankspace: expbankspace_amount,
                        experiencepoints: experiencepoints_amount,
                    },
                },
                {
                    upsert: true,
                }
            );

            const embed = {
                color: 'RANDOM',
                title: `Here, have your daily rewards`,
                description: `**Daily coins:** ❀ \`${daily_amount.toLocaleString()}\`\n**User:** \`${message.author.username}\` [<@${message.author.id}>]\n\n**Your next daily can be collected in:**\n\n\`${24}h 0m 0s\``,
                timestamp: new Date(),
            };

            return message.reply({ embeds: [embed] });
        }
    }
}