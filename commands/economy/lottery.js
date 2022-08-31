const {
    Collection,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
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
const {
    setCooldown,
    setProcessingLock,
    checkEventCooldown,
} = require("../../utils/mainfunctions");
const letternumbers = require("../../reference/letternumber");
const LotteryModel = require("../../models/lotterySchema");

function rankingicons(rank) {
    if (rank === 1) {
        return "<:rank_gold:1010208515677237388>";
    } else if (rank === 2) {
        return "<:rank_silver:1010208521037545482>";
    } else if (rank === 3) {
        return "<:rank_bronze:1010208526758596709>";
    } else {
        return "<:rank_unranked:1010208532316037130>";
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lottery")
        .setDescription("Lottery info, entery, etc.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("show")
                .setDescription(
                    "Show current status of current lottery and how many times you have entered."
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("enter")
                .setDescription("Buy tickets to join the hourly lottery.")
                .addStringOption((oi) => {
                    return oi
                        .setName("quantity")
                        .setDescription(
                            "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                        );
                })
        ),

    cooldown: 15,
    async execute(interaction, client, theme) {
        let error_message;
        let endinteraction = false;
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventoryData_fetch.data;
        const economyData = economyData_fetch.data;
        const bankcoins = economyData.bank.coins;
        const walletcoins = economyData.wallet;
        const lotteryData = await LotteryModel.findOne({
            lotteryId: "2022aug19",
        });

        if (
            lotteryData.endsAt - 60 * 1000 < Date.now() &&
            Date.now() < lotteryData.endsAt
        ) {
            error_message = `Entries to lottery is currently closed.\nYou can enter again: <t:${Math.floor(
                lotteryData.endsAtn / 1000
            )}:R>`;
            return errorReply(interaction, error_message);
        }
        if (interaction.options.getSubcommand() === "enter") {
            const lotteryticket_cost = 10000;
            const options = {
                quantity: interaction.options.getString("quantity"),
            };

            const cooldown = await checkEventCooldown(
                interaction.user.id,
                "lottery"
            );

            if (cooldown.status === true) {
                error_message = `You won the lottery recently so you are on cooldown.\n\nCooldown: \`1d\`\nYou can enter again: <t:${Math.floor(
                    cooldown.rawcooldown / 1000
                )}:R>`;
                return errorReply(interaction, error_message);
            }

            let quantity = options.quantity?.toLowerCase();
            if (quantity === "max" || quantity === "all") {
                if (economyData.wallet < lotteryticket_cost) {
                    error_message = `You need at least \`❀ ${lotteryticket_cost.toLocaleString()}\` in your wallet to buy a lottery ticket`;
                    return errorReply(interaction, error_message);
                } else {
                    quantity = Math.floor(
                        economyData.wallet / lotteryticket_cost
                    );
                }
            } else if (!quantity) {
                quantity = 1;
            } else if (
                letternumbers.find((val) => val.letter === quantity.slice(-1))
            ) {
                if (parseInt(quantity.slice(0, -1))) {
                    const number = parseFloat(quantity.slice(0, -1));
                    const numbermulti = letternumbers.find(
                        (val) => val.letter === quantity.slice(-1)
                    ).number;
                    quantity = number * numbermulti;
                } else {
                    quantity = null;
                }
            } else {
                quantity = parseInt(quantity);
            }
            quantity = parseInt(quantity);
            const totalprice = quantity * lotteryticket_cost;
            if (!quantity || quantity < 0) {
                error_message =
                    "You can only buy a whole number of lottery tickets.";
                return errorReply(interaction, error_message);
            } else if (quantity === 0) {
                error_message = "So you want to buy none, why bother?";
                return errorReply(interaction, error_message);
            } else if (economyData.wallet < totalprice) {
                error_message = `You don't have enough coins in your wallet to buy that many of lottery tickets.\n\n**Quantity:** \`${quantity.toLocaleString()}\`\n**Purchase Cost:** \`❀ ${totalprice.toLocaleString()}\`\n**Current Wallet:** \`❀ ${walletcoins.toLocaleString()}\``;
                return errorReply(interaction, error_message);
            }

            let confirm = new MessageButton()
                .setCustomId("confirm")
                .setLabel("Confirm")
                .setStyle("PRIMARY");
            let cancel = new MessageButton()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle("DANGER");
            let community = new MessageButton()
                .setLabel("Community")
                .setStyle("LINK")
                .setURL(`https://discord.gg/YVnv8Yud5u`);
            let row = new MessageActionRow().addComponents(
                confirm,
                cancel,
                community
            );

            const lottery_embed = new MessageEmbed()
                .setTitle(`Action Confirmation - Purchase (lottery)`)
                .setColor(theme.embed.color)
                .setDescription(
                    `**Lottery Ending:** <t:${
                        lotteryData.endsAt / 1000
                    }:R>\nTotal Globally Entries: \`${lotteryData.entriesTotal.toLocaleString()}\`\n\n<@${
                        interaction.user.id
                    }>, are you sure you want to buy <:xe_ticket:1010244491657089074> Lottery Tickets?\n\n**Quantity:** \`${quantity.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (Each: \`❀ ${lotteryticket_cost.toLocaleString()}\`)`
                );

            await interaction.reply({
                embeds: [lottery_embed],
                components: [row],
            });
            const buylotteryticket_msg = await interaction.fetchReply();
            const collector =
                buylotteryticket_msg.createMessageComponentCollector({
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
                    const new_wallet = economyData.wallet - totalprice;

                    const lottery_embed = new MessageEmbed()
                        .setColor(`#95ff87`)
                        .setTitle(`Receipt - Purchase (lottery)`)
                        .setDescription(
                            `**Lottery Ending:** <t:${
                                lotteryData.endsAt / 1000
                            }:R>\nTotal Globally Entries: \`${lotteryData.entriesTotal.toLocaleString()}\` \`+ ${quantity.toLocaleString()}\`\n\n**Item:** <:xe_ticket:1010244491657089074> \`lotteryticket\`\n**Quantity:** \`${quantity.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (Each: \`❀ ${lotteryticket_cost.toLocaleString()}\`)`
                        )
                        .setFooter({
                            text: `New Wallet: ${new_wallet.toLocaleString()}`,
                        });
                    confirm.setDisabled().setStyle("SUCCESS");
                    cancel.setDisabled().setStyle("SECONDARY");
                    buylotteryticket_msg.edit({
                        embeds: [lottery_embed],
                        components: [row],
                    });

                    const entry_info = {
                        userId: interaction.user.id,
                        first: lotteryData.entriesTotal + 1,
                        last: lotteryData.entriesTotal + quantity,
                    };
                    lotteryData.entriesTotal += quantity;
                    lotteryData.entries.push(entry_info);

                    await removeCoins(interaction.user.id, totalprice);
                    await LotteryModel.findOneAndUpdate(
                        { lotteryId: lotteryData.lotteryId },
                        lotteryData
                    );
                    setProcessingLock(interaction.user.id, false);
                } else if (button.customId === "cancel") {
                    endinteraction = true;
                    setProcessingLock(interaction.user.id, false);

                    lottery_embed
                        .setTitle(`Action Cancelled - Purchase (lottery)`)
                        .setColor(`#ff8f87`);
                    confirm.setDisabled().setStyle("SECONDARY");
                    cancel.setDisabled();
                    return buylotteryticket_msg.edit({
                        embeds: [lottery_embed],
                        components: [row],
                    });
                }
            });
            collector.on("end", async (collected) => {
                setProcessingLock(interaction.user.id, false);

                if (endinteraction === true) {
                } else {
                    lottery_embed
                        .setTitle(`Action Timed Out - Purchase (lottery)`)
                        .setColor(`#ff8f87`);

                    confirm.setDisabled().setStyle("SECONDARY");
                    cancel.setDisabled().setStyle("SECONDARY");
                    return buylotteryticket_msg.edit({
                        embeds: [lottery_embed],
                        components: [row],
                    });
                }
            });
        } else if (interaction.options.getSubcommand() === "show") {
            const lotteryData = await LotteryModel.findOne({
                lotteryId: "2022aug19",
            });
            const winninglotteryticket = await fetchItemData(
                "winninglotteryticket"
            );

            const entries_unique = {};
            lotteryData.entries.forEach((entry) => {
                if (!entries_unique[entry.userId]) {
                    entries_unique[entry.userId] = entry.last - entry.first + 1;
                } else {
                    entries_unique[entry.userId] +=
                        entry.last - entry.first + 1;
                }
            });

            const entries_unique_map = Object.keys(entries_unique)
                .map((key) => {
                    return key;
                })
                .sort(function (a, b) {
                    return entries_unique[b] - entries_unique[a];
                });

            const topentries = entries_unique_map.slice(0, 3);
            const topentries_map = topentries
                .map((entry, index) => {
                    return `${rankingicons(
                        index + 1
                    )} <@${entry}> \`${entries_unique[
                        entry
                    ].toLocaleString()} entries\` (\`❀ ${(
                        entries_unique[entry] *
                        10 *
                        1000
                    ).toLocaleString()}\`)`;
                })
                .join("\n");

            const lotteryshow_embed = new MessageEmbed()
                .setColor(theme.embed.color)
                .setDescription(
                    `**Lottery Ending:** <t:${
                        lotteryData.endsAt / 1000
                    }:R>\nTotal Globally Entries: \`${lotteryData.entriesTotal.toLocaleString()}\`\nUsers Participating: \`${Object.keys(
                        entries_unique
                    ).length.toLocaleString()}\`\nEntry Fee: \`❀ ${(
                        10 * 1000
                    ).toLocaleString()}\`\n\n**Prizes:**\n> \`>\` \`❀ ${(
                        lotteryData.entriesTotal *
                        10 *
                        1000
                    ).toLocaleString()}\`\n> \`>\` ${
                        winninglotteryticket.icon
                    } \`${winninglotteryticket.item}\`\n\n**Top Spenders:**\n${
                        topentries.length > 0
                            ? topentries_map
                            : "*`no entries yet`*"
                    }\n\n**Your Tickets:** \`${
                        entries_unique[interaction.user.id]
                            ? entries_unique[
                                  interaction.user.id
                              ].toLocaleString()
                            : 0
                    }\` (❀ \`${
                        entries_unique[interaction.user.id]
                            ? (
                                  entries_unique[interaction.user.id] *
                                  10 *
                                  1000
                              ).toLocaleString()
                            : 0
                    }\`)\nWinning Chance: \`${
                        entries_unique[interaction.user.id]
                            ? `${(
                                  (entries_unique[interaction.user.id] /
                                      lotteryData.entriesTotal) *
                                  100
                              ).toFixed(2)}%`
                            : `0.00%`
                    }\``
                )
                .setFooter({
                    text: `Join community through button below to see lottery results`,
                });

            interaction.reply({
                embeds: [lotteryshow_embed],
                components: [
                    new MessageActionRow().setComponents(
                        new MessageButton()
                            .setStyle("LINK")
                            .setURL("https://discord.gg/YVnv8Yud5u")
                            .setLabel("Community")
                            .setEmoji(
                                "<a:winninglotteryticket:1010942366078750730>"
                            )
                    ),
                ],
            });
        }

        setCooldown(interaction, "lottery", 15, economyData);
    },
};
