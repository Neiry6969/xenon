const { Collection, MessageActionRow, MessageSelectMenu } = require('discord.js');

const profileModel = require("../models/profileSchema");
const inventoryModel = require("../models/inventorySchema");
const allItems = require('../data/all_items');

function rankingicons(rank) {
    if(rank === 1) {
        return '<:goldencrown:974761077269233664>'
    } else if(rank === 2) {
        return '<:silvercrown:974760964702490634>'
    } else if(rank === 3) {
        return '<:bronzecrown:974755534345490443>'
    } else {
        return '<a:finetrophy:968660247977803787>'
    }
}

module.exports = {
    name: 'rich',
    aliases: ['leaderb', 'lb', 'leaderboard'],
    cooldown: 15,
    description: "Check the leaderboard.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const collection = new Collection();
        // const collection1 = new Collection();
        // const collection2 = new Collection();

        await Promise.all(
            message.guild.members.cache.map(async(member) => {
                const id = member.id;
                let user;
                try {   
                    user = await profileModel.findOne({ userId: id });
                    if(!user) {
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
                            commands: 1,
                            deaths: 0,
                            premium: 0,
                        });
                    
                        profile.save();
            
                        user = profile;
                    }
                } catch (error) {
                    console.log(error)
                }

                const netbalance = user?.coins + user?.bank

                return netbalance !== 0 && id !== '847528987831304192' && netbalance !== null ? collection.set(id, {
                    id,
                    netbalance
                })
                : null
            })
            
        )

        let data = collection.sort((a, b) => b.netbalance - a.netbalance).first(10)

        let leaderboard = data.map((v, i) => {
            return `${rankingicons(i + 1)} ❀ \`${v.netbalance?.toLocaleString()}\` ${client.users.cache.get(v.id).tag}`
        }).join('\n')

        let leaderboardmenu = new MessageSelectMenu()
            .setCustomId('leaderboardmenu')
            .setMinValues(0)
            .setMaxValues(1)
            .setDisabled(true)
            .addOptions([
                {
                    label: 'Net Balance',
                    value: 'netbalance',
                    default: true,
                },
                {
                    label: 'Net Worth',
                    value: 'networth',
                },
                {
                    label: 'Inventory Worth',
                    value: 'inventoryworth',
                },
            ])

        let row = new MessageActionRow()
            .addComponents(
                leaderboardmenu
            );

        
        embed = {
            color: 'RANDOM',
            title: `${message.guild.name} Net Balance Leaderboard`,
            description: `${leaderboard ? leaderboard : 'There is no rich people in this server rip. This can also be because members have not been cached.'}`,
            timestamp: new Date(),
        };

        
        const leaderboard_msg = await message.channel.send({ embeds: [embed], components: [row] });

        const collector = leaderboard_msg.createMessageComponentCollector({ time: 20 * 1000 });

        collector.on('collect', async (i) => {
            if(i.user.id != message.author.id) {
                return i.reply({
                    content: 'This is not for you.',
                    ephemeral: true,
                })
            } 

            i.deferUpdate()
            if(i.customId === 'leaderboardmenu') {
                if(i.values[0] === 'networth') {
                    embed = {
                        color: 'RANDOM',
                        title: `${message.guild.name} Net Worth Leaderboard`,
                        description: `Yet to be made.`,
                        timestamp: new Date(),
                    };

                    leaderboard_msg.edit({ embeds: [embed], components: [row] });
                } else if(i.values[0] === 'inventoryworth') {
                    embed = {
                        color: 'RANDOM',
                        title: `${message.guild.name} Net Inventory Worth Leaderboard`,
                        description: `Yet to be made.`,
                        timestamp: new Date(),
                    };

                    leaderboardmenu
                    leaderboard_msg.edit({ embeds: [embed], components: [row] });
                } else if(i.values[0] === 'netbalance') {
                    data = collection.sort((a, b) => b.netbalance - a.netbalance).first(10)

                    leaderboard = data.map((v, i) => {
                        return `${i + 1 === 1 ? '<:creatorscrown:965024171463688323>' : '<:silvercrown:963568001213403196>'} \`${v.netbalance?.toLocaleString()}\` ${client.users.cache.get(v.id).tag}`
                    }).join('\n')
                    
                    leaderboard_msg.edit({ embeds: [embed], components: [row] });
                }
            }
        })


        collector.on('end', collected => {
            leaderboard_msg.components[0].components.forEach(c => {c.setDisabled()})
            leaderboard_msg.edit({
                components: leaderboard_msg.components
            })
        });
    }
    
}