const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const allItems = require('../data/all_items');

module.exports = {
    name: "balance",
    aliases: ['bal', 'bl'],
    cooldown: 3,
    minArgs: 0,
    maxArgs: 1,
    description: "check the user balance.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const bankspace = profileData.bankspace + profileData.expbankspace;
        let target;

        if(message.mentions.users.first()) {
            target = message.mentions.users.first()
        } else {
            try {
                const featch_user = await message.guild.members.fetch(args[0])
                target = featch_user.user
            } catch (error) {
                target = null
            }
        }
         
       
        
        if(target) {
            let target_profileData;
            try {   
                target_profileData = await profileModel.findOne({ userId: target.id });

                if(!target_profileData) {
                    let profile = await profileModel.create({
                        userId: target.id,
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
                        premium: 0,
                    });
                
                    profile.save();

                    const embed = {
                        color: 'RANDOM',
                        title: `${target.username}'s Balance`,
                        author: {
                            name: `_____________`,
                            icon_url: `${target.displayAvatarURL()}`,
                        },
                        thumbnail: {
                            url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                        },
                        fields: [
                            {
                                name: 'Wallet',
                                value: `\`❀ ${profile.coins.toLocaleString()}\``,
                            },
                            {
                                name: 'Bank',
                                value: `\`❀ ${profile.bank.toLocaleString()}\` | \`${profile.bankspace.toLocaleString()}\` \`0.00%\``,
                            },
                            {
                                name: 'Net Worth',
                                value: `\`❀ 0\``
                            }
                            
                        ],
                        timestamp: new Date(),
                    };

                    return message.channel.send({ embeds: [embed] });
                } else {
                    const bankspace = target_profileData.bankspace + target_profileData.expbankspace;
                    const bank_percent_filled = ((target_profileData.bank / bankspace) * 100).toFixed(2);

                    let itemsworth = 0;
        
                    inventoryModel.findOne(
                        {
                            userId: target.id
                        }, async(err, data) => {
                            if(!data) {
                                itemsworth = 0;
                            } else {
                                Object.keys(data.inventory)
                                .forEach((key) => {
                                    if(data.inventory[key] === 0) {
                                        return;
                                    } else {
                                        const item = allItems.find((val) => (val.item.toLowerCase()) === key);
        
                                        itemsworth = itemsworth + (item.value * data.inventory[key]);
                                    }
        
                                })
                                const networth = target_profileData.coins + target_profileData.bank + itemsworth;
                                
                                const embed = {
                                    color: 'RANDOM',
                                    title: `${target.username}'s Balance`,
                                    author: {
                                        name: `_____________`,
                                        icon_url: `${target.displayAvatarURL()}`,
                                    },
                                    thumbnail: {
                                        url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                                    },
                                    fields: [
                                        {
                                            name: 'Wallet',
                                            value: `\`❀ ${target_profileData.coins.toLocaleString()}\``,
                                        },
                                        {
                                            name: 'Bank',
                                            value: `\`❀ ${target_profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``,
                                        },
                                        {
                                            name: 'Net Worth',
                                            value: `\`❀ ${networth.toLocaleString()}\``
                                        }
                                        
                                    ],
                                    timestamp: new Date(),
                                };
                                return message.channel.send({ embeds: [embed] });
                            }
                            const networth = target_profileData.coins + target_profileData.bank + itemsworth;
                                
                            const embed = {
                                color: 'RANDOM',
                                title: `${target.username}'s Balance`,
                                author: {
                                    name: `_____________`,
                                    icon_url: `${target.displayAvatarURL()}`,
                                },
                                thumbnail: {
                                    url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                                },
                                fields: [
                                    {
                                        name: 'Wallet',
                                        value: `\`❀ ${target_profileData.coins.toLocaleString()}\``,
                                    },
                                    {
                                        name: 'Bank',
                                        value: `\`❀ ${target_profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``,
                                    },
                                    {
                                        name: 'Net Worth',
                                        value: `\`❀ ${networth.toLocaleString()}\``
                                    }
                                    
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
            const bank_percent_filled = ((profileData.bank / bankspace) * 100).toFixed(2);
            let itemsworth = 0;
        
            inventoryModel.findOne(
                {
                    userId: message.author.id
                }, async(err, data) => {
                    if(!data) {
                        itemsworth = 0;
                    } else {
                        Object.keys(data.inventory)
                        .forEach((key) => {
                            if(data.inventory[key] === 0) {
                                return;
                            } else {
                                const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                                itemsworth = itemsworth + (item.value * data.inventory[key]);
                            }

                        })
                        const networth = profileData.coins + profileData.bank + itemsworth;

                        const embed = {
                            color: 'RANDOM',
                            title: `${message.author.username}'s Balance`,
                            author: {
                                name: `_____________`,
                                icon_url: `${message.author.displayAvatarURL()}`,
                            },
                            thumbnail: {
                                url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                            },
                            fields: [
                                {
                                    name: 'Wallet',
                                    value: `\`❀ ${profileData.coins.toLocaleString()}\``,
                                },
                                {
                                    name: 'Bank',
                                    value: `\`❀ ${profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``,
                                },
                                {
                                    name: 'Net Worth',
                                    value: `\`❀ ${networth.toLocaleString()}\``
                                }
                                
                            ],
                            timestamp: new Date(),
                        };
                        return message.channel.send({ embeds: [embed] });
                    }
                    const networth = profileData.coins + profileData.bank + itemsworth;

                    const embed = {
                        color: 'RANDOM',
                        title: `${message.author.username}'s Balance`,
                        author: {
                            name: `_____________`,
                            icon_url: `${message.author.displayAvatarURL()}`,
                        },
                        thumbnail: {
                            url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                        },
                        fields: [
                            {
                                name: 'Wallet',
                                value: `\`❀ ${profileData.coins.toLocaleString()}\``,
                            },
                            {
                                name: 'Bank',
                                value: `\`❀ ${profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``,
                            },
                            {
                                name: 'Net Worth',
                                value: `\`❀ ${networth.toLocaleString()}\``
                            }
                            
                        ],
                        timestamp: new Date(),
                    };
                    return message.channel.send({ embeds: [embed] });
                }
            )
        }

    },

}