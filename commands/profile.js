const profileModel = require("../models/profileSchema");

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
                        userId: target_id,
                        serverId: message.guild.id,
                        coins: 0,
                        bank: 0,
                        bankspace: 1000,
                        expbankspace: 0,
                        experiencepoints: 0,
                        level: 0,
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
                                value: `\`NaN\``,
                                inline: true,
                            },
                            
                        ],
                        timestamp: new Date(),
                    };
                    message.channel.send({ embeds: [embed] });
                } else {
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
                                value: `\`NaN\``,
                                inline: true,
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
                        value: `\`NaN\``,
                        inline: true,
                    },
                    
                ],
                timestamp: new Date(),
            };
            message.channel.send({ embeds: [embed] });;
        }

    },

}