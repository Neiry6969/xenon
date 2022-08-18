const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const EconomyModel = require("../../models/economySchema");
const letternumbers = require("../../reference/letternumber");
const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addItem,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown, setProcessingLock } = require("../../utils/mainfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Withdraw coins from you bank to your wallet.")
        .addStringOption((oi) => {
            return oi
                .setName("amount")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                )
                .setRequired(true);
        }),
    cdmsg: "Stop withdrawing so fast!",
    cooldown: 5,
    async execute(interaction, client, theme) {
        const options = {
            amount: interaction.options.getString("amount"),
        };

        let amount = options.amount?.toLowerCase();
        let error_message;

        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;
        const bankcoins = economyData.bank.coins;
        const walletcoins = economyData.wallet;

        if (bankcoins === 0) {
            error_message = "You got nothing in your bank to withdraw.";
            return errorReply(interaction, error_message);
        }

        if (amount === "max" || amount === "all") {
            amount = bankcoins;
        } else if (amount === "half") {
            amount = Math.floor(bankcoins / 2);
        } else if (
            letternumbers.find((val) => val.letter === amount.slice(-1))
        ) {
            if (parseInt(amount.slice(0, -1))) {
                const number = parseFloat(amount.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === amount.slice(-1)
                ).number;
                amount = number * numbermulti;
            } else {
                amount = null;
            }
        } else {
            amount = parseInt(amount);
        }

        amount = parseInt(amount);

        if (amount === 0) {
            error_message =
                "You withdrawn nothing, so nothing changed. Are you good?";

            return errorReply(interaction, error_message);
        } else if (amount < 0 || amount % 1 != 0) {
            error_message = "Withdrawal amount must be a whole number.";
            return errorReply(interaction, error_message);
        } else if (amount > bankcoins) {
            error_message = `You don't have that amount of coins to withdraw.`;
            return errorReply(interaction, error_message);
        }

        const new_bank = bankcoins - amount;
        const new_wallet = walletcoins + amount;
        try {
            const params = {
                userId: interaction.user.id,
            };
            economyData.wallet = new_wallet;
            economyData.bank.coins = new_bank;

            await EconomyModel.findOneAndUpdate(params, economyData);

            const deposit_embed = new MessageEmbed()
                .setColor(theme.embed.color)
                .setTitle(`Withdrawal`)
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setDescription(
                    `**Withdrawn:** \`❀ ${amount.toLocaleString()}\`\nCurrent Bank Balance: \`❀ ${new_bank.toLocaleString()}\``
                )
                .setFooter({
                    text: `New Wallet: ❀ ${new_wallet.toLocaleString()}`,
                });

            interaction.reply({ embeds: [deposit_embed] });
        } catch (err) {
            console.log(err);
        }

        return setCooldown(interaction, "withdraw", 5, economyData);
    },
};
