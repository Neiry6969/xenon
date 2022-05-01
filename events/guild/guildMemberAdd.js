const profileModel = require('../../models/profileSchema');

module.exports = async(client, discord, member) => {
    let profile = await profileModel.create({
        userId: message.author.id,
        serverId: message.guild.id,
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
        prenium: 0,
    });

    profile.save();
}