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
            const response = await profileModel.findOneAndUpdate(
                {
                    userId: message.author.id,
                },
                {
                    $inc: {
                        coins: daily_amount,
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