const { SlashCommandBuilder } = require("@discordjs/builders");

const EconomyModel = require("../../models/economySchema");
module.exports = {
    data: new SlashCommandBuilder().setName("random").setDescription("randome"),
    cooldown: 10,
    async execute(interaction) {
        const users = await EconomyModel.find({});
        users.forEach(async (e) => {
            users.bank.bankmessagespace = 0;
            return await EconomyModel.findOneAndUpdate({ userId: e.userId }, e);
        });
    },
};
