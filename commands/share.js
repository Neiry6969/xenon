const { MessageActionRow, MessageButton } = require('discord.js')

const profileModel = require("../models/profileSchema");
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "share",
    aliases: ['give', 'shr'],
    cooldown: 10,
    minArgs: 0,
    maxArgs: 1,
    description: "share coins with other users.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const target = message.mentions.users.first()
        let amount = args[1]?.toLowerCase();

        const expectedsyntax = `**Expected Syntax:** \`xe share [user] [amount]\``

        if(profileData.coins <= 0) {
            if (profileData.bank <= 0) {
                message.reply(`You got no coins in your wallet or your bank to share, your broke :c.`);
            } else {
                message.reply(`You got no coins in your wallet to share, maybe withdraw some?`);
            }
        }

        if(amount === 'max' || amount === 'all') {
            amount = profileData.bank;
        } else if(amount === 'half') {
            amount = Math.floor(profileData.bank / 2)
        } else if(letternumbers.find((val) => val.letter === amount.slice(-1))) {
            if(parseInt(amount.slice(0, -1))) {
                const number = parseFloat(amount.slice(0, -1));
                const numbermulti = letternumbers.find((val) => val.letter === amount.slice(-1)).number;
                amount = number * numbermulti;
            } else {
                amount = null;
            }
        } else {
            amount = parseInt(amount)
        }
        
        if(!target) {
            const embed = {
                color: '#FF0000',
                title: `Transaction Error`,
                description: `Mention a user to share coins with!\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] });
        } else if(target.id === message.author.id) {
            const embed = {
                color: '#FF0000',
                title: `Transaction Error`,
                description: `You can't share coins with yourself!\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] });
        } else if(!amount) {
            const embed = {
                color: '#FF0000',
                title: `Transaction Error`,
                description: `Specify the amount you want to share.\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] })
        } else if(amount < 0 || amount % 1 != 0) {
            return message.reply("Share amount must be a whole number.");
        } else if(amount > profileData.coins) {
            if(amount < profileData.bank + profileData.coins) {
                return message.reply(`You don't have that amount of coins to give from your wallet, maybe withdraw some?`);
            } else {
                return message.reply(`You don't have that amount of coins to give from your wallet or your bank.`);
            }
        } 

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
            description: `<@${message.author.id}>, do you want to share ❀ \`${amount.toLocaleString()}\` to <@${target.id}>?`,
            timestamp: new Date(),
        };
        const share_msg = await message.reply({ embeds: [embed], components: [row] });

        const collector = share_msg.createMessageComponentCollector({ time: 20 * 1000 });

        collector.on('collect', async (button) => {
            if(button.user.id != message.author.id) {
                return button.reply({
                    content: 'This is not for you.',
                    ephemeral: true,
                })
            } 
            
            button.deferUpdate()
            if(button.customId === "confirm") {
                const target_profileData = await profileModel.findOne({ userId: target.id });
    
                if(!target_profileData) {
                    let profile = await profileModel.create({
                        userId: target.id,
                        serverId: message.guild.id,
                        coins: amount,
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
                }

                let target_profileData_coins;

                if(!target_profileData) {
                    target_profileData_coins = amount
                } else {
                    target_profileData_coins = target_profileData.coins + amount
                }
                

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
                            value: `**Wallet:** +❀ \`${amount.toLocaleString()}\`\n**New Wallet:** \`${(target_profileData_coins).toLocaleString()}\``,
                        },
                        
                    ],
                    timestamp: new Date(),
                };

                confirm
                    .setDisabled()
                    .setStyle("SUCCESS")

                cancel
                    .setDisabled()
                    .setStyle("SECONDARY")

                share_msg.edit({
                    embeds: [embed],
                    components: [row]
                })
            
            } else if(button.customId === "cancel") {
                const local_response = await profileModel.findOneAndUpdate(
                    {userId: message.author.id},
                    {
                        $inc: {
                            coins: amount,
                        },
                    },
                    {
                        upsert: true,
                    }
                )
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
                
                confirm
                    .setDisabled()
                    .setStyle("SECONDARY")

                cancel.setDisabled()
                
                share_msg.edit({
                    embeds: [embed],
                    components: [row]
                })
        
            }
            
        });

        collector.on('end', async collected => {
            if(collected.size > 0) {

            } else {
                const local_response = await profileModel.findOneAndUpdate(
                    {userId: message.author.id},
                    {
                        $inc: {
                            coins: amount,
                        },
                    },
                    {
                        upsert: true,
                    }
                )
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
                    .setStyle("SECONDARY")

                cancel
                    .setDisabled()
                    .setStyle("SECONDARY")
                
                share_msg.edit({
                    embeds: [embed],
                    components: [row]
                })
            }
        });
    }
}