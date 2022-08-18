const { MessageEmbed } = require("discord.js");
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
const { lootbox, preniumcard, bankmessage, watermelon } = require("../../utils/itemuse");
const letternumbers = require("../../reference/letternumber");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("use")
        .setDescription("Use a usable item.")
        .addStringOption((oi) => {
            return oi
                .setName("item")
                .setDescription("Specify an item you want to use.")
                .setRequired(true);
        })
        .addStringOption((oi) => {
            return oi
                .setName("quantity")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                );
        }),
    cdmsg: `Bruh chillax! The items aren't going anywhere.`,
    cooldown: 5,
    async execute(interaction, client, theme) {
        const options = {
            item: interaction.options.getString("item"),
            quantity: interaction.options.getString("quantity"),
        };

        let endinteraction = false;
        let error_message;

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

        if (!inventoryData.inventory[itemData.item]) {
            error_message = `You don't own any of this item, how are you gonna use it?\n\nItem: ${itemData.icon} \`${itemData.item}\``;
            return errorReply(interaction, error_message);
        } else if (quantity === "max" || quantity === "all") {
            if (inventoryData.inventory[itemData.item] <= 0) {
                error_message = `You don't own any of this item, how are you gonna use it?\n\nItem: ${itemData.icon} \`${itemData.item}\``;
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

        if (!quantity || quantity < 0) {
            error_message = `You can only use a whole number of an item.\n\nItem: ${itemData.icon} \`${itemData.item}\``;
            return errorReply(interaction, error_message);
        } else if (quantity === 0) {
            error_message = "So you want to use nothing, why bother?";
            return errorReply(interaction, error_message);
        } else if (inventoryData.inventory[itemData.item] < quantity) {
            errorembed.setDescription(
                `You don't have enough of that item to use that many of that item.\n\nItem: ${
                    itemData.icon
                } \`${
                    itemData.item
                }\`\nQuantity: \`${quantity.toLocaleString()}\`\n**Units Owned:** \`${inventoryData.inventory[
                    itemData.item
                ].toLocaleString()}\``
            );
            return errorReply(interaction, error_message);
        }

        setCooldown(interaction, "use", 5, economyData);

        if (itemData.item === "bankmessage") {
            return bankmessage(
                interaction,
                economyData,
                inventoryData,
                itemData,
                quantity
            );
        } else if (itemData.item === "premiumcard") {
            return preniumcard(
                interaction,
                economyData,
                inventoryData,
                itemData
            );
        } else if (itemData.type === "lootbox") {
            return lootbox(interaction, inventoryData, itemData, quantity);
        } else if (itemData.item === "watermelon") {
            return watermelon(interaction, inventoryData, itemData);
        }

        error_message = `That item isn't usable sorry not sorry.\n\nItem: ${itemData.icon} \`${itemData.item}\``;
        return errorReply(interaction, error_message);
    },
};
