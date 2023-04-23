const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const IModel = require("../../models/inventorySchema");
const { death_handler } = require("../../utils/currencyevents");
const {
    fetchEconomyData,
    fetchInventoryData,
    fetchStatsData,
    fetchUserData,
} = require("../../utils/currencyfunctions");

module.exports = {
    data: new SlashCommandBuilder().setName("random").setDescription("Random."),
    async execute(interaction, client) {
        const asdasd = await IModel.find();
        asdasd.forEach(async (element) => {
            element.inventory["bottleofxenon"] = 1;

            await IModel.findOneAndUpdate({ userId: element.userId }, element);
        });

        interaction.reply({ content: "finished" });
    },
};
