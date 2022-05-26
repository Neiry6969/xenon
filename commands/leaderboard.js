const { Collection, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

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
        return '<a:fineribbon:968642962831589427>'
    }
}

module.exports = {
    name: 'rich',
    aliases: ['leaderb', 'lb', 'leaderboard'],
    cooldown: 15,
    description: "Check the leaderboard.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const collection = new Collection();
        const collection0 = new Collection();
        const collection1 = new Collection();

        await Promise.all(
            message.guild.members.cache.map(async(member) => {
                const id = member.id;
                let profiledata;
                try {   
                    profiledata = await profileModel.findOne({ userId: id });
                    if(!profiledata) {
                        let profile = await profileModel.create({
                            userId: message.author.id,
                            serverId: message.guild.id,
                        });
                    
                        profile.save();
            
                        profiledata = profile;
                    }
                } catch (error) {
                    console.log(error)
                }

                let netbalance = profiledata?.coins + profiledata?.bank

                if(netbalance === NaN) {
                    netbalance = null
                }

                return netbalance > 10000 && id !== '847528987831304192' && profiledata ? collection.set(id, {
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

        
        const embed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`${message.guild.name} Net Balance Leaderboard`)
                .setDescription(`${leaderboard ? leaderboard : 'There is no leaderboard. This can also be because members have not been cached.'}`)
                .setTimestamp()

        
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
                    await Promise.all(
                        message.guild.members.cache.map(async(member) => {
                            const id = member.id;
                            let itemsworth = 0;

                            let profiledata;
                            try {   
                                profiledata = await profileModel.findOne({ userId: id });
                                if(!profiledata) {
                                    let profile = await profileModel.create({
                                        userId: message.author.id,
                                        serverId: message.guild.id,
                                    });
                                
                                    profile.save();
                        
                                    profiledata = profile;
                                }
                            } catch (error) {
                                console.log(error)
                            }

                            let inventorydata;
                            try {   
                                inventorydata = await inventoryModel.findOne({ userId: id });
                                if(!inventorydata) {
                                    let inventory = await inventoryModel.create({
                                        userId: message.author.id,
                                    });
                                
                                    inventory.save();
                        
                                    inventorydata = inventory;
                                }
                            } catch (error) {
                                console.log(error)
                            }

                           if(!inventorydata.inventory) {
                               itemsworth = 0;
                           } else {
                                Object.keys(inventorydata.inventory)
                                .forEach((key) => {
                                    if(inventorydata.inventory[key] === 0) {
                                        return;
                                    } else {
                                        const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                                        itemsworth = itemsworth + (item.value * inventorydata.inventory[key]);
                                    }

                                })
                           }
                            
                            const networth = profileData.coins + profileData.bank + itemsworth;
            
                            if(networth === NaN) {
                                networth = null
                            }
            
                            return networth > 10000 && id !== '847528987831304192' && profiledata && inventorydata ? collection0.set(id, {
                                id,
                                networth
                            })
                            : null
                        })
                        
                    )

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
                    await Promise.all(
                        message.guild.members.cache.map(async(member) => {
                            const id = member.id;
                            let itemsworth = 0;

                            let inventorydata;
                            try {   
                                inventorydata = await inventoryModel.findOne({ userId: id });
                                if(!inventorydata) {
                                    let inventory = await inventoryModel.create({
                                        userId: message.author.id,
                                    });
                                
                                    inventory.save();
                        
                                    inventorydata = inventory;
                                }
                            } catch (error) {
                                console.log(error)
                            }

                           if(!inventorydata.inventory) {
                               itemsworth = 0;
                           } else {
                                Object.keys(inventorydata.inventory)
                                .forEach((key) => {
                                    if(inventorydata.inventory[key] === 0) {
                                        return;
                                    } else {
                                        const item = allItems.find((val) => (val.item.toLowerCase()) === key);

                                        itemsworth = itemsworth + (item.value * inventorydata.inventory[key]);
                                    }

                                })
                           }
            
                            if(itemsworth === NaN) {
                                itemsworth = null
                            }
            
                            return itemsworth > 10000 && id !== '847528987831304192' && inventorydata ? collection1.set(id, {
                                id,
                                itemsworth
                            })
                            : null
                        })
                        
                    )

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