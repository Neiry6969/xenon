const profileModel = require("../models/profileSchema");

module.exports = {
    name: "test",
    cooldown: 2,
    description: "test.",
    async execute(message, args, cmd, client, Discord, profileData) {
        if(message.author.id === '567805802388127754') {
            profileModel.find().then(data => {
                profileModel.findOneAndUpdate({ userId: data.userId }, {
                    userId: data.userId,
                    serverId: data.serverId,
                    coins: data.coins,
                    bank: data.bank,
                    bankspace: data.bankspace,
                    expbankspace: data.expbankspace,
                    experiencepoints: data.experiencepoints,
                    level: data.level,
                    dailystreak: data.dailystreak,
                    prestige: data.prestige,
                    commands: data.commands,
                    deaths: data.deaths,
                    premium: data.premium,
                    awaitinginteraction: false
                })
                console.log('data')
            })
        } else {
            return message.channel.send("OK.");
        }
    }
}