const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const allItems = require('../data/all_items');

module.exports = {
    name: "profile",
    aliases: ['exp', 'level', 'lvl'],
    cooldown: 2,
    minArgs: 0,
    maxArgs: 1,
    description: "check the user profile.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const bankspace = profileData.bankspace + profileData.expbankspace;

        if(message.mentions.users.first()) {
            const target = message.mentions.users.first()
            const target_id = target.id

            let target_profileData;
            try {   
                target_profileData = await profileModel.findOne({ userId: target_id });

                if(!target_profileData) {
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

                    const embed = {
                        color: 'RANDOM',
                        title: `${target.username}'s Profile`,
                        author: {
                            name: `_____________`,
                            icon_url: `${target.displayAvatarURL()}`,
                        },
                        thumbnail: {
                            url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                        },
                        fields: [
                            {
                                name: 'Level',
                                value: `Level: \`0\`\nExperience Points: \`0\``,
                                inline: true,
                            },
                            {
                                name: 'Balance',
                                value: `Wallet: ❀ \`0\`\nBank: ❀ \`0\`\nBankspace: \`1,000\`\nTotal Balance: ❀ \`0\``,
                                inline: true,
                            },
                            {
                                name: 'Inv',
                                value: `\`Unique Items: \`0\`\nTotal Items: \`0\`\nItems Worth: ❀ \`0\`\``,
                            },
                            
                        ],
                        timestamp: new Date(),
                    };
                    message.channel.send({ embeds: [embed] });
                } else {
                    let itemsworth = 0;
                    let items = 0;
                    let uniqueitems = 0;
        
                    inventoryModel.findOne(
                        {
                            userId: target.id
                        }, async(err, data) => {
                            if(!data) {
                                itemsworth = 0;
                                items = 0;
                                uniqueitems = 0;
                            } else {
                                Object.keys(data.inventory)
                                .forEach((key) => {
                                    if(data.inventory[key] === 0) {
                                        return;
                                    } else {
                                        const item = allItems.find((val) => (val.item.toLowerCase()) === key);
        
                                        itemsworth = itemsworth + (item.value * data.inventory[key]);
                                        uniqueitems = uniqueitems + 1;
                                        items = items + data.inventory[key]
        
                                                    
                                        
                                    }
        
                                })
                                const total_balance = target_profileData.coins + target_profileData.bank;
                                const bankspace = target_profileData.bankspace + target_profileData.expbankspace;


                                const embed = {
                                    color: 'RANDOM',
                                    title: `${target.username}'s Profile`,
                                    author: {
                                        name: `_____________`,
                                        icon_url: `${target.displayAvatarURL()}`,
                                    },
                                    thumbnail: {
                                        url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                                    },
                                    fields: [
                                        {
                                            name: 'Level',
                                            value: `Level: \`${target_profileData.level.toLocaleString()}\`\nExperience Points: \`${target_profileData.experiencepoints.toLocaleString()}\``,
                                            inline: true,
                                        },
                                        {
                                            name: 'Balance',
                                            value: `Wallet: ❀ \`${target_profileData.coins.toLocaleString()}\`\nBank: ❀ \`${target_profileData.bank.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: ❀ \`${total_balance.toLocaleString()}\``,
                                            inline: true,
                                        },
                                        {
                                            name: 'Inv',
                                            value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: ❀ \`${itemsworth.toLocaleString()}\``,
                                        },
                                        
                                    ],
                                    timestamp: new Date(),
                                };
                                return message.channel.send({ embeds: [embed] });
                            }
                            const total_balance = target_profileData.coins + target_profileData.bank;
                            const bankspace = target_profileData.bankspace + target_profileData.expbankspace;


                            const embed = {
                                color: 'RANDOM',
                                title: `${target.username}'s Profile`,
                                author: {
                                    name: `_____________`,
                                    icon_url: `${target.displayAvatarURL()}`,
                                },
                                thumbnail: {
                                    url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                                },
                                fields: [
                                    {
                                        name: 'Level',
                                        value: `Level: \`${target_profileData.level.toLocaleString()}\`\nExperience Points: \`${target_profileData.experiencepoints.toLocaleString()}\``,
                                        inline: true,
                                    },
                                    {
                                        name: 'Balance',
                                        value: `Wallet: ❀ \`${target_profileData.coins.toLocaleString()}\`\nBank: ❀ \`${target_profileData.bank.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: ❀ \`${total_balance.toLocaleString()}\``,
                                        inline: true,
                                    },
                                    {
                                        name: 'Inv',
                                        value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: ❀ \`${itemsworth.toLocaleString()}\``,
                                    },
                                    
                                ],
                                timestamp: new Date(),
                            };
                            return message.channel.send({ embeds: [embed] });
                        }
                    )
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            let itemsworth = 0;
            let items = 0;
            let uniqueitems = 0;

            inventoryModel.findOne(
                {
                    userId: message.author.id
                }, async(err, data) => {
                    if(!data) {
                        itemsworth = 0;
                        items = 0;
                        uniqueitems = 0;
                    } else {
                        Object.keys(data.inventory)
                        .forEach((key) => {
                            if(data.inventory[key] === 0) {
                                return;
                            } else {
                                const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                                itemsworth = itemsworth + (item.value * data.inventory[key]);
                                uniqueitems = uniqueitems + 1;
                                items = items + data.inventory[key]

                                            
                                
                            }

                        })
                        const total_balance = profileData.coins + profileData.bank;

                        const embed = {
                            color: 'RANDOM',
                            title: `${message.author.username}'s Profile`,
                            author: {
                                name: `_____________`,
                                icon_url: `${message.author.displayAvatarURL()}`,
                            },
                            thumbnail: {
                                url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                            },
                            fields: [
                                {
                                    name: 'Level',
                                    value: `Level: \`${profileData.level.toLocaleString()}\`\nExperience Points: \`${profileData.experiencepoints.toLocaleString()}\``,
                                    inline: true,
                                },
                                {
                                    name: 'Balance',
                                    value: `Wallet: ❀ \`${profileData.coins.toLocaleString()}\`\nBank: ❀ \`${profileData.bank.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: ❀ \`${total_balance.toLocaleString()}\``,
                                    inline: true,
                                },
                                {
                                    name: 'Inventory',
                                    value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: ❀ \`${itemsworth.toLocaleString()}\``,
                                },
                                
                            ],
                            timestamp: new Date(),
                        };
                        return message.channel.send({ embeds: [embed] });
                    }
                    const total_balance = profileData.coins + profileData.bank;

                    const embed = {
                        color: 'RANDOM',
                        title: `${message.author.username}'s Profile`,
                        author: {
                            name: `_____________`,
                            icon_url: `${message.author.displayAvatarURL()}`,
                        },
                        thumbnail: {
                            url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                        },
                        fields: [
                            {
                                name: 'Level',
                                value: `Level: \`${profileData.level.toLocaleString()}\`\nExperience Points: \`${profileData.experiencepoints.toLocaleString()}\``,
                                inline: true,
                            },
                            {
                                name: 'Balance',
                                value: `Wallet: ❀ \`${profileData.coins.toLocaleString()}\`\nBank: ❀ \`${profileData.bank.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: ❀ \`${total_balance.toLocaleString()}\``,
                                inline: true,
                            },
                            {
                                name: 'Inventory',
                                value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: ❀ \`${itemsworth.toLocaleString()}\``,
                            },
                            
                        ],
                        timestamp: new Date(),
                    };
                    return message.channel.send({ embeds: [embed] });
                }
            )
    
        }

    },

}