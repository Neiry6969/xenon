const profileModel = require('../../models/profileSchema');

module.exports = async(client, discord, member) => {
    let profile = await profileModel.create({
        userId: member.id,
        serverId: member.guild.id,
        coins: 0,
        bank: 0,
        bankspace: 1000,
        expbankspace: 0,
        experiencepoints: 0,
        level: 0,
    });

    profile.save();
}