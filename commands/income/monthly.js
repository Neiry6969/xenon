const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const {
    fetchInventoryData,
    fetchEconomyData,
    addCoins,
} = require("../../utils/currencyfunctions");
const {
    setCooldown,
    setEventCooldown,
    checkEventCooldown,
} = require("../../utils/mainfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("monthly")
        .setDescription("Collect your monthly rewards every month."),
    cooldown: 60,
    async execute(interaction, client, theme) {
        const cooldown = await checkEventCooldown(interaction.user.id, "daily");

        if (cooldown.status === true) {
            error_message = `You already collected your monthlyly rewards this monthly\n\nCooldown: \`31d\`\nReady: <t:${Math.floor(
                cooldown.rawcooldown / 1000
            )}:R>`;
            return errorReply(interaction, error_message);
        }
        const monthly_amount = 10000000;
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const economyData = economyData_fetch.data;

        await addCoins(interaction.user.id, monthly_amount);
        await setEventCooldown(interaction.user.id, "monthly", 2678400);

        const monthly_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Monthly`)
            .setDescription(
                `> *Rewards have been automatically transfered in your account, wait another 31 days before claiming your monthly reward again.*\n\n<a:heart_right:1009840455799820410> **Coins:** \`❀ ${monthly_amount.toLocaleString()}\``
            );

        interaction.reply({ embeds: [monthly_embed] });
        return setCooldown(interaction, "monthly", 60, economyData);
    },
};
