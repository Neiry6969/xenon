const { MessageEmbed } = require("discord.js");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");
const { fetchAllitemsData, fetchItemData } = require("./itemfunctions");

class Currencyfunctions {
    static async fetchEconomyData(userId) {
        let economyData;
        try {
            economyData = await EconomyModel.findOne({ userId: userId });
            if (!economyData) {
                let economy = await EconomyModel.create({
                    userId: userId,
                });

                economy.save();

                economyData = economy;
            }
        } catch (error) {
            console.log(error);
        }

        const networth = economyData.wallet + economyData.bank.coins;
        const netbankspace =
            economyData.bank.bankmessagespace +
            economyData.bank.expbankspace +
            economyData.bank.otherbankspace;

        const economyData_object = {
            data: economyData,
            networth: networth,
            netbankspace: netbankspace,
        };

        return economyData_object;
    }

    static async fetchInventoryData(userId) {
        const allitemsData = await fetchAllitemsData();
        let inventoryData;
        try {
            inventoryData = await InventoryModel.findOne({ userId: userId });
            if (!inventoryData) {
                let inventory = await InventoryModel.create({
                    userId: userId,
                });

                inventory.save();

                inventoryData = inventory;
            }
        } catch (error) {
            console.log(error);
        }

        let networth = 0;
        let uniqueitems = 0;
        let items = 0;
        if (inventoryData.inventory) {
            Object.keys(inventoryData.inventory).forEach((key) => {
                if (inventoryData.inventory[key] === 0) {
                    return;
                } else {
                    const itemData = allitemsData.find(
                        (value) => value.item === key
                    );
                    uniqueitems = uniqueitems + 1;
                    items = items + inventoryData.inventory[key];
                    networth =
                        networth +
                        itemData.value * inventoryData.inventory[key];

                    return;
                }
            });
        }

        const inventoryData_object = {
            data: inventoryData,
            networth: networth,
            uniqueitems: uniqueitems,
            items: items,
        };

        return inventoryData_object;
    }

    static async fetchStatsData(userId) {
        let statsData;
        try {
            statsData = await StatsModel.findOne({ userId: userId });
            if (!statsData) {
                let stats = await StatsModel.create({
                    userId: userId,
                });

                stats.save();

                statsData = stats;
            }
        } catch (error) {
            console.log(error);
        }

        const statsData_object = {
            data: statsData,
        };

        return statsData_object;
    }

    static async fetchUserData(userId) {
        let userData;
        try {
            userData = await UserModel.findOne({ userId: userId });
            if (!userData) {
                let user = await UserModel.create({
                    userId: userId,
                });

                user.save();

                userData = user;
            }
        } catch (error) {
            console.log(error);
        }

        const userData_object = {
            data: userData,
        };

        return userData_object;
    }

    static async addCoins(userId, coins) {
        let economyData;
        try {
            economyData = await EconomyModel.findOne({ userId: userId });
            if (!economyData) {
                let economy = await EconomyModel.create({
                    userId: userId,
                });

                economy.save();

                economyData = economy;
            }
        } catch (error) {
            console.log(error);
        }

        economyData.wallet = economyData.wallet + coins;
        return await EconomyModel.findOneAndUpdate(
            { userId: economyData.userId },
            economyData
        );
    }

    static async removeCoins(userId, coins) {
        let economyData;
        try {
            economyData = await EconomyModel.findOne({ userId: userId });
            if (!economyData) {
                let economy = await EconomyModel.create({
                    userId: userId,
                });

                economy.save();

                economyData = economy;
            }
        } catch (error) {
            console.log(error);
        }

        economyData.wallet = economyData.wallet - coins;
        return await EconomyModel.findOneAndUpdate(
            { userId: economyData.userId },
            economyData
        );
    }

    static async addItem(userId, item, quantity) {
        const itemData = await fetchItemData(item);
        let inventoryData;
        try {
            inventoryData = await InventoryModel.findOne({ userId: userId });
            if (!inventoryData) {
                let inventory = await InventoryModel.create({
                    userId: userId,
                });

                inventory.save();

                inventoryData = inventory;
            }
        } catch (error) {
            console.log(error);
        }

        const hasItem = Object.keys(inventoryData.inventory).includes(
            itemData.item
        );
        if (!hasItem) {
            inventoryData.inventory[itemData.item] = quantity;
        } else {
            inventoryData.inventory[itemData.item] =
                inventoryData.inventory[itemData.item] + quantity;
        }
        return await InventoryModel.findOneAndUpdate(
            { userId: inventoryData.userId },
            inventoryData
        );
    }
    static async removeItem(userId, item, quantity) {
        const itemData = await fetchItemData(item);
        let inventoryData;
        try {
            inventoryData = await InventoryModel.findOne({ userId: userId });
            if (!inventoryData) {
                let inventory = await InventoryModel.create({
                    userId: userId,
                });

                inventory.save();

                inventoryData = inventory;
            }
        } catch (error) {
            console.log(error);
        }

        inventoryData.inventory[itemData.item] =
            inventoryData.inventory[itemData.item] - quantity;
        return await InventoryModel.findOneAndUpdate(
            { userId: inventoryData.userId },
            inventoryData
        );
    }
}

module.exports = Currencyfunctions;
