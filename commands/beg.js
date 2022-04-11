const profileModel = require("../models/profileSchema");

module.exports = {
    name: "beg",
    aliases: [],
    cooldown: 25,
    description: "check the user balance.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const begOutcome = Math.floor(Math.random() * 12) + 1;
        if(
            begOutcome === 1 
            || 
            begOutcome === 4 
            || 
            begOutcome === 7 
        ) {
            const embed = {
                color: '#FF0000',
                title: `You Tried Begging`,
                description: `Ew! Gross you are begging again? Go away smelly peasant!
                You recieved ❀ \`0\``,
                timestamp: new Date(),
            };
            message.reply({ embeds: [embed] });
        } else {
            if (!profileData) {          
                return;
            } else {
                const begAmount = Math.floor(Math.random() * 6969) + 100;
                const expbankspace_amount = Math.floor(Math.random() * 1000) + 69;
                const experiencepoints_amount = Math.floor(expbankspace_amount / 100);

                const response = await profileModel.findOneAndUpdate(
                    {
                        userId: message.author.id,
                    },
                    {
                        $inc: {
                            coins: begAmount,
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
                    title: `You Tried Begging`,
                    description: `Here, have this you little beggar.
                    You recieved ❀ \`${begAmount.toLocaleString()}\``,
                    timestamp: new Date(),
                };
                
                return message.reply({ embeds: [embed] });
            }
        }
    },
}