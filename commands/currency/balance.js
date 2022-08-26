const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
} = require("../../utils/currencyfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const { dmuser } = require("../../utils/discordfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check a user's balance.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("Specify a user's balance you want to see");
        }),
    cdmsg: `You can't be checking balance so fast, chilldown!`,
    cooldown: 3,
    async execute(interaction, client, theme) {
        const options = {
            user: interaction.options.getUser("user"),
        };

        let user = options.user || interaction.user;

        const balance_embed = new MessageEmbed()
            .setTitle("Balance")
            .setColor(theme.embed.color);

        const economyData = await fetchEconomyData(user.id);
        const inventoryData = await fetchInventoryData(user.id);
        const networth = economyData.networth + inventoryData.networth;
        const bankspace_filled = (
            (economyData.data.bank.coins / economyData.netbankspace) *
            100
        ).toFixed(2);

        balance_embed
            .setDescription(
                `Wallet: \`❀ ${economyData.data.wallet.toLocaleString()}\`\nBank: \`❀ ${economyData.data.bank.coins.toLocaleString()} / ${economyData.netbankspace.toLocaleString()}\` \`${
                    isNaN(bankspace_filled) ? `${0}` : `${bankspace_filled}`
                }%\``
            )
            .setAuthor({
                name: `${user.tag}`,
                iconURL: user.displayAvatarURL(),
            })
            .addFields({
                name: `Net Worth`,
                value: `\`❀ ${networth.toLocaleString()}\``,
            });

        interaction.reply({ embeds: [balance_embed] });

        return setCooldown(interaction, "balance", 3, economyData.data);
    },
};
