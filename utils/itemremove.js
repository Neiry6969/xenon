const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const fs = require("fs");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const ItemModel = require("../models/itemSchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");
const { fetchUserData } = require("./currencyfunctions");
const { removeActiveItem } = require("./userfunctions");
const { removeEmbedColors } = require("./cosmeticsfunctions");

class Removeitem {
    static async ri_watermelon(userId) {
        const fetch_userData = await fetchUserData(userId);
        const userData = fetch_userData.data;
        await removeEmbedColors(
            userId,
            userData.activeitems["watermelon"].data
        );
        await removeActiveItem(userId, "watermelon");
    }
}

module.exports = Removeitem;
