const profileModel = require("../models/profileSchema");

module.exports = {
    name: "share",
    aliases: ['give', 'shr'],
    cooldown: 2,
    minArgs: 0,
    maxArgs: 1,
    description: "share coins with other users.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const target = message.mentions.users.first()
        const get_amount = args[1]

        if(!target) {
            const embed = {
                color: '#FF0000',
                title: `Transaction Error`,
                description: `Mention a user to share coins with!\n**Expected Syntax:** \`xe share [user] [amount]\``,
            };
            message.reply({ embeds: [embed] });
        } else {
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
                    });
                    profile.save();

                    const embed = {
                        color: '#0000FF',
                        title: `Welcome to Xenon`,
                        description: `I see a new user, your account has been created!`,
                        timestamp: new Date(),
                    };
                    return message.reply({ embeds: [embed] });
                    
                } else if(target.id === message.author.id) {
                    const embed = {
                        color: '#FF0000',
                        title: `Transaction Error`,
                        description: `You can't share coins with yourself!\n**Expected Syntax:** \`xe share [user] [amount]\``,
                    };
                    return message.reply({ embeds: [embed] });
                } else {
                    if(!parseInt(get_amount)) {
                        if(get_amount === "max" || get_amount === "all") {
                            const amount = profileData.coins;

                            if(amount <= 0) {
                                if (profileData.bank <= 0) {
                                    message.reply(`You got no coins in your wallet or your bank to share, your broke :c.`);
                                } else {
                                    message.reply(`You got no coins in your wallet to share, maybe withdraw some?`);
                                }
                            } else {
                                const target_response = await profileModel.findOneAndUpdate(
                                    {userId: target.id},
                                    {
                                        $inc: {
                                            coins: amount,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                );
                                const local_response = await profileModel.findOneAndUpdate(
                                    {userId: message.author.id},
                                    {
                                        $inc: {
                                            coins: -amount,
                                        },
                                    },
                                    {
                                        upsert: true,
                                    }
                                )
        
                                const embed = {
                                    color: '#00FF00',
                                    author: {
                                        name: `_____________`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    title: `Transaction success, here is the receipt`,
                                    description: `<@${message.author.id}> shared ❀ \`${amount}\` to <@${target.id}>`,
                                    fields: [
                                        {
                                            name: `${message.author.username}`,
                                            value: `**Wallet:** -❀ \`${amount}\`
                                            **New Wallet:** \`${profileData.coins - amount}\``,
                                            inline: true,
                                        },
                                        {
                                            name: `${target.username}`,
                                            value: `**Wallet:** +❀ \`${amount}\`
                                            **New Wallet:** \`${target_profileData.coins + amount}\``,
                                        },
                                        
                                    ],
                                    timestamp: new Date(),
                                };
                                message.reply({ embeds: [embed] });
                            }
                        } else {
                            const embed = {
                                color: '#FF0000',
                                title: `Transaction Error`,
                                description: `You can only share a whole number of coins!\n**Expected Syntax:** \`xe share [user] [amount]\``,
                            };
                            message.reply({ embeds: [embed] });
                        }
                    } else {
                        if(!parseInt(get_amount)) {
                            const embed = {
                                color: '#FF0000',
                                title: `Transaction Error`,
                                description: `You can only share a whole number of coins!\n**Expected Syntax:** \`xe share [user] [amount]\``,
                            };
                            message.reply({ embeds: [embed] });
                        } else if(amount = 0) {
                            message.reply(`Ok so you want to give nothing nice.`);
                        } else if (get_amount > profileData.coins) {
                            if (profileData.bank <= 0) {
                                message.reply(`You got no coins in your wallet or your bank to share, your broke :c.`);
                            } else {
                                message.reply(`You got no coins in your wallet to share, maybe withdraw some?`);
                            }
                        } else {
                            const target_response = await profileModel.findOneAndUpdate(
                                {userId: target.id},
                                {
                                    $inc: {
                                        coins: get_amount,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );
                            const local_response = await profileModel.findOneAndUpdate(
                                {userId: message.author.id},
                                {
                                    $inc: {
                                        coins: -get_amount,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            )
        
                            const embed = {
                                color: '#00FF00',
                                author: {
                                    name: `_____________`,
                                    icon_url: `${message.author.displayAvatarURL()}`,
                                },
                                title: `Transaction success, here is the receipt`,
                                description: `<@${message.author.id}> shared ❀ \`${get_amount}\` to <@${target.id}>`,
                                fields: [
                                    {
                                        name: `${message.author.username}`,
                                        value: `**Wallet:** -❀ \`${get_amount}\`
                                        **New Wallet:** \`${profileData.coins - get_amount}\``,
                                        inline: true,
                                    },
                                    {
                                        name: `${target.username}`,
                                        value: `**Wallet:** +❀ \`${get_amount}\`
                                        **New Wallet:** \`${target_profileData.coins + get_amount}\``,
                                    },
                                    
                                ],
                                timestamp: new Date(),
                            };
                            message.reply({ embeds: [embed] });
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }

        }

    }
}