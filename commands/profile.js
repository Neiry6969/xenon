const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const allItems = require('../data/all_items');

function calcexpfull(level) {
    if(level < 50) {
        return level * 10 + 100;
    } else if(level >= 50 && level < 500) {
        return level * 25
    } else if(level >= 500 && level < 1000) {
        return level * 50
    } else if(level >= 1000) {
        return level * 100
    }
}

function bardisplay(percent) {
    if (percent <= 20) {
        const bar =
        "<:barmidempty:975528569881104385><:barmidempty:975528569881104385><:barmidempty:975528569881104385><:barendempty:975529693640028211>";
        const leftperc = 20 - percent;
        if (leftperc > 15) {
            return "<:barstartempty:975528227214876713>" + bar;
        } else if (leftperc > 10) {
            return "<:barstartlow:975528109900197990>" + bar;
        } else if (leftperc > 5) {
            return "<:barstartmid:975527911522181150>" + bar;
        } else if (leftperc > 0) {
            return "<:barstarthigh:975527916836360294>" + bar;
        } else if (leftperc === 0) {
            return "<:barstartfull:975526638831955968>" + bar;
        }
    } else if (percent <= 40) {
        const bars = "<:barstartfull:975526638831955968>";
        const bare =
        "<:barmidempty:975528569881104385><:barmidempty:975528569881104385><:barendempty:975529693640028211>";
        const leftperc = 40 - percent;
        if (leftperc > 15) {
            return bars + "<:barmidempty:975528569881104385>" + bare;
        } else if (leftperc > 10) {
            return bars + "<:barmidlow:975527412676849674>" + bare;
        } else if (leftperc > 5) {
            return bars + "<:barmidmid:975527288768696400>" + bare;
        } else if (leftperc > 0) {
            return bars + "<:barmidhigh:975526979598180412>" + bare;
        } else if (leftperc === 0) {
            return bars + "<:barmidfull:975526638697734237>" + bare;
        }
    } else if (percent <= 60) {
        const bars =
        "<:barstartfull:975526638831955968><:barmidfull:975526638697734237>";
        const bare =
        "<:barmidempty:975528569881104385><:barendempty:975529693640028211>";
        const leftperc = 60 - percent;
        if (leftperc > 15) {
            return bars + "<:barmidempty:975528569881104385>" + bare;
        } else if (leftperc > 10) {
            return bars + "<:barmidlow:975527412676849674>" + bare;
        } else if (leftperc > 5) {
            return bars + "<:barmidmid:975527288768696400>" + bare;
        } else if (leftperc > 0) {
            return bars + "<:barmidhigh:975526979598180412>" + bare;
        } else if (leftperc === 0) {
            return bars + "<:barmidfull:975526638697734237>" + bare;
        }
    } else if (percent <= 80) {
        const bars =
        "<:barstartfull:975526638831955968><:barmidfull:975526638697734237><:barmidfull:975526638697734237>";
        const bare = "<:barendempty:975529693640028211>";
        const leftperc = 80 - percent;
        if (leftperc > 15) {
            return bars + "<:barmidempty:975528569881104385>" + bare;
        } else if (leftperc > 10) {
            return bars + "<:barmidlow:975527412676849674>" + bare;
        } else if (leftperc > 5) {
            return bars + "<:barmidmid:975527288768696400>" + bare;
        } else if (leftperc > 0) {
            return bars + "<:barmidhigh:975526979598180412>" + bare;
        } else if (leftperc === 0) {
            return bars + "<:barmidfull:975526638697734237>" + bare;
        }
    } else if (percent <= 100) {
        const bar =
        "<:barstartfull:975526638831955968><:barmidfull:975526638697734237><:barmidfull:975526638697734237><:barmidfull:975526638697734237>";
        const leftperc = 100 - percent;
        if (leftperc > 15) {
            return bar + "<:barendempty:975529693640028211>";
        } else if (leftperc > 10) {
            return bar + "<:barendlow:975533190930391060>";
        } else if (leftperc > 5) {
            return bar + "<:barendmid:975533190934585374>";
        } else if (leftperc >= 0) {
            return bar + "<:barendhigh:975533190980730901>";
        }
    }
}

  

module.exports = {
    name: "profile",
    aliases: ['exp', 'level', 'lvl'],
    cooldown: 5,
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
                        title: `${target.username}'s Profile`,
                        author: {
                            name: `_____________`,
                            icon_url: `${target.displayAvatarURL()}`,
                        },
                        thumbnail: {
                            url: 'https://images-ext-1.discordapp.net/external/6nmfj0nBEN12JpYIYi5pCxaqhcaopWIxNlWgGDbbv5g/https/i.gifer.com/UL7g.gif',
                        },
                        description: `${profile.premium > 0 ? `**Prenium:** <:premiumcard:970846275975118958> \`rank ${profile.premium}\`\n` : ""}**Badges:**\n**Prestige:** \`${profile.prestige.toLocaleString()}\``,
                        fields: [
                            {
                                name: 'Level',
                                value: `Level: \`${profile.level.toLocaleString()}\`\nExperience: \`${profile.experiencepoints.toLocaleString()} | ${calcexpfull(profile.level).toLocaleString()}\`\n${bardisplay(0)}`,
                                inline: true,
                            },
                            {
                                name: 'Balance',
                                value: `Wallet: ❀ \`0\`\nBank: \`❀ ${profile.bank.toLocaleString()}\`\nBankspace: \`${profile.bankspace.toLocaleString()}\`\nTotal Balance: ❀ \`0\``,
                                inline: true,
                            },
                            {
                                name: 'Inv',
                                value: `Unique Items: \`0\`\nTotal Items: \`0\`\nItems Worth: ❀ \`0\``,
                            },
                            { 
                                name: 'Other (MISC)',
                                value: `Daily Streak: <a:Lssl:806961744885973062>\`0\`\nCommands Issued: \`0\`\nDeaths: <:ghost:978412292012146688> \`0\``,
                            },
                            
                        ],
                        timestamp: new Date(),
                    };
                    return message.channel.send({ embeds: [embed] });
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
                                    description: `${target_profileData.premium > 0 ? `**Prenium:** <:premiumcard:970846275975118958> \`rank ${target_profileData.premium}\`\n` : ""}**Badges:**\n**Prestige:** \`${target_profileData.prestige.toLocaleString()}\``,
                                    fields: [
                                        {
                                            name: 'Level',
                                            value: `Level: \`${target_profileData.level.toLocaleString()}\`\nExperience: \`${target_profileData.experiencepoints.toLocaleString()} | ${calcexpfull(target_profileData.level).toLocaleString()}\`\n${bardisplay(parseInt(target_profileData.experiencepoints / calcexpfull(target_profileData.level) * 100))}`,
                                            inline: true,
                                        },
                                        {
                                            name: 'Balance',
                                            value: `Wallet: \`❀ ${target_profileData.coins.toLocaleString()}\`\nBank: \`❀ ${target_profileData.bank.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: \`❀ ${total_balance.toLocaleString()}\``,
                                            inline: true,
                                        },
                                        {
                                            name: 'Inv',
                                            value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: \`❀ ${itemsworth.toLocaleString()}\``,
                                        },
                                        { 
                                            name: 'Other (MISC)',
                                            value: `Daily Streak: <a:Lssl:806961744885973062> \`${target_profileData.dailystreak.toLocaleString()}\`\nCommands Issued: \`${target_profileData.commands.toLocaleString()}\`\nDeaths: <:ghost:978412292012146688> \`${target_profileData.deaths.toLocaleString()}\`\nCreated At: <t:${new Date(target_profileData.createdAt / 1000).getTime()}:D>`,
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
                                description: `${target_profileData.premium > 0 ? `**Prenium:** <:premiumcard:970846275975118958> \`rank ${target_profileData.premium}\`\n` : ""}**Badges:**\n**Prestige:** \`${target_profileData.prestige.toLocaleString()}\``,
                                fields: [
                                    {
                                        name: 'Level',
                                        value: `Level: \`${target_profileData.level.toLocaleString()}\`\nExperience: \`${target_profileData.experiencepoints.toLocaleString()} | ${calcexpfull(target_profileData.level).toLocaleString()}\`\n${bardisplay(parseInt(target_profileData.experiencepoints / calcexpfull(target_profileData.level) * 100))}`,
                                        inline: true,
                                    },
                                    {
                                        name: 'Balance',
                                        value: `Wallet: \`❀ ${target_profileData.coins.toLocaleString()}\`\nBank: \`❀ ${target_profileData.bank.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: \`❀ ${total_balance.toLocaleString()}\``,
                                        inline: true,
                                    },
                                    {
                                        name: 'Inv',
                                        value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: \`❀ ${itemsworth.toLocaleString()}\``,
                                    },
                                    { 
                                        name: 'Other (MISC)',
                                        value: `Daily Streak: <a:Lssl:806961744885973062> \`${target_profileData.dailystreak.toLocaleString()}\`\nCommands Issued: \`${target_profileData.commands.toLocaleString()}\`\nDeaths: <:ghost:978412292012146688> \`${target_profileData.deaths.toLocaleString()}\`\nCreated At: <t:${new Date(target_profileData.createdAt / 1000).getTime()}:D>`,
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
                            description: `${profileData.premium > 0 ? `**Prenium:** <:premiumcard:970846275975118958> \`rank ${profileData.premium}\`\n` : ""}**Badges:**\n**Prestige:** \`${profileData.prestige.toLocaleString()}\``,
                            fields: [
                                {
                                    name: 'Level',
                                    value: `Level: \`${profileData.level.toLocaleString()}\`\nExperience: \`${profileData.experiencepoints.toLocaleString()} | ${calcexpfull(profileData.level).toLocaleString()}\`\n${bardisplay(parseInt(profileData.experiencepoints / calcexpfull(profileData.level) * 100))}`,
                                    inline: true,
                                },
                                {
                                    name: 'Balance',
                                    value: `Wallet: \`❀ ${profileData.coins.toLocaleString()}\`\nBank: \`❀ ${profileData.bank.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: \`❀ ${total_balance.toLocaleString()}\``,
                                    inline: true,
                                },
                                {
                                    name: 'Inventory',
                                    value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: \`❀ ${itemsworth.toLocaleString()}\``,
                                },
                                { 
                                    name: 'Other (MISC)',
                                    value: `Daily Streak: <a:Lssl:806961744885973062> \`${profileData.dailystreak.toLocaleString()}\`\nCommands Issued: \`${profileData.commands.toLocaleString()}\`\nDeaths: <:ghost:978412292012146688> \`${profileData.deaths.toLocaleString()}\`\nCreated At: <t:${new Date(profileData.createdAt / 1000).getTime()}:D>`,
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
                        description: `${profileData.premium > 0 ? `**Prenium:** <:premiumcard:970846275975118958> \`rank ${profileData.premium}\`\n` : ""}**Badges:**\n**Prestige:** \`${profileData.prestige.toLocaleString()}\``,
                        fields: [
                            {
                                name: 'Level',
                                value: `Level: \`${profileData.level.toLocaleString()}\`\nExperience: \`${profileData.experiencepoints.toLocaleString()} | ${calcexpfull(profileData.level).toLocaleString()}\`\n${bardisplay(parseInt(profileData.experiencepoints / calcexpfull(profileData.level) * 100))}`,
                                inline: true,
                            },
                            {
                                name: 'Balance',
                                value: `Wallet: \`❀ ${profileData.coins.toLocaleString()}\`\nBank: \`❀ ${profileData.bank.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: \`❀ ${total_balance.toLocaleString()}\``,
                                inline: true,
                            },
                            {
                                name: 'Inventory',
                                value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: \`❀ ${itemsworth.toLocaleString()}\``,
                            },
                            { 
                                name: 'Other (MISC)',
                                value: `Daily Streak: <:streakflame:978108608254459954> \`${profileData.dailystreak.toLocaleString()}\`\nCommands Issued: \`${profileData.commands.toLocaleString()}\`\nDeaths: <:ghost:978412292012146688> \`${profileData.deaths.toLocaleString()}\`\nCreated At: <t:${new Date(profileData.createdAt / 1000).getTime()}:D>`,
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