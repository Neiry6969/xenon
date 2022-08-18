const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
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
const { setCooldown, setProcessingLock } = require("../../utils/mainfunctions");
const letternumbers = require("../../reference/letternumber");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sell")
        .setDescription("Sell items to the dealer at the Xenon shop.")
        .addStringOption((oi) => {
            return oi
                .setName("item")
                .setDescription(
                    "Specify the item you want to sell to the dealer."
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
    cooldown: 10,
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

        if (itemData.sell === "unable to be sold") {
            error_message = `This item is unable to be sold.\n\n**Item:** ${item.icon} \`${itemData.item}\`\n**Item Type:** \`${item.type}\``;
            return errorReply(interaction, error_message);
        }

        if (quantity === "max" || quantity === "all") {
            if (
                inventoryData.inventory[itemData.item] === 0 ||
                !inventoryData.inventory[itemData.item]
            ) {
                error_message = `You don't own any of this item, how are you going to sell it?`;
                return errorReply(interaction, error_message);
            } else {
                quantity = inventoryData.inventory[itemData.item];
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
        if (
            !inventoryData.inventory[itemData.item] ||
            inventoryData.inventory[itemData.item] <= 0
        ) {
            error_message = "You don't any of this item to sell.";
            return errorReply(interaction, error_message);
        }

        if (!quantity || quantity < 0) {
            error_message = "You can only sell a whole number of items.";
            return errorReply(interaction, error_message);
        } else if (quantity === 0) {
            error_message = "So you want to sell nothing, why bother?";

            return errorReply(interaction, error_message);
        } else if (inventoryData.inventory[itemData.item] < quantity) {
            error_message = `You don't have enough of that item to sell that much.\n\n**Item:** ${
                itemData.icon
            } \`${itemData.item}\`\n\n**Units Owned:** \`${data.inventory[
                itemData.item
            ].toLocaleString()}\``;

            return errorReply(interaction, error_message);
        }

        const saleprice = quantity * itemData.sell;

        if (saleprice >= 10000) {
            let confirm = new MessageButton()
                .setCustomId("confirm")
                .setLabel("Confirm")
                .setStyle("PRIMARY");

            let cancel = new MessageButton()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle("DANGER");

            let row = new MessageActionRow().addComponents(confirm, cancel);

            const sell_embed = new MessageEmbed()
                .setColor(theme.embed.color)
                .setTitle(`Action Confirmation  - Sell`)
                .setDescription(
                    `<@${interaction.user.id}>, are you sure you want to sell ${
                        itemData.icon
                    } \`${
                        itemData.item
                    }\` \`x ${quantity.toLocaleString()}\`\n\n**Sale Price:** \`❀ ${saleprice.toLocaleString()}\` (Each: \`❀ ${itemData.sell.toLocaleString()}\`)`
                );

            await interaction.reply({
                embeds: [sell_embed],
                components: [row],
            });
            const sell_msg = await interaction.fetchReply();
            const collector = sell_msg.createMessageComponentCollector({
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
                    await removeItem(
                        economyData.userId,
                        itemData.item,
                        quantity
                    );
                    await addCoins(economyData.userId, saleprice);
                    const newquantityowned =
                        inventoryData.inventory[itemData.item] - quantity;

                    sell_embed
                        .setColor(`#95ff87`)
                        .setTitle(`Receipt - Sell`)
                        .setDescription(
                            `**Item:** ${itemData.icon} \`${
                                itemData.item
                            }\`\n**Quantity:** \`${quantity.toLocaleString()}\`\n**Sale Price:** \`❀ ${saleprice.toLocaleString()}\` (Each: \`❀ ${itemData.price.toLocaleString()}\`)`
                        )
                        .setFooter({
                            text: `Units Owned: ${newquantityowned.toLocaleString()}`,
                        });

                    confirm.setDisabled().setStyle("SUCCESS");
                    cancel.setDisabled().setStyle("SECONDARY");

                    sell_msg.edit({
                        embeds: [sell_embed],
                        components: [row],
                    });

                    setProcessingLock(interaction, false);
                } else if (button.customId === "cancel") {
                    endinteraction = true;

                    sell_embed
                        .setTitle(`Action Cancelled - Sell`)
                        .setColor(`#ff8f87`);

                    confirm.setDisabled().setStyle("SECONDARY");
                    cancel.setDisabled();

                    sell_msg.edit({
                        embeds: [sell_embed],
                        components: [row],
                    });
                    setProcessingLock(interaction, false);
                }
            });

            collector.on("end", async (collected) => {
                if (endinteraction === true) {
                } else {
                    setProcessingLock(interaction, false);

                    sell_embed
                        .setTitle(`Action Timed Out - Sell`)
                        .setColor(`#ff8f87`);

                    confirm.setDisabled().setStyle("SECONDARY");
                    cancel.setDisabled().setStyle("SECONDARY");

                    return sell_msg.edit({
                        embeds: [sell_embed],
                        components: [row],
                    });
                }
            });
        } else {
            await removeItem(economyData.userId, itemData.item, quantity);
            await addCoins(economyData.userId, saleprice);
            const newquantityowned =
                inventoryData.inventory[itemData.item] + quantity;
            const sell_embed = new MessageEmbed()
                .setColor(`#95ff87`)
                .setTitle(`Receipt - Sell`)
                .setDescription(
                    `**Item:** ${itemData.icon} \`${
                        itemData.item
                    }\`\n**Quantity:** \`${quantity.toLocaleString()}\`\n**Sale Price:** \`❀ ${saleprice.toLocaleString()}\` (Each: \`❀ ${itemData.price.toLocaleString()}\`)`
                )
                .setFooter({
                    text: `New Units Owned: ${newquantityowned.toLocaleString()}`,
                });

            return interaction.reply({ embeds: [sell_embed] });
        }

        return setCooldown(interaction, "sell", 5, economyData);
    },
};
