const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const {
    fetchInventoryData,
    fetchEconomyData,
    addCoins,
} = require("../../utils/currencyfunctions");
const { setCooldown } = require("../../utils/mainfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("weekly")
        .setDescription("Collect your weekly rewards every week."),
    cooldown: 604800,
    cdmsg: "You already collected your weekly rewards this week.",
    async execute(interaction) {
        const weekly_amount = 1000000;
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const economyData = economyData_fetch.data;

        await addCoins(interaction.user.id, weekly_amount);

        const weekly_embed = new MessageEmbed()
            .setColor("#2f3136")
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Weekly`)
            .setDescription(
                `> *Rewards have been automatically transfered in your account, wait another 7 days before claiming your weekly reward again.*\n\n<a:heart_right:1009840455799820410> **Coins:** \`❀ ${weekly_amount.toLocaleString()}\``
            );

        interaction.reply({ embeds: [weekly_embed] });
        return setCooldown(interaction, "weekly", 604800, economyData);
    },
};
