const shopItems = require('../items/shop_items');
const allItems = require('../items/all_items');
const inventoryModel = require('../models/inventorySchema');

module.exports = {
    name: "shop",
    aliases: ["store", "item"],
    cooldown: 5,
    maxArgs: 0,
    description: 'see what is in the item shop.',
    async execute(message, args, cmd, client, Discord, profileData) {
        const getItem = args[0];

        if(!getItem) {
            const shopList = shopItems
            .map((value) => {
                return `${value.icon} **${value.name}**    **───**   ❀ \`${value.price.toLocaleString()}\`\nItem ID: \`${value.item}\``;
            })
            .join("\n\n")

            const embed = {
                color: '#AF97FE',
                title: `Xenon Shop`,
                description: `${shopList}`,
            };

            return message.reply({ embeds: [embed] });
        } else if(getItem) {
            const validItem = !!allItems.find((val) => (val.item.toLowerCase() === getItem));

            if(validItem) {
                const item = allItems.find((val) => (val.item.toLowerCase()) === getItem);

                const params_user = {
                    userId: message.author.id,
                }
        
                inventoryModel.findOne(params_user, async(err, data) => {
                    let itemOwned;

                    if(!data.inventory[getItem]) {
                        itemOwned = 0
                        
                        const embed = {
                            color: 'RANDOM',
                            title: `**${item.icon} ${item.name}** (${itemOwned?.toLocaleString()} Owned)`,
                            thumbnail: {
                                url: item.imageUrl,
                            },
                            description: `> ${item.description}`,
                            fields: [
                                {
                                    name: '_ _',
                                    value: `**BUY:** ❀ \`${item.price?.toLocaleString()}\`\n**SELL:** ❀ \`${item.sell?.toLocaleString()}\`\n**TRADE:** ❀ \`${item.trade?.toLocaleString()}\``,
                                },
                                {
                                    name: 'ID',
                                    value: `\`${item.item}\``,
                                    inline: true,
                                },
                                {
                                    name: 'Rarity',
                                    value: `\`${item.rarity}\``,
                                    inline: true,
                                },
                                {
                                    name: 'Type',
                                    value: `\`${item.type}\``,
                                    inline: true,
                                },
                            ],
                            timestamp: new Date(),
                        };
            
                        return message.reply({ embeds: [embed] });
                    } else {
                        itemOwned = data.inventory[getItem]
                        
                        const embed = {
                            color: 'RANDOM',
                            title: `**${item.icon} ${item.name}** (${itemOwned?.toLocaleString()} Owned)`,
                            thumbnail: {
                                url: item.imageUrl,
                            },
                            description: `> ${item.description}`,
                            fields: [
                                {
                                    name: '_ _',
                                    value: `**BUY:** ❀ \`${item.price?.toLocaleString()}\`\n**SELL:** ❀ \`${item.sell?.toLocaleString()}\`\n**TRADE:** ❀ \`${item.trade?.toLocaleString()}\``,
                                },
                                {
                                    name: 'ID',
                                    value: `\`${item.item}\``,
                                    inline: true,
                                },
                                {
                                    name: 'Rarity',
                                    value: `\`${item.rarity}\``,
                                    inline: true,
                                },
                                {
                                    name: 'Type',
                                    value: `\`${item.type}\``,
                                    inline: true,
                                },
                            ],
                            timestamp: new Date(),
                        };
            
                        return message.reply({ embeds: [embed] });
                    }

                   
                })

                
            } else {
                message.reply(`\`${getItem}\` is not even an existing item.`)
            }

        } else {
            const shopList = shopItems
            .map((value) => {
                return `${value.icon} **${value.name}**    **───**   ❀ \`${value.price.toLocaleString()}\`\nItem ID: \`${value.item}\``;
            })
            .join("\n\n")

            const embed = {
                color: '#AF97FE',
                title: `Xenon Shop`,
                description: `${shopList}`,
            };

            return message.reply({ embeds: [embed] });
        }


    }
}