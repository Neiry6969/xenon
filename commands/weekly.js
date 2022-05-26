const profileModel = require("../models/profileSchema");

module.exports = {
    name: 'weekly',
    aliases: ['week'],
    cooldown: 604800,
    description: "collect your weekly rewards.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const weekly_amount = 1000000;
        
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

                        coins: weekly_amount,
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
                title: `Here, have your weekly rewards`,
                description: `**Weekly coins:** \`❀ ${weekly_amount.toLocaleString()}\`\n**User:** \`${message.author.username}\` [<@${message.author.id}>]\n\n**Your next weekly can be collected in:**\n\n\`7d 0h 0m 0s\``,
                timestamp: new Date(),
            };

            return message.reply({ embeds: [embed] });
        }
    }
}