const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
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
const { setCooldown, setProcessingLock } = require("../../utils/mainfunctions");
const letternumbers = require("../../reference/letternumber");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Buy an item from the Xenon shop.")
        .addStringOption((oi) => {
            return oi
                .setName("item")
                .setDescription(
                    "Specify the item you want to buy from the Xenon shop."
                )
                .setRequired(true);
        })
        .addStringOption((oi) => {
            return oi
                .setName("quantity")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                );
        }),
    cdmsg: "You already bought something earlier why are you buying things so fast?",
    cooldown: 5,
    async execute(interaction, client, theme) {
        let endinteraction = false;
        let error_message;

        const options = {
            item: interaction.options.getString("item"),
            quantity: interaction.options.getString("quantity"),
        };

        let quantity = options.quantity?.toLowerCase();
        const itemData = await fetchItemData(options.item);

        if (!itemData) {
            error_message = `\`That is not an existing item\``;
            return errorReply(interaction, error_message);
        }

        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        if (itemData.price === "unable to be bought") {
            error_message = `This item is unable to be bought since it is not sold in the Xenon shop.\n\n**Item:** ${itemData.icon} \`${itemData.item}\`\n**Item Type:** \`${itemData.type}\``;
            return errorReply(interaction, error_message);
        }

        if (quantity === "max" || quantity === "all") {
            if (economyData.wallet < itemData.value) {
                error_message = `You need at least \`❀ ${itemData.value}\` in your wallet to buy a ${itemData.icon} \`${itemData.item}\``;
                return errorReply(interaction, error_message);
            } else {
                quantity = Math.floor(economyData.wallet / itemData.value);
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
        const totalprice = itemData.value * quantity;

        if (!quantity || quantity < 0) {
            error_message = `You can only buy a whole number of items`;
            return errorReply(interaction, error_message);
        } else if (quantity === 0) {
            error_message = `So you want to buy nothing, why bother?`;
            return errorReply(interaction, error_message);
        } else if (economyData.wallet < totalprice) {
            error_message = `You don't have enough coins in your wallet to buy that many of that item.\n\n**Item:** ${
                itemData.icon
            } \`${
                itemData.item
            }\`\n\n**Quantity:** \`${quantity.toLocaleString()}\`\n**Purchase Cost:** \`❀ ${totalprice.toLocaleString()}\`\n**Current Wallet:** \`❀ ${economyData.wallet.toLocaleString()}\``;
            return errorReply(interaction, error_message);
        }

        if (totalprice >= 100000) {
            let confirm = new MessageButton()
                .setCustomId("confirm")
                .setLabel("Confirm")
                .setStyle("PRIMARY");

            let cancel = new MessageButton()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle("DANGER");

            let row = new MessageActionRow().addComponents(confirm, cancel);

            const buy_embed = new MessageEmbed()
                .setColor(theme.embed.color)
                .setAuthor({
                    name: `${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(`Action Confirmation  - Purchase`)
                .setDescription(
                    `<@${interaction.user.id}>, are you sure you want to buy ${
                        itemData.icon
                    } \`${
                        itemData.item
                    }\` \`x ${quantity.toLocaleString()}\`\n\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (Each: \`❀ ${itemData.price.toLocaleString()}\`)`
                );

            await interaction.reply({
                embeds: [buy_embed],
                components: [row],
            });
            const buy_msg = await interaction.fetchReply();
            const collector = buy_msg.createMessageComponentCollector({
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
                    setProcessingLock(interaction, false);
                    await addItem(economyData.userId, itemData.item, quantity);
                    await removeCoins(economyData.userId, totalprice);
                    const newquantityowned =
                        inventoryData.inventory[itemData.item] + quantity;

                    buy_embed
                        .setColor(`#95ff87`)
                        .setTitle(`Receipt - Purchase`)
                        .setDescription(
                            `**Item:** ${itemData.icon} \`${
                                itemData.item
                            }\`\n**Quantity:** \`${quantity.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (Each: \`❀ ${itemData.price.toLocaleString()}\`)`
                        )
                        .setFooter({
                            text: `Units Owned: ${newquantityowned.toLocaleString()}`,
                        });

                    confirm.setDisabled().setStyle("SUCCESS");
                    cancel.setDisabled().setStyle("SECONDARY");

                    return buy_msg.edit({
                        embeds: [buy_embed],
                        components: [row],
                    });
                } else if (button.customId === "cancel") {
                    endinteraction = true;
                    setProcessingLock(interaction, false);

                    buy_embed
                        .setTitle(`Action Cancelled - Purchase`)
                        .setColor(`#ff8f87`);

                    confirm.setDisabled().setStyle("SECONDARY");
                    cancel.setDisabled();

                    return buy_msg.edit({
                        embeds: [buy_embed],
                        components: [row],
                    });
                }
            });

            collector.on("end", async (collected) => {
                if (endinteraction === true) {
                } else {
                    setProcessingLock(interaction, false);

                    buy_embed
                        .setTitle(`Action Timed Out - Purchase`)
                        .setColor(`#ff8f87`);

                    confirm.setDisabled().setStyle("SECONDARY");
                    cancel.setDisabled().setStyle("SECONDARY");

                    return buy_msg.edit({
                        embeds: [buy_embed],
                        components: [row],
                    });
                }
            });
        } else {
            await addItem(economyData.userId, itemData.item, quantity);
            await removeCoins(economyData.userId, totalprice);
            const newquantityowned =
                inventoryData.inventory[itemData.item] + quantity;
            const buy_embed = new MessageEmbed()
                .setColor(`#95ff87`)
                .setTitle(`Receipt - Purchase`)
                .setDescription(
                    `**Item:** ${itemData.icon} \`${
                        itemData.item
                    }\`\n**Quantity:** \`${quantity.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (Each: \`❀ ${itemData.price.toLocaleString()}\`)`
                )
                .setFooter({
                    text: `Units Owned: ${newquantityowned.toLocaleString()}`,
                });

            return interaction.reply({ embeds: [buy_embed] });
        }

        return setCooldown(interaction, "buy", 5, economyData);
    },
};
