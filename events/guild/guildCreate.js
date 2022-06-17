const guildModel = require('../../models/guildSchema');

module.exports = async(client, discord, guild) => {
    guildData = await guildModel.findOne({ userId: guild.id });
    if(!guildData) {
        let guild = await guildModel.create({
            guildId: guild.id,
        });
    
        guild.save();
    }
}