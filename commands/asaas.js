const { MessageEmbed } = require('discord.js');


const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const userModel = require("../models/userSchema");


module.exports = {
    name: "editxenonneriseo",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        if(message.author.id === '567805802388127754') {
            const embed = new MessageEmbed()
                .setColor('AQUA')
                .setDescription('Loading... <a:loading:987196796549861376>')

            const msg = await message.reply({ embeds: [embed] })
                
            const editedusers = []
            const not_editedusers = []
            const users = await inventoryModel.find({})
            users.forEach(async(value) => {
                if(!value.inventory['bottleofxenon']) {
                    value.inventory['bottleofxenon'] = 1

                    await editedusers.push(value.userId)
                    await inventoryModel.findOneAndUpdate({ userId: value.userId }, value)
                } else {
                    await not_editedusers.push(value.userId)
                }
            })

            embed 
                .setDescription(`Total Affected Users: \`${editedusers.length}\`\nTotal Not Affected Users: \`${not_editedusers.length}\``)

            return msg.edit({ embeds: [embed] })
        }

        return;
    }
}