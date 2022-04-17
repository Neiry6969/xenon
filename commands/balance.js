const profileModel = require("../models/profileSchema");

module.exports = {
    name: "balance",
    aliases: ['bal', 'bl'],
    cooldown: 2,
    minArgs: 0,
    maxArgs: 1,
    description: "check the user balance.",
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
                        userId: target_id,
                        serverId: message.guild.id,
                        coins: 0,
                        bank: 0,
                        bankspace: 1000,
                        expbankspace: 0,
                        experiencepoints: 0,
                        level: 0,
                        commands: 0,
                        dailystreak: 0,
                        prestige: 0,
                        commands: 0,
                        deaths: 0,
                    });
                
                    profile.save();

                    console

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
                                value: `❀ \`0\``,
                            },
                            {
                                name: 'Bank',
                                value: `❀ \`0\` | \`1,000\` \`0.00%\``,
                            },
                            
                        ],
                        timestamp: new Date(),
                    };

                    return message.channel.send({ embeds: [embed] });
                } else {
                    const bankspace = target_profileData.bankspace + target_profileData.expbankspace;
                    const bank_percent_filled = ((target_profileData.bank / bankspace) * 100).toFixed(2);

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
                                value: `❀ \`${target_profileData.coins.toLocaleString()}\``,
                            },
                            {
                                name: 'Bank',
                                value: `❀ \`${target_profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``,
                            },
                            
                        ],
                        timestamp: new Date(),
                    };
                    message.channel.send({ embeds: [embed] });
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            const bank_percent_filled = ((profileData.bank / bankspace) * 100).toFixed(2);

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
                        value: `❀ \`${profileData.coins.toLocaleString()}\``,
                    },
                    {
                        name: 'Bank',
                        value: `❀ \`${profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``,
                    },
                    
                ],
                timestamp: new Date(),
            };
            message.channel.send({ embeds: [embed] });
        }

    },

}