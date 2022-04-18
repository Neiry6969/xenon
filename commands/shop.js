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
                return `${value.icon} **${value.itemName}**    **-**   ❀ \`${value.price.toLocaleString()}\`\nItem ID: \`${value.item}\``;
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
                const item = allItems.find((val) => (val.item.toLowerCase()) === getItem).item;
                const itemPrice = allItems.find((val) => (val.item.toLowerCase()) === getItem).price;
                const itemIcon = allItems.find((val) => (val.item.toLowerCase()) === getItem).icon;
                const itemName = allItems.find((val) => (val.item.toLowerCase()) === getItem).itemName;
                const imageUrl = allItems.find((val) => (val.item.toLowerCase()) === getItem).imageUrl;
                const itemDesc = allItems.find((val) => (val.item.toLowerCase()) === getItem).description;
                const itemRarity = allItems.find((val) => (val.item.toLowerCase()) === getItem).rarity;
                const itemSell = allItems.find((val) => (val.item.toLowerCase()) === getItem).sell;
                const itemTrade = allItems.find((val) => (val.item.toLowerCase()) === getItem).trade;

                const params_user = {
                    userId: message.author.id,
                }
        
                inventoryModel.findOne(params_user, async(err, data) => {
                    let itemOwned;

                    if(!data.inventory[getItem]) {
                        itemOwned = 0
                    } else {
                        itemOwned = data.inventory[getItem]
                        
                        const embed = {
                            color: 'RANDOM',
                            title: `**${itemIcon} ${itemName}** (${itemOwned?.toLocaleString()} Owned)`,
                            description: `> ${itemDesc}`,
                            thumbnail: {
                                url: imageUrl,
                            },
                            description: `> ${itemDesc}`,
                            fields: [
                                {
                                    name: '_ _',
                                    value: `**BUY:** ❀ \`${itemPrice.toLocaleString()}\`\n**SELL:** ❀ \`${itemSell.toLocaleString()}\`\n**TRADE:** ❀ \`${itemTrade.toLocaleString()}\``,
                                },
                                {
                                    name: 'ID',
                                    value: `\`${item}\``,
                                    inline: true,
                                },
                                {
                                    name: 'Rarity',
                                    value: `\`${itemRarity}\``,
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
                return `${value.icon} **${value.itemName}**    **-**   ❀ \`${value.price.toLocaleString()}\`\nItem ID: \`${value.item}\``;
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