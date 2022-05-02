const profileModel = require('../../models/profileSchema');

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

}