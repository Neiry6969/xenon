const { EmbedBuilder, MessageButton, MessageActionRow } = require("discord.js");
const fs = require("fs");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const ItemModel = require("../models/itemSchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");
const { fetchUserData } = require("./currencyfunctions");
const { removeActiveItem } = require("./userfunctions");
const { removeEmbedColors } = require("./cosmeticsfunctions");
const { fetchItemData } = require("./itemfunctions");
const { dmuser } = require("./discordfunctions");

class Removeitem {
    static async ri_watermelon(client, userId) {
        const item = await fetchItemData("watermelon");
        const fetch_userData = await fetchUserData(userId);
        const userData = fetch_userData.data;
        await removeEmbedColors(
            userId,
            userData.activeitems["watermelon"].data
        );
        await removeActiveItem(userId, "watermelon");
        await dmuser(
            client,
            userId,
            new EmbedBuilder()
                .setTitle(`Item Expired <:brokenglass:1013198455356801076>`)
                .setColor(`#ff5e5e`)
                .setDescription(`Item: ${item.icon} \`${item.item}\``)
        );
    }

    static async ri_prestigekey(client, userId) {
        const item = await fetchItemData("prestigekey");
        await removeActiveItem(userId, "prestigekey");
        await dmuser(
            client,
            userId,
            new EmbedBuilder()
                .setTitle(`Item Expired <:brokenglass:1013198455356801076>`)
                .setColor(`#ff5e5e`)
                .setDescription(`Item: ${item.icon} \`${item.item}\``)
        );
    }

    static async ri_pillofxenon(client, userId) {
        const item = await fetchItemData("pillofxenon");
        await removeActiveItem(userId, "pillofxenon");
        await dmuser(
            client,
            userId,
            new EmbedBuilder()
                .setTitle(`Item Expired <:brokenglass:1013198455356801076>`)
                .setColor(`#ff5e5e`)
                .setDescription(`Item: ${item.icon} \`${item.item}\``)
        );
    }
}

module.exports = Removeitem;
