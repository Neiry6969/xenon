const { EmbedBuilder } = require("discord.js");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");
const SettingsModel = require("../models/settingsSchema");
const LotteryModel = require("../models/lotterySchema");
const {
    fetchUserData,
    fetchInventoryData,
    fetchEconomyData,
    fetchStatsData,
    fetchSettingsData,
} = require("./currencyfunctions");
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
    static async fetchMultipliers(userId) {
        const multipliers_max = 250;
        const multipliers = [];
        let multipliers_total = 0;

        const fetch_userData = await fetchUserData(userId);
        const fetch_economyData = await fetchEconomyData(userId);
        const fetch_inventoryData = await fetchInventoryData(userId);
        const fetch_statsData = await fetchStatsData(userId);
        const fetch_settingsData = await fetchSettingsData(userId);
        const userData = fetch_userData.data;
        const inventoryData = fetch_inventoryData.data;
        const economyData = fetch_economyData.data;
        const statsData = fetch_statsData.data;
        const settingsData = fetch_settingsData.data;

        if (
            inventoryData.inventory["finetrophy"] &&
            inventoryData.inventory["finetrophy"] > 0
        ) {
            multipliers_total += 15;
            multipliers.push({
                description: "Fine Trophy",
                multiplier: 15,
            });
        }

        if (statsData.commands.all >= 10000) {
            multipliers_total += 1;
            multipliers.push({
                description: "More than 10K commands executed",
                multiplier: 1,
            });
        }

        if (statsData.streaks.daily.strk >= 25) {
            if (statsData.streaks.daily.strk >= 1000) {
                multipliers_total += 30;
                multipliers.push({
                    description: "Daily streak of 1000+",
                    multiplier: 25,
                });
            } else if (statsData.streaks.daily.strk >= 100) {
                multipliers_total += 15;
                multipliers.push({
                    description: "Daily streak of 100+",
                    multiplier: 15,
                });
            } else if (statsData.streaks.daily.strk >= 50) {
                multipliers_total += 10;
                multipliers.push({
                    description: "Daily streak of 50+",
                    multiplier: 10,
                });
            } else {
                multipliers_total += 5;
                multipliers.push({
                    description: "Daily streak of 25+",
                    multiplier: 5,
                });
            }
        }

        if (economyData.level >= 1000) {
            multipliers_total += 5;
            multipliers.push({
                description: "Level 1000+",
                multiplier: 5,
            });
        }

        if (economyData.premium.rank >= 1) {
            multipliers_total += 5;
            multipliers.push({
                description: "Prenium Rank 1+",
                multiplier: 5,
            });
        }

        if (Object.keys(userData.activeitems).includes("pillofxenon")) {
            multipliers_total += userData.activeitems["pillofxenon"].data;
            multipliers.push({
                description: "Xenon Pill",
                multiplier: userData.activeitems["pillofxenon"].data,
            });
        }

        if (Object.keys(userData.activeitems).includes("prestigekey")) {
            multipliers_total += 150;
            multipliers.push({
                description: "Prestige Key",
                multiplier: 150,
            });
        }

        if (economyData.badges.length > 0) {
            let multipliers_badges = 0;
            economyData.badges.forEach((badge) => {
                multipliers_badges += 2;
            });
            multipliers_total += multipliers_badges;
            multipliers.push({
                description: `Obtained ${economyData.badges.length} Badges`,
                multiplier: multipliers_badges,
            });
        }

        if (economyData.prestige > 0) {
            let multipliers_prestige = economyData.prestige * 5;
            if (economyData.prestige > 10) {
                multipliers_prestige = 50;
                multipliers_total += multipliers_prestige;
                multipliers.push({
                    description: `Prestige 10+`,
                    multiplier: multipliers_prestige,
                });
            } else {
                multipliers_total += multipliers_prestige;
                multipliers.push({
                    description: `Prestige ${economyData.prestige}`,
                    multiplier: multipliers_prestige,
                });
            }
        }

        if (
            userData.eventcooldowns["vote_topgg"] &&
            Date.now() < userData.eventcooldowns["vote_topgg"] + 43200000
        ) {
            multipliers_total += 5;
            multipliers.push({
                description: `Voted on Top.gg`,
                multiplier: 5,
            });
        }

        if (multipliers_total > multipliers_max) {
            multipliers_total = multipliers_max;
        }

        if (settingsData.settings.tips.status === true) {
            multipliers_total += 2;
            multipliers.push({
                description: `Tips Enabled`,
                multiplier: 2,
            });
        }

        const multipliers_object = {
            multiplier: multipliers_total,
            data: multipliers,
            maxmultiplier: multipliers_max,
        };

        return multipliers_object;
    }
}

module.exports = Userfunctions;
