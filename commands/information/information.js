const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { fetchEconomyData } = require("../../utils/currencyfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("information")
        .setDescription("Check the bot's information status."),
    async execute(interaction, client, theme) {
        const fetch_economyData = await fetchEconomyData(interaction.user.id);
        const economyData = fetch_economyData.data;
        const usercount = economyData.length;
        const servercount = client.guilds.cache.size;

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel("Click To Invite")
                .setStyle("LINK")
                .setURL(
                    "https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot%20applications.commands"
                )
                .setDisabled(false),
            new MessageButton()
                .setLabel("Xenon Support")
                .setStyle("LINK")
                .setURL("https://discord.gg/B5vjnwakdk")
                .setDisabled(false),
            new MessageButton()
                .setLabel("Xenon Community")
                .setStyle("LINK")
                .setURL("https://discord.gg/YVnv8Yud5u")
                .setDisabled(false)
        );
        infoembed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setTitle(`Xenon Information`)
            .setDescription(
                `\`Economy bot that was made for the fun of it. Migrated to fully slash commands.\``
            )
            .addFields(
                {
                    name: `Bot`,
                    value: `Created At: <t:1650404340:D>\nLatest Released Version: \`v0.69.51\`\nUser Count: \`${usercount.toLocaleString()}\`\nServer Count: \`${servercount.toLocaleString()}\``,
                    inline: true,
                },
                {
                    name: `Creator/Owners`,
                    value: `Creator: \`neriseo#7397\` (<@567805802388127754>)\nOwner: \`neriseo#7397\` (<@567805802388127754>)`,
                    inline: true,
                },
                {
                    name: `Servers`,
                    value: `Support: \`Xenon Support\` [\`https://discord.gg/B5vjnwakdk\`](https://discord.gg/B5vjnwakdk)\nCommunity: \`Xenon Community\` [\`https://discord.gg/YVnv8Yud5u\`](https://discord.gg/YVnv8Yud5u) `,
                    inline: false,
                }
            )
            .setThumbnail(client.user.displayAvatarURL());

        return interaction.reply({ embeds: [infoembed], components: [row] });
    },
};
