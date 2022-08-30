const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");
const { fetchEconomyData } = require("../../utils/currencyfunctions");
const { setCooldown } = require("../../utils/mainfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite the bot to your server."),
    cooldown: 5,
    async execute(interaction, client, theme) {
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const economyData = economyData_fetch.data;

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel("Click To Invite")
                .setStyle("LINK")
                .setURL(
                    "https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot%20applications.commands"
                )
                .setDisabled(false)
        );

        const embed = {
            color: theme.embed.color,
            title: `Invite ${client.user.username} To Your Server!`,
            description: `Click the button below to invite the bot.
            Here is extra url: [\`https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot%20applications.commands\`](https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot%20applications.commands)`,
            author: {
                name: `${client.user.username}`,
                icon_url: `${client.user.displayAvatarURL()}`,
            },
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/Sqq8x0LOEM7_G8spfygf8QrW_vcMdIwNODmHH1LCzzQ/https/i.gifer.com/UUG2.gif?width=390&height=427",
            },
            timestamp: new Date(),
        };

        interaction.reply({
            ephemeral: true,
            embeds: [embed],
            components: [row],
        });
        return setCooldown(interaction, "invite", 5, economyData);
    },
};
