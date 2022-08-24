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
        .setName("deposit")
        .setDescription("Deposit coins into your bank.")
        .addStringOption((oi) => {
            return oi
                .setName("amount")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                )
                .setRequired(true);
        }),
    cdmsg: "Stop depositing so fast!",
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
        const availableBankspace =
            economyData_fetch.netbankspace - economyData.bank.coins;
        const bankspace_filled = (
            (economyData.bank.coins / economyData_fetch.netbankspace) *
            100
        ).toFixed(2);

        if (availableBankspace <= 0) {
            error_message = `Your bank can't hold anymore coins\n\n**Current Bank Status:** \`❀ ${bankcoins.toLocaleString()} / ${economyData_fetch.netbankspace.toLocaleString()}\` \`${bankspace_filled}%\``;
            return errorReply(interaction, error_message);
        }

        if (walletcoins === 0) {
            error_message = "You got nothing in your wallet to deposit";
            return errorReply(interaction, error_message);
        }

        if (amount === "max" || amount === "all") {
            amount = walletcoins;
            if (amount > availableBankspace) {
                amount = availableBankspace;
            }
        } else if (amount === "half") {
            amount = Math.floor(walletcoins / 2);
            if (amount > availableBankspace) {
                amount = availableBankspace;
            }
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
                "You deposited nothing, so nothing changed. Are you good?";
            return errorReply(interaction, error_message);
        } else if (amount < 0 || amount % 1 != 0) {
            error_message = "Deposit amount must be a whole number";
            return errorReply(interaction, error_message);
        } else if (amount > walletcoins) {
            error_message = "You don't have that amount of coins to deposit";
            return errorReply(interaction, error_message);
        } else if (amount > availableBankspace) {
            error_message = `Your bank can't hold that many more coins. Run more commands to gain experience bankspace or buy bankmessages to use.\n**Current Bank Status:** \`❀ ${economyData.bank.coins.toLocaleString()} / ${economyData_fetch.netbankspace.toLocaleString()}\` \`${bankspace_filled}%\`\n**Avaliable Bankspace:** \`❀ ${availableBankspace.toLocaleString()}\``;
            return errorReply(interaction, error_message);
        }

        const new_bank = bankcoins + amount;
        const new_wallet = walletcoins - amount;
        try {
            const params = {
                userId: interaction.user.id,
            };
            economyData.wallet = new_wallet;
            economyData.bank.coins = new_bank;

            await EconomyModel.findOneAndUpdate(params, economyData);

            const deposit_embed = new MessageEmbed()
                .setColor(theme.embed.color)
                .setTitle(`Deposit`)
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setDescription(
                    `**Deposited:** \`❀ ${amount.toLocaleString()}\`\nCurrent Bank Balance: \`❀ ${new_bank.toLocaleString()}\``
                )
                .setFooter({
                    text: `New Wallet: ❀ ${new_wallet.toLocaleString()}`,
                });

            interaction.reply({ embeds: [deposit_embed] });
        } catch (err) {
            console.log(err);
        }

        return setCooldown(interaction, "deposit", 5, economyData);
    },
};
