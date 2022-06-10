const economyModel = require('../../models/economySchema');
const inventoryModel = require('../../models/inventorySchema');
const userModel = require('../../models/userSchema')
const statsModel = require('../../models/statsSchema')

module.exports = async(client, discord, member) => {
    userData = await economyModel.findOne({ userId: member.id });
    if(!userData) {
        let user = await economyModel.create({
            userId: member.id,
        });
    
        user.save();
    }

    profileData = await userModel.findOne({ userId: member.id });
    if(!profileData) {
        let user = await userModel.create({
            userId: member.id,
        });
    
        user.save();
    }

    inventoryData = await inventoryModel.findOne({ userId: member.id });
    if(!inventoryData) {
        let user = await inventoryModel.create({
            userId: member.id,
        });
    
        user.save();
    }

    statsData = await statsModel.findOne({ userId: member.id });
    if(!statsData) {
        let user = await statsModel.create({
            userId: member.id,
        });
    
        user.save();
    }
}