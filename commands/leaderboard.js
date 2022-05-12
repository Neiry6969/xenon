const { Collection } = require('discord.js');

const profileModel = require("../models/profileSchema");

module.exports = {
    name: 'rich',
    aliases: ['leaderb', 'lb', 'leaderboard'],
    cooldown: 15,
    description: "Check the leaderboard.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const collection = new Collection();

        await Promise.all(
            message.guild.members.cache.map(async(member) => {
                const id = member.id;
                let user;
                try {   
                    user = await profileModel.findOne({ userId: id });
                } catch (error) {
                    console.log(error)
                }

                const netbalance = user.coins + user.bank

                return netbalance !== 0 && id !== '847528987831304192' ? collection.set(id, {
                    id,
                    netbalance
                })
                : null
            })
            
        )

        const data = collection.sort((a, b) => b.netbalance - a.netbalance).first(10)
        
        embed = {
            color: 'RANDOM',
            title: `${message.guild.name} Net Balance Leaderboard`,
            description: `${data.map((v, i) => {
                return `${i + 1 === 1 ? '<:creatorscrown:965024171463688323>' : '<:silvercrown:963568001213403196>'} \`${v.netbalance?.toLocaleString()}\` ${client.users.cache.get(v.id).tag}`
            }).join('\n')}`,
            timestamp: new Date(),
        };

        message.channel.send({ embeds: [embed] });
    }
    
}