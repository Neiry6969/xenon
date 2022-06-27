const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");

module.exports = async (client, discord, member) => {
    userData = await EconomyModel.findOne({ userId: member.id });
    if (!userData) {
        let user = await EconomyModel.create({
            userId: member.id,
        });

        user.save();
    }

    profileData = await UserModel.findOne({ userId: member.id });
    if (!profileData) {
        let user = await UserModel.create({
            userId: member.id,
        });

        user.save();
    }

    inventoryData = await InventoryModel.findOne({ userId: member.id });
    if (!inventoryData) {
        let user = await InventoryModel.create({
            userId: member.id,
        });

        user.save();
    }

    statsData = await StatsModel.findOne({ userId: member.id });
    if (!statsData) {
        let user = await StatsModel.create({
            userId: member.id,
        });

        user.save();
    }
};
