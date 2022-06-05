const profileModel = require("../models/profileSchema");

module.exports = {
    name: 'monthly',
    aliases: ['month'],
    cooldown: 2678400,
    description: "collect your monthly rewards.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const monthly_amount = 10000000;
        
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

                        coins: monthly_amount,
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
                title: `Here, have your monthly rewards`,
                description: `**Monthly coins:** \`❀ ${monthly_amount.toLocaleString()}\`\n**User:** \`${message.author.username}\` [<@${message.author.id}>]\n\n**Your next monthly can be collected in:**\n\n\`31d 0h 0m 0s\``,
                timestamp: new Date(),
            };

            return message.reply({ embeds: [embed] });
        }
    }
}