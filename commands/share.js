const { MessageActionRow, MessageButton } = require('discord.js')

const profileModel = require("../models/profileSchema");

module.exports = {
    name: "share",
    aliases: ['give', 'shr'],
    cooldown: 15,
    minArgs: 0,
    maxArgs: 1,
    description: "share coins with other users.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const target = message.mentions.users.first()
        const get_amount = parseInt(args[1])

        if(!target) {
            const embed = {
                color: '#FF0000',
                title: `Transaction Error`,
                description: `Mention a user to share coins with!\n**Expected Syntax:** \`xe share [user] [amount]\``,
            };
            return message.reply({ embeds: [embed] });
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
                        commands: 0,
                        dailystreak: 0,
                        prestige: 0,
                        commands: 0,
                        deaths: 0,
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
                } else if(parseInt(get_amount) < 0) {
                    const embed = {
                        color: '#FF0000',
                        title: `Transaction Error`,
                        description: `You can only share a whole number of coins!\n**Expected Syntax:** \`xe share [user] [amount]\``,
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
                                let confirm = new MessageButton()
                                    .setCustomId('confirm')
                                    .setLabel('Confirm')
                                    .setStyle('PRIMARY')

                                let cancel = new MessageButton()
                                    .setCustomId('cancel')
                                    .setLabel('Cancel')
                                    .setStyle('DANGER')

                                let row = new MessageActionRow()
                                    .addComponents(
                                        confirm,
                                        cancel
                                    );
                    
                                const embed = {
                                    color: 'RADNOM',
                                    author: {
                                        name: `_____________`,
                                        icon_url: `${message.author.displayAvatarURL()}`,
                                    },
                                    title: `Confirm transaction`,
                                    description: `<@${message.author.id}>, do you want to share ❀ \`${amount.toLocaleString()}\` to <@${target.id}>?`,
                                    timestamp: new Date(),
                                };
                                const share_msg = await message.reply({ embeds: [embed], components: [row] });

                                const collector = share_msg.createMessageComponentCollector({ time: 20 * 1000 });

                                collector.on('collect', async (button) => {
                                    button.deferUpdate()
                                    if(button.user.id != message.author.id) {
                                        return button.reply({
                                            content: 'This is not for you.',
                                            ephemeral: true,
                                        })
                                    } 

                                    if(button.customId === "confirm") {
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
                                            description: `<@${message.author.id}> shared ❀ \`${amount.toLocaleString()}\` to <@${target.id}>`,
                                            fields: [
                                                {
                                                    name: `${message.author.username}`,
                                                    value: `**Wallet:** -❀ \`${amount.toLocaleString()}\`\n**New Wallet:** \`${(profileData.coins - amount).toLocaleString()}\``,
                                                    inline: true,
                                                },
                                                {
                                                    name: `${target.username}`,
                                                    value: `**Wallet:** +❀ \`${amount.toLocaleString()}\`\n**New Wallet:** \`${(target_profileData.coins + amount).toLocaleString()}\``,
                                                },
                                                
                                            ],
                                            timestamp: new Date(),
                                        };

                                        confirm
                                            .setDisabled()
                                            .setStyle("SUCCESS")

                                        cancel.setDisabled()

                                        share_msg.edit({
                                            embeds: [embed],
                                            components: [row]
                                        })
                                    
                                    } else if(button.customId === "cancel") {
                                        const embed = {
                                            color: '#FF0000',
                                            author: {
                                                name: `_____________`,
                                                icon_url: `${message.author.displayAvatarURL()}`,
                                            },
                                            title: `Transaction cancelled`,
                                            description: `<@${message.author.id}>, do you want to share ❀ \`${amount.toLocaleString()}\` to <@${target.id}>?\nI guess not...`,
                                            timestamp: new Date(),
                                        };
                                        
                                        confirm.setDisabled()

                                        cancel.setDisabled()
                                        
                                        share_msg.edit({
                                            embeds: [embed],
                                            components: [row]
                                        })
                                
                                    }
                                    
                                });

                                collector.on('end', collected => {
                                    if(collected.size > 0) {

                                    } else {
                                        const embed = {
                                            color: '#FF0000',
                                            author: {
                                                name: `_____________`,
                                                icon_url: `${message.author.displayAvatarURL()}`,
                                            },
                                            title: `Transaction timeout`,
                                            description: `<@${message.author.id}>, do you want to share ❀ \`${amount.toLocaleString()}\` to <@${target.id}>?\nI guess not...`,
                                            timestamp: new Date(),
                                        };
                                        
                                        confirm
                                            .setDisabled()
                                            .setStyle("DANGER")
    
                                        cancel.setDisabled()
                                        
                                        share_msg.edit({
                                            embeds: [embed],
                                            components: [row]
                                        })
                                    }
                                });
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
                        if(!get_amount) {
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
                            let confirm = new MessageButton()
                                .setCustomId('confirm')
                                .setLabel('Confirm')
                                .setStyle('PRIMARY')

                            let cancel = new MessageButton()
                                .setCustomId('cancel')
                                .setLabel('Cancel')
                                .setStyle('DANGER')

                            let row = new MessageActionRow()
                                .addComponents(
                                    confirm,
                                    cancel
                                );
                
                            const embed = {
                                color: 'RANDOM',
                                author: {
                                    name: `_____________`,
                                    icon_url: `${message.author.displayAvatarURL()}`,
                                },
                                title: `Confirm transaction`,
                                description: `<@${message.author.id}>, do you want to share ❀ \`${get_amount.toLocaleString()}\` to <@${target.id}>?`,
                                timestamp: new Date(),
                            };
                            const share_msg = await message.reply({ embeds: [embed], components: [row] });

                            const collector = share_msg.createMessageComponentCollector({ time: 20 * 1000 });

                            collector.on('collect', async (button) => {
                                button.deferUpdate()
                                if(button.user.id != message.author.id) {
                                    return button.reply({
                                        content: 'This is not for you.',
                                        ephemeral: true,
                                    })
                                } 

                                if(button.customId === "confirm") {
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
                                        description: `<@${message.author.id}> shared ❀ \`${get_amount.toLocaleString()}\` to <@${target.id}>`,
                                        fields: [
                                            {
                                                name: `${message.author.username}`,
                                                value: `**Wallet:** -❀ \`${parseInt(get_amount).toLocaleString()}\`\n**New Wallet:** \`${(profileData.coins - parseInt(get_amount)).toLocaleString()}\``,
                                                inline: true,
                                            },
                                            {
                                                name: `${target.username}`,
                                                value: `**Wallet:** +❀ \`${parseInt(get_amount).toLocaleString()}\`\n**New Wallet:** \`${(target_profileData.coins + parseInt(get_amount)).toLocaleString()}\``,
                                            },
                                            
                                        ],
                                        timestamp: new Date(),
                                    };

                                    confirm
                                        .setDisabled()
                                        .setStyle("SUCCESS")

                                    cancel.setDisabled()

                                    share_msg.edit({
                                        embeds: [embed],
                                        components: [row]
                                    })
                                
                                } else if(button.customId === "cancel") {
                                    const embed = {
                                        color: '#FF0000',
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${message.author.displayAvatarURL()}`,
                                        },
                                        title: `Transaction cancelled`,
                                        description: `<@${message.author.id}>, do you want to share ❀ \`${get_amount.toLocaleString()}\` to <@${target.id}>?\nI guess not...`,
                                        timestamp: new Date(),
                                    };
                                    
                                    confirm.setDisabled()

                                    cancel.setDisabled()
                                    
                                    share_msg.edit({
                                        embeds: [embed],
                                        components: [row]
                                    })
                            
                                }
                                
                            });

                            collector.on('end', collected => {
                                if(collected.size > 0) {

                                } else {
                                    const embed = {
                                        color: '#FF0000',
                                        author: {
                                            name: `_____________`,
                                            icon_url: `${message.author.displayAvatarURL()}`,
                                        },
                                        title: `Transaction timeout`,
                                        description: `<@${message.author.id}>, do you want to share ❀ \`${get_amount.toLocaleString()}\` to <@${target.id}>?\nI guess not...`,
                                        timestamp: new Date(),
                                    };
                                    
                                    confirm
                                        .setDisabled()
                                        .setStyle("DANGER")

                                    cancel.setDisabled()
                                    
                                    share_msg.edit({
                                        embeds: [embed],
                                        components: [row]
                                    })
                                }
                            });
                            
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }

        }

    }
}