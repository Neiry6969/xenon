const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");

class Currency {
    static async fetchUserData(userId) {
        let userData = await EconomyModel.findOne({
            userId,
        });
        if (!userData) {
            user = new EconomyModel({
                userId,
                Balance: 0,
            });
        }

        return user;
    }

    // static async addCoins(userId, amount) {
    //     let user = await DB.findOne({
    //         userId,
    //     });
    //     if (!user) {
    //         user = new DB({
    //             userId,
    //             Balance: 0,
    //         });
    //     }

    //     if (isNaN(amount))
    //         throw new Error("Amount provided is not a valid Number.");
    //     user.Balance += amount;
    //     user.save();

    //     return user.Balance;
    // }

    // static async removeCoins(userId, amount) {
    //     let user = await DB.findOne({
    //         userId,
    //     });
    //     if (!user) {
    //         user = new DB({
    //             userId,
    //             Balance: 0,
    //         });
    //     }

    //     if (isNaN(amount))
    //         throw new Error("Amount provided is not a valid Number.");
    //     user.Balance -= amount;
    //     user.save();

    //     return user.Balance;
    // }
}

module.exports = Currency;
