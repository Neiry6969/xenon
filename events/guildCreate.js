const GuildModel = require("../models/guildSchema");

module.exports = async (client, discord, guild) => {
    guildData = await GuildModel.findOne({ guildId: guild.id });
    if (!guildData) {
        let guild = await GuildModel.create({
            guildId: guild.id,
        });

        guild.save();
    }
};
