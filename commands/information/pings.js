const { SlashCommandBuilder } = require("@discordjs/builders");
const { setCooldown } = require("../../utils/mainfunctions");

const {
    fetchInventoryData,
    fetchEconomyData,
} = require("../../utils/currencyfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the bot's latency status."),
    cooldown: 10,
    async execute(interaction, client, theme) {
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const economyData = economyData_fetch.data;
        const embed = {
            color: theme.embed.color,
            title: `${client.user.username}'s Bot Latency`,
            description: `Here are the bot's latencies...`,
            author: {
                name: `${client.user.username}`,
                icon_url: `${client.user.displayAvatarURL()}`,
            },
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/Sqq8x0LOEM7_G8spfygf8QrW_vcMdIwNODmHH1LCzzQ/https/i.gifer.com/UUG2.gif?width=390&height=427",
            },
            fields: [
                {
                    name: "Ping Latency",
                    value: `<:moon:962410227104383006> \`${
                        Date.now() - interaction.createdTimestamp
                    }\`ms`,
                    inline: true,
                },
                {
                    name: "API Latency",
                    value: `<:moon:962410227104383006> \`${Math.round(
                        client.ws.ping
                    )}\`ms`,
                    inline: true,
                },
            ],
            timestamp: new Date(),
        };
        interaction.reply({ embeds: [embed] });

        setCooldown(interaction, "pings", 10, economyData);
    },
};
