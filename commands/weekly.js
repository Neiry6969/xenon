const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");;

module.exports = {
    name: 'weekly',
    aliases: ['week'],
    cooldown: 604800,
    description: "Collect your weekly rewards.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        const params = {
            userId: message.author.id
        }
        const weekly_amount = 1000000;

        const totalamount = weekly_amount + userData.wallet;
        userData.wallet = totalamount
        userData.bank.expbankspace = userData.bank.expbankspace + Math.floor(Math.random() * 69)
        await economyModel.findOneAndUpdate(params, userData);

        const embed = {
            color: 'RANDOM',
            title: `Here, have your weekly rewards`,
            description: `**Weekly coins:** \`❀ ${weekly_amount.toLocaleString()}\`\n**User:** \`${message.author.username}\` [<@${message.author.id}>]\n\n**Your next weekly can be collected in:**\n\n\`7d 0h 0m 0s\``,
            timestamp: new Date(),
        };

        return message.reply({ embeds: [embed] });
        
        
    }
}
