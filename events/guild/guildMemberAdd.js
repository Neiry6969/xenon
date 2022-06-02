const EconomyModel = require('../../models/economySchema');

module.exports = async(client, discord, member) => {
    userData = await EconomyModel.findOne({ userId: member.id });
    if(!userData) {
        let user = await EconomyModel.create({
            userId: member.id,
        });
    
        user.save();
    }
}