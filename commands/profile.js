const economyModel = require("../models/economySchema");
const allItems = require('../data/all_items');

const { MessageEmbed } = require('discord.js')

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
    description: "Check the user profile.",
    async execute(message, args, cmd, client, Discord, userData) {
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
            const target_id = target.id
            let targetData;
            try {   
                targetData = await economyModel.findOne({ userId: target_id });

                const embed = new MessageEmbed() 
                    .setColor('RANDOM')
                    .setTitle('Profile')
                    .setAuthor({
                        name: `${target.username}#${target.discriminator}`,
                        iconURL: target.displayAvatarURL(),
                    })

                if(!targetData) {
                    const targetdata = await economyModel.create({
                        userId: target.id,
                    })

                    targetdata.save();

                    embed
                        .setDescription(
                            `**Prestige:** \`0\``
                        )
                        .addFields(
                            {
                                name: 'Level',
                                value: `Level: \`0\`\nExperience: \`0 | ${calcexpfull(0).toLocaleString()}\`\n${bardisplay(0)}`,
                                inline: true,
                            },
                            {
                                name: 'Balance',
                                value: `Wallet: \`❀ 0\`\nBank: \`❀ 0\`\nBankspace: \`1000\`\nTotal Balance: \`❀ 0\``,
                                inline: true,
                            },
                            {
                                name: 'Inv',
                                value: `Unique Items: \`0\`\nTotal Items: \`0\`\nItems Worth: \`❀ 0\``,
                            },
                            { 
                                name: 'Other (MISC)',
                                value: `Daily Streak: <a:Lssl:806961744885973062>\`0\`\nCommands Issued: \`0\`\nDeaths: <:ghost:978412292012146688> \`0\``,
                            },
                        )
                } else {     
                    const total_balance = targetData.wallet + targetData.bank.coins;
                    const bankspace = targetData.bank.bankspace + targetData.bank.expbankspace + targetData.bank.otherbankspace;
                    let itemsworth = 0;
                    let items = 0;
                    let uniqueitems = 0;

                    if(!targetData.inventory) {
                        itemsworth = 0;
                        items = 0;
                        uniqueitems = 0;
                    } else {
                        Object.keys(targetData.inventory)
                        .forEach((key) => {
                            if(targetData.inventory[key] === 0) {
                                return;
                            } else {
                                const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                                itemsworth = itemsworth + (item.value * targetData.inventory[key]);
                                uniqueitems = uniqueitems + 1;
                                items = items + targetData.inventory[key]
                            }

                        })
                    }
                    let badges_map;
                    embed
                        .setDescription(
                            `${targetData.premium.rank > 0 ? `**Prenium:** <:premiumcard:970846275975118958> \`rank ${targetData.premium.rank}\`\n` : ""}${badges_map ? `**Badges:**  ${badges_map}\n` : ""}**Prestige:** \`${targetData.prestige.toLocaleString()}\``
                        )
                        .addFields(
                            {
                                name: 'Level',
                                value: `Level: \`${targetData.level.toLocaleString()}\`\nExperience: \`${targetData.experiencepoints.toLocaleString()} | ${calcexpfull(targetData.level).toLocaleString()}\`\n${bardisplay(parseInt(targetData.experiencepoints / calcexpfull(targetData.level) * 100))}`,
                                inline: true,
                            },
                            {
                                name: 'Balance',
                                value: `Wallet: \`❀ ${targetData.wallet.toLocaleString()}\`\nBank: \`❀ ${targetData.bank.coins.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: \`❀ ${total_balance.toLocaleString()}\``,
                                inline: true,
                            },
                            {
                                name: 'Inv',
                                value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: \`❀ ${itemsworth.toLocaleString()}\``,
                            },
                            { 
                                name: 'Other (MISC)',
                                value: `Daily Streak: <a:Lssl:806961744885973062> \`${targetData.streaks.daily.strk.toLocaleString()}\`\nCommands Issued: \`${targetData.commands.toLocaleString()}\`\nDeaths: <:ghost:978412292012146688> \`${targetData.deaths.toLocaleString()}\`\nCreated At: <t:${new Date(targetData.createdAt / 1000).getTime()}:D>`,
                            },
                        )
                }
                
                return message.channel.send({ embeds: [embed] });
            } catch (error) {
                console.log(error)
            }
        } else {
            const premiumrank = userData.premium.rank;
            const bankspace = userData.bank.bankspace + userData.bank.expbankspace + userData.bank.otherbankspace;
            const walletcoins = userData.wallet;
            const bankcoins = userData.bank.coins;
            const total_balance = walletcoins + bankcoins;

            let itemsworth = 0;
            let items = 0;
            let uniqueitems = 0;

            if(userData.inventory) {
                Object.keys(userData.inventory)
                .forEach((key) => {
                    if(userData.inventory[key] === 0) {
                        return;
                    } else {
                        const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                        itemsworth = itemsworth + (item.value * userData.inventory[key]);
                        uniqueitems = uniqueitems + 1;
                        items = items + userData.inventory[key]
                    }
                })
            } 
    

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
                description: `${premiumrank > 0 ? `**Prenium:** <:premiumcard:970846275975118958> \`rank ${premiumrank}\`\n` : ""}**Badges:**\n**Prestige:** \`${userData.prestige.toLocaleString()}\``,
                fields: [
                    {
                        name: 'Level',
                        value: `Level: \`${userData.level.toLocaleString()}\`\nExperience: \`${userData.experiencepoints.toLocaleString()} | ${calcexpfull(userData.level).toLocaleString()}\`\n${bardisplay(parseInt(userData.experiencepoints / calcexpfull(userData.level) * 100))}`,
                        inline: true,
                    },
                    {
                        name: 'Balance',
                        value: `Wallet: \`❀ ${walletcoins.toLocaleString()}\`\nBank: \`❀ ${bankcoins.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nTotal Balance: \`❀ ${total_balance.toLocaleString()}\``,
                        inline: true,
                    },
                    {
                        name: 'Inventory',
                        value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: \`❀ ${itemsworth.toLocaleString()}\``,
                    },
                    { 
                        name: 'Other (MISC)',
                        value: `Daily Streak: <:streakflame:978108608254459954> \`${userData.streaks.daily.strk.toLocaleString()}\`\nCommands Issued: \`${userData.commands.toLocaleString()}\`\nDeaths: <:ghost:978412292012146688> \`${userData.deaths.toLocaleString()}\`\nCreated At: <t:${new Date(userData.createdAt / 1000).getTime()}:D>`,
                    },
                    
                ],
                timestamp: new Date(),
            };
            return message.channel.send({ embeds: [embed] });
    
        }

    },

}