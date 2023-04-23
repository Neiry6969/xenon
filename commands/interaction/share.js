const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addItem,
    removeItem,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const {
    setCooldown,
    setProcessingLock,
    checknewaccount,
} = require("../../utils/mainfunctions");
const { death_handler } = require("../../utils/currencyevents");
const letternumbers = require("../../reference/letternumber");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("share")
        .setDescription("Share coins with another user.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("Specify the user you want to gift to.")
                .setRequired(true);
        })
        .addStringOption((oi) => {
            return oi
                .setName("amount")

                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                )
                .setRequired(true);
        }),
    cooldown: 10,
    async execute(interaction, client, theme) {
        let endinteraction = true;
        let error_message;
        const options = {
            user: interaction.options.getUser("user"),
            amount: interaction.options.getString("amount"),
        };

        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;
        const target = options.user;
        let amount = options.amount?.toLowerCase();

        if (target.id === interaction.user.id) {
            error_message = `You can't share coins with yourself!`;
            return errorReply(interaction, error_message);
        }

        if (economyData.wallet <= 0) {
            if (economyData.bank.coins <= 0) {
                error_message = `You got no coins in your wallet or your bank to share, your broke :c.`;
                return errorReply(interaction, error_message);
            } else {
                error_message = `You got no coins in your wallet to share, maybe withdraw some?`;
                return errorReply(interaction, error_message);
            }
        }

        if (amount === "max" || amount === "all") {
            amount = economyData.wallet;
        } else if (amount === "half") {
            amount = Math.floor(economyData.wallet / 2);
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

        if (amount === 0) {
            error_message =
                "So you want to share nothing, pretend you did that in your mind";
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (!amount || amount < 0 || amount % 1 != 0) {
            error_message = "Share amount must be a whole number.";
            return errorReply(interaction, error_message);
        } else if (amount > economyData.wallet) {
            if (amount < economyData.bank.coins + economyData.wallet) {
                error_message = `You don't have that amount of coins to give from your wallet, maybe withdraw some?`;
                return errorReply(interaction, error_message);
            } else {
                error_message = `You don't have that amount of coins to give from your wallet or your bank.`;
                return errorReply(interaction, error_message);
            }
        }

        const checknewaccount_local = await checknewaccount(
            interaction.user.id
        );
        const checknewaccount_user = await checknewaccount(options.user.id);
        if (checknewaccount_local.rawboolean === true) {
            error_message = `Your account is too new to gift items, you need the following\n\n${
                checknewaccount_local.commandsleft > 0
                    ? `Commands: \`${checknewaccount_local.commandsleft_display}\`\n`
                    : ""
            }${
                checknewaccount_local.timeleft > 0
                    ? `Ready: <t:${Math.floor(
                          checknewaccount_local.readytimestamp / 1000
                      )}:R>`
                    : ""
            }`;
            return errorReply(interaction, error_message);
        }
        if (
            checknewaccount_user.rawboolean === true &&
            interaction.user.id !== "567805802388127754"
        ) {
            error_message = `That account is too new to share coins to`;
            return errorReply(interaction, error_message);
        }

        let confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle("PRIMARY");

        let cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("DANGER");

        let row = new ActionRowBuilder().addComponents(confirm, cancel);

        const share_embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Action Confirmation - Share`)
            .setDescription(
                `<@${
                    interaction.user.id
                }>, do you want to share \`❀ ${amount.toLocaleString()}\` to <@${
                    target.id
                }>?`
            );

        await interaction.reply({
            embeds: [share_embed],
            components: [row],
        });

        const share_msg = await interaction.fetchReply();

        const collector = share_msg.createMessageComponentCollector({
            time: 20 * 1000,
        });

        setProcessingLock(interaction.user.id, true);
        collector.on("collect", async (button) => {
            if (button.user.id != interaction.user.id) {
                return button.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            button.deferUpdate();
            if (button.customId === "confirm") {
                endinteraction = true;
                const new_wallet = economyData.wallet - amount;

                share_embed
                    .setColor(`#95ff87`)
                    .setTitle(`Receipt - Share`)
                    .setDescription(
                        `<@${interaction.user.id}> shared coins to <@${
                            target.id
                        }>, here are the details:\n\n**Coins:** \`${amount.toLocaleString()}\``
                    )
                    .setFooter({
                        text: `New Wallet: ❀ ${new_wallet.toLocaleString()}`,
                    });

                confirm.setDisabled().setStyle("SUCCESS");
                cancel.setDisabled().setStyle("SECONDARY");

                share_msg.edit({
                    embeds: [share_embed],
                    components: [row],
                });
                setProcessingLock(interaction.user.id, false);
                await removeCoins(interaction.user.id, amount);
                await addCoins(target.id, amount);
            } else if (button.customId === "cancel") {
                endinteraction = true;
                setProcessingLock(interaction.user.id, false);

                share_embed
                    .setTitle(`Action Timed Out - Share`)
                    .setColor(`#ff8f87`);

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled();

                share_msg.edit({
                    embeds: [share_embed],
                    components: [row],
                });
            }
        });

        collector.on("end", async (collected) => {
            setProcessingLock(interaction.user.id, false);

            if (endinteraction === true) {
            } else {
                share_embed
                    .setTitle(`Action Timed Out - Share`)
                    .setColor(`#ff8f87`);

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled().setStyle("SECONDARY");

                share_msg.edit({
                    embeds: [share_embed],
                    components: [row],
                });
            }
        });
        return setCooldown(interaction, "share", 10, economyData);
    },
};
