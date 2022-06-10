const { Collection, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

const economyModel = require("../models/economySchema");
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
        return '<a:fineribbon:968642962831589427>'
    }
}

module.exports = {
    name: 'rich',
    aliases: ['leaderb', 'lb', 'leaderboard'],
    cooldown: 15,
    description: "Check the leaderboard.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        const collection = new Collection();
        const collection0 = new Collection();
        const collection1 = new Collection();
        
        const embed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`${message.guild.name} Currency Leaderboard`)
                .setDescription(`**Loading**, fetching cached users. This might take a while...`)
                .setTimestamp()

        
        const leaderboard_msg = await message.channel.send({ embeds: [embed]});

        
        await Promise.all(
            message.guild.members.cache.map(async(member) => {
                const id = member.id;
                let itemsworth = 0;

                let inventoryData;
                try {   
                    inventoryData = await inventoryModel.findOne({ userId: id });
                    if(!inventoryData) {
                        inventoryData = null;
                    }
                } catch (error) {
                    console.log(error)
                }

               if(!inventoryData) {
                   itemsworth = 0;
               } else {
                    Object.keys(inventoryData?.inventory)
                    .forEach((key) => {
                        if(inventoryData?.inventory[key] === 0) {
                            return;
                        } else {
                            const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                            itemsworth = itemsworth + (item.value * inventoryData?.inventory[key]);
                        }

                    })
               }

                if(itemsworth === NaN) {
                    itemsworth = null
                }

                return itemsworth > 10000 && id !== '847528987831304192' && inventoryData ? collection1.set(id, {
                    id,
                    itemsworth
                })
                : null
            })

        )

        
        await Promise.all(
            message.guild.members.cache.map(async(member) => {
                const id = member.id;
                let economyData;

                try {   
                    economyData = await economyModel.findOne({ userId: id });
                    if(!economyData) {
                        economyData = null;
                    }
                } catch (error) {
                    console.log(error)
                }

                let inventoryData;
                try {   
                    inventoryData = await inventoryModel.findOne({ userId: id });
                    if(!inventoryData) {
                        inventoryData = null;
                    }
                } catch (error) {
                    console.log(error)
                }
                let itemsworth
                if(!inventoryData) {
                    itemsworth = 0;
                } else {
                    Object.keys(inventoryData?.inventory)
                    .forEach((key) => {
                        if(inventoryData?.inventory[key] === 0) {
                            return;
                        } else {
                            const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                            itemsworth = itemsworth + (item.value * inventoryData?.inventory[key]);
                        }

                    })
                }

                let networth = economyData?.wallet + economyData?.bank.coins + itemsworth

                if(networth === NaN) {
                    networth = null
                }
                

                return networth > 10000 && id !== '847528987831304192' && economyData ? collection0.set(id, {
                    id,
                    networth
                })
                : null
            })

        )

        await Promise.all(
            message.guild.members.cache.map(async(member) => {
                const id = member.id;
                let economyData;
                
                try {   
                    economyData = await economyModel.findOne({ userId: id });
                    if(!economyData) {
                        economyData = null;
                    }
                } catch (error) {
                    console.log(error)
                }

                let netbalance = economyData?.wallet + economyData?.bank.coins

                if(netbalance === NaN) {
                    netbalance = null
                }

                return netbalance > 10000 && id !== '847528987831304192' && economyData ? collection.set(id, {
                    id,
                    netbalance
                })
                : null
            })
        )

        let data = collection.sort((a, b) => b.netbalance - a.netbalance).first(10)

        let leaderboard = data.map((v, i) => {
            return `${rankingicons(i + 1)} \`❀ ${v.netbalance?.toLocaleString()}\` ${client.users.cache.get(v.id).tag}`
        }).join('\n')

        let leaderboardmenu = new MessageSelectMenu()
            .setCustomId('leaderboardmenu')
            .setMinValues(0)
            .setMaxValues(1)
            // .setDisabled(true)
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
        
        embed
            .setColor('RANDOM')
            .setTitle(`${message.guild.name} Net Balance Leaderboard`)
            .setDescription(`${leaderboard ? leaderboard : 'There is no leaderboard. This can also be because members have not been cached.'}`)
        
        leaderboard_msg.edit({ embeds: [embed], components: [row] });

        

        const collector = leaderboard_msg.createMessageComponentCollector({ time: 30 * 1000 });

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

                    data = collection0.sort((a, b) => b.networth - a.networth).first(10)

                    leaderboard = data.map((v, i) => {
                        return `${rankingicons(i + 1)} \`❀ ${v.networth?.toLocaleString()}\` ${client.users.cache.get(v.id).tag}`
                    }).join('\n')
                    
                    embed 
                        .setTitle(`${message.guild.name} Net Worth Leaderboard`)
                        .setDescription(`${leaderboard ? leaderboard : 'There is no leaderboard. This can also be because members have not been cached.'}`)
                        .setColor(`RANDOM`)

                    leaderboardmenu = new MessageSelectMenu()
                        .setCustomId('leaderboardmenu')
                        .setMinValues(0)
                        .setMaxValues(1)
                        .addOptions([
                            {
                                label: 'Net Balance',
                                value: 'netbalance',
                            },
                            {
                                label: 'Net Worth',
                                value: 'networth',
                                default: true,

                            },
                            {
                                label: 'Inventory Worth',
                                value: 'inventoryworth',
                            },
                        ])
                        row = new MessageActionRow()
                            .addComponents(
                                leaderboardmenu
                            );

                    leaderboard_msg.edit({ embeds: [embed], components: [row] });
                } else if(i.values[0] === 'inventoryworth') {
                    
                    data = collection1.sort((a, b) => b.itemsworth - a.itemsworth).first(10)

                    leaderboard = data.map((v, i) => {
                        return `${rankingicons(i + 1)} \`❀ ${v.itemsworth?.toLocaleString()}\` ${client.users.cache.get(v.id).tag}`
                    }).join('\n')

                    embed 
                        .setTitle(`${message.guild.name} Net Inventory Worth Leaderboard`)
                        .setDescription(`${leaderboard ? leaderboard : 'There is no leaderboard. This can also be because members have not been cached.'}`)
                        .setColor(`RANDOM`)


                     leaderboardmenu = new MessageSelectMenu()
                        .setCustomId('leaderboardmenu')
                        .setMinValues(0)
                        .setMaxValues(1)
                        .addOptions([
                            {
                                label: 'Net Balance',
                                value: 'netbalance',
                            },
                            {
                                label: 'Net Worth',
                                value: 'networth',

                            },
                            {
                                label: 'Inventory Worth',
                                value: 'inventoryworth',
                                default: true,
                            },
                        ])

                        row = new MessageActionRow()
                            .addComponents(
                                leaderboardmenu
                            );

                    leaderboard_msg.edit({ embeds: [embed], components: [row] });
                } else if(i.values[0] === 'netbalance') {
                    data = collection.sort((a, b) => b.netbalance - a.netbalance).first(10)

                    leaderboard = data.map((v, i) => {
                        return `${rankingicons(i + 1)} \`❀ ${v.netbalance?.toLocaleString()}\` ${client.users.cache.get(v.id).tag}`
                    }).join('\n')

                    embed
                        .setColor('RANDOM')
                        .setTitle(`${message.guild.name} Net Balance Leaderboard`)
                        .setDescription(`${leaderboard ? leaderboard : 'There is no rich people in this server rip. This can also be because members have not been cached.'}`)
                    
                    leaderboardmenu = new MessageSelectMenu()
                        .setCustomId('leaderboardmenu')
                        .setMinValues(0)
                        .setMaxValues(1)
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

                        row = new MessageActionRow()
                            .addComponents(
                                leaderboardmenu
                            );
                    
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
