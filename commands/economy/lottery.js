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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lottery")
        .setDescription("Lottery info, entery, etc.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("enter")
                .setDescription("Buy tickets to join the hourly lottery")
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

            const inventory_fetch = await fetchInventoryData(
                interaction.user.id
            );
            const economyData_fetch = await fetchEconomyData(
                interaction.user.id
            );
            const inventoryData = inventory_fetch.data;
            const economyData = economyData_fetch.data;
            const bankcoins = economyData.bank.coins;
            const walletcoins = economyData.wallet;
            const lotteryData = await LotteryModel.findOne({
                lotteryId: "2022aug19",
            });
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

            setProcessingLock(interaction, true);
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
                    setProcessingLock(interaction, false);
                } else if (button.customId === "cancel") {
                    endinteraction = true;
                    setProcessingLock(interaction, false);

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
                if (endinteraction === true) {
                } else {
                    setProcessingLock(interaction, false);

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
        }
    },
};
