const economyModel = require("../models/economySchema");

module.exports = {
    name: 'monthly',
    aliases: ['month'],
    cooldown: 2678400,
    description: "Collect your monthly rewards.",
    async execute(message, args, cmd, client, Discord, userData) {
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

        return message.reply({ embeds: [embed] });
        
    }
}
