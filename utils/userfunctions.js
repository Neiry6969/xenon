const { MessageEmbed } = require("discord.js");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");
const SettingsModel = require("../models/settingsSchema");
const LotteryModel = require("../models/lotterySchema");
const { fetchUserData } = require("./currencyfunctions");
const { fetchAllitemsData } = require("./itemfunctions");
const { removeEmbedColors } = require("./cosmeticsfunctions");

class Userfunctions {
    static async addActiveItem(userId, item, duration, data) {
        const fetch_userData = await fetchUserData(userId);
        const userData = fetch_userData.data;
        const duration_ms = duration * 1000;
        const expirydate = Date.now() + duration_ms;

        userData.activeitems[item] = {
            expirydate: expirydate,
            data: data,
        };

        await UserModel.findOneAndUpdate({ userId: userId }, userData);
    }
    static async removeActiveItem(userId, item) {
        const fetch_userData = await fetchUserData(userId);
        const userData = fetch_userData.data;
        delete userData.activeitems[item];

        await UserModel.findOneAndUpdate({ userId: userId }, userData);
    }
}

module.exports = Userfunctions;
