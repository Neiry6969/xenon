const profileModel = require('../../models/profileSchema');
const userModel = require('../../models/userSchema');
const inventoryModel = require('../../models/inventorySchema')

module.exports = async(client, discord, member) => {
    profileData = await profileModel.findOne({ userId: member.id });
    if(!profileData) {
        let profile = await profileModel.create({
            userId: member.id,
            serverId: member.guild.id,
            coins: 0,
            bank: 0,
            bankspace: 1000,
            expbankspace: 0,
            experiencepoints: 0,
            level: 0,
            dailystreak: 0,
            prestige: 0,
            commands: 0,
            deaths: 0,
            premium: 0,
        });
    
        profile.save();
    }


    userData = await userModel.findOne({ userId: message.author.id });
    if(!userData) {
        let user = await profileModel.create({
            userId: member.id,
        });
    
        user.save();
    }

    inventoryData = await inventoryModel.findOne({ userId: message.author.id });
    if(!inventoryData) {
        let inventory = await inventoryModel.create({
            userId: member.id,
        });
    
        inventory.save();
    }
}