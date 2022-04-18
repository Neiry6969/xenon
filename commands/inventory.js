const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const allItems = require('../items/all_items');

module.exports = {
    name: 'inventory',
    aliases: ['inv'],
    cooldown: 3,
    description: "check your inventory.",
    async execute(message, args, cmd, client, Discord, profileData) {
        if(message.mentions.users.first()) {
            const target = message.mentions.users.first()
            const target_id = target.id

            const params = {
                userId: target_id,
            }
    
            inventoryModel.findOne(params, async(err, data) => {
                if(!data) return message.reply("This user has nothing in their inventory move along.");
    
                const mappedData = Object.keys(data.inventory)
                    .sort()
                    .map((key) => {
                        const itemIcon = allItems.find((val) => (val.item.toLowerCase()) === key).icon;
                        return `${itemIcon} ${key} \`${data.inventory[key].toLocaleString()}\``
                    }
                    )
                    .join("\n")
    
    
                embed = {
                    color: 'RANDOM',
                    title: `${target.username}'s Inventory`,
                    author: {
                        name: `_____________`,
                        icon_url: `${target.displayAvatarURL()}`,
                    },
                    description: `${mappedData}`,
                    timestamp: new Date(),
                };
    
                message.channel.send({ embeds: [embed] });
            })
        } else {
            const params = {
                userId: message.author.id,
            }
    
            inventoryModel.findOne(params, async(err, data) => {
                if(!data) return message.reply("This has nothing in their inventory move along.");
    
                const mappedData = Object.keys(data.inventory)
                    .sort()
                    .map((key) => {
                        if(data.inventory[key] === 0) {
                            return;
                        } else {
                            const itemIcon = allItems.find((val) => (val.item.toLowerCase()) === key).icon;
                            return `${itemIcon} ${key} \`${data.inventory[key].toLocaleString()}\``;
                        }
                    }
                    )
                    .filter(Boolean)
                    .join("\n")
    
                embed = {
                    color: 'RANDOM',
                    title: `${message.author.username}'s Inventory`,
                    author: {
                        name: `_____________`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                    },
                    description: `${mappedData}`,
                    timestamp: new Date(),
                };
    
                message.channel.send({ embeds: [embed] });
            })
        }
    }
}