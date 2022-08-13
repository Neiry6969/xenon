const { MessageEmbed } = require("discord.js");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const { fetchAllitemsData } = require("./itemfunctions");

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
            economyData.bank.bankspace +
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

        if (inventoryData.inventory) {
            Object.keys(inventoryData.inventory).forEach((key) => {
                if (inventoryData.inventory[key] === 0) {
                    return;
                } else {
                    const itemData = allitemsData.find(
                        (value) => value.item === key
                    );

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
        };

        return inventoryData_object;
    }
}

module.exports = Currencyfunctions;
