const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const fs = require('fs')

const profileModel = require("../models/profileSchema");
const letternumbers = require('../reference/letternumber');
const userModel = require('../models/userSchema')
const inventoryModel = require('../models/inventorySchema')

module.exports = {
    name: "fightrate",
    aliases: ['fightr'],
    cooldown: 0,
    minArgs: 0,
    maxArgs: 1,
    description: "fightrate coins with other users.",
    async execute(message, args, cmd, client, Discord, profileData) {
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
        
        let amount = args[1]?.toLowerCase();

        const expectedsyntax = `**Expected Syntax:** \`xe fight [user] [amount]\``

        if(!target) {
            const embed = {
                color: '#FF0000',
                title: `Action Error`,
                description: `Mention a user to fight coins with!\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] });
        } else if(target.id === message.author.id) {
            const embed = {
                color: '#FF0000',
                title: `Action Error`,
                description: `You can't fight with yourself, just do it mentally!\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] });
        } 

        const target_profileData = await profileModel.findOne({ userId: target.id });
        const target_inventoryData = await inventoryModel.findOne({ userId: target.id });

        if(!amount) {
            amount = 0
        } else if(amount === 'max' || amount === 'all') {
            amount = profileData.coins;
        } else if(amount === 'half') {
            amount = Math.floor(profileData.coins / 2)
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

        if(
            amount === 0 ||
            !amount ||
            amount < 0 || 
            amount % 1 != 0 
        ) {
            amount = 0
        }
        
        
        // if(amount === 0) {
        //     return message.reply("So you want to fight nothing, pretend you did that in your mind");
        // } else if(!amount) {
        //     const embed = {
        //         color: '#FF0000',
        //         title: `Action Error`,
        //         description: `Specify the amount you want to fight.\n${expectedsyntax}`,
        //     };
        //     return message.reply({ embeds: [embed] })
        // } else if(amount < 0 || amount % 1 != 0) {
        //     return message.reply("Share amount must be a whole number.");
        // } 

        if(amount > profileData.coins) {
            if(amount < profileData.bank + profileData.coins) {
                return message.reply(`You don't have that amount of coins to give from your wallet, maybe withdraw some?`);
            } else {
                return message.reply(`You don't have that amount of coins to give from your wallet or your bank.`);
            }
        } else if(target_profileData.coins < amount) {
            return message.reply(`<@${target.id}> doesn't have that many coins to fight.`);
        } 

        // if(amount > 0) {
        //     const local_response = await profileModel.updateMany(
        //         {},
        //         {
        //             $inc: {
        //                 coins: -amount,
        //             },
        //         },
        //         {
        //             upsert: true,
        //             arrayFilters: [ message.author.id, target.id ]
        //         }
        //     )
        // }

        let ratelocal = Math.floor(Math.random() * 100)
            let ratenonlocal = Math.floor(Math.random() * 100)
            let fightr_embed = {
                title: 'Fightrate Game...',
                color: 'DARK_BLUE',
                fields: [
                    {
                        name: `${message.author.username}`,
                        value: `<@${message.author.id}>\n<:excalibur:966537260034043974> \`❔\``,
                        inline: true,
                    },
                    {
                        name: `${target.username}`,
                        value: `<@${target.id}>\n<:excalibur:966537260034043974> \`❔\``,
                        inline: true,
                    },
                    {
                        name: `Results`,
                        value: `\`Fightrate is still in proccess...\``,
                        inline: false,
                    },
                ]
            }

            const fightr_msg = await message.channel.send({ content: `<@${message.author.id}> **VS** <@${target.id}>`, embeds: [fightr_embed] })

            setTimeout(() => {
                fightr_embed = {
                    title: 'Fightrate Game...',
                    color: 'DARK_BLUE',
                    fields: [
                        {
                            name: `${message.author.username}`,
                            value: `<@${message.author.id}>\n<:excalibur:966537260034043974> \`${ratelocal}\``,
                            inline: true,
                        },
                        {
                            name: `${target.username}`,
                            value: `<@${target.id}>\n<:excalibur:966537260034043974> \`❔\``,
                            inline: true,
                        },
                        {
                            name: `Results`,
                            value: `\`Fightrate is still in proccess...\``,
                            inline: false,
                        },
                    ]
                }
                fightr_msg.edit({ content: `<@${message.author.id}> **VS** <@${target.id}>`, embeds: [fightr_embed] })
            }, 1000)

            setTimeout(() => {
                fightr_embed = {
                    title: 'Fightrate Game...',
                    color: 'DARK_BLUE',
                    fields: [
                        {
                            name: `${message.author.username}`,
                            value: `<@${message.author.id}>\n<:excalibur:966537260034043974> \`${ratelocal}\``,
                            inline: true,
                        },
                        {
                            name: `${target.username}`,
                            value: `<@${target.id}>\n<:excalibur:966537260034043974> \`${ratenonlocal}\``,
                            inline: true,
                        },
                        {
                            name: `Results`,
                            value: `\`Fightrate is still in proccess...\``,
                            inline: false,
                        },
                    ]
                }
                fightr_msg.edit({ content: `<@${message.author.id}> **VS** <@${target.id}>`, embeds: [fightr_embed] })
            }, 1500)

            let winner;

            if(ratelocal > ratenonlocal) {
                winner = message.author
            } else if(ratenonlocal > ratelocal) {
                winner = target
            }

            setTimeout(() => {
                fightr_embed = {
                    title: 'Fightrate Game...',
                    color: 'DARK_BLUE',
                    fields: [
                        {
                            name: `${message.author.username}`,
                            value: `<@${message.author.id}>\n<:excalibur:966537260034043974> \`${ratelocal}\``,
                            inline: true,
                        },
                        {
                            name: `${target.username}`,
                            value: `<@${target.id}>\n<:excalibur:966537260034043974> \`${ratenonlocal}\``,
                            inline: true,
                        },
                        {
                            name: `Results`,
                            value: `\`${winner.username}\` won with a higher rate! Sheesh lucky!`,
                            inline: false,
                        },
                    ]
                }
                return fightr_msg.edit({ content: `<@${winner.id}> **is the winner!**`, embeds: [fightr_embed] })
            }, 2000)

        // if(amount <= 0) {
        //     let ratelocal = Math.floor(Math.random() * 100)
        //     let ratenonlocal = Math.floor(Math.random() * 100)
        //     let fightr_embed = {
        //         title: 'Fightrate Game...',
        //         color: 'DARK_BLUE',
        //         fields: [
        //             {
        //                 name: `${message.author.username}`,
        //                 value: `<@${message.author.id}>\n<:excalibur:966537260034043974> \`❔\``,
        //                 inline: true,
        //             },
        //             {
        //                 name: `${target.username}`,
        //                 value: `<@${target.id}>\n<:excalibur:966537260034043974> \`❔\``,
        //                 inline: true,
        //             },
        //             {
        //                 name: `Results`,
        //                 value: `\`Fightrate is still in proccess...\``,
        //                 inline: false,
        //             },
        //         ]
        //     }

        //     const fightr_msg = await message.reply({ content: `<@${message.author.id}> **VS** <@${target.id}>`, embeds: [fightr_embed] })

        //     setTimeout(() => {
        //         fightr_embed = {
        //             title: 'Fightrate Game...',
        //             color: 'DARK_BLUE',
        //             fields: [
        //                 {
        //                     name: `${message.author.username}`,
        //                     value: `<@${message.author.id}>\n<:excalibur:966537260034043974> \`${ratelocal}\``,
        //                     inline: true,
        //                 },
        //                 {
        //                     name: `${target.username}`,
        //                     value: `<@${target.id}>\n<:excalibur:966537260034043974> \`❔\``,
        //                     inline: true,
        //                 },
        //                 {
        //                     name: `Results`,
        //                     value: `\`Fightrate is still in proccess...\``,
        //                     inline: false,
        //                 },
        //             ]
        //         }
        //         fightr_msg.edit({ content: `<@${message.author.id}> **VS** <@${target.id}>`, embeds: [fightr_embed] })
        //     }, 1000)

        //     setTimeout(() => {
        //         fightr_embed = {
        //             title: 'Fightrate Game...',
        //             color: 'DARK_BLUE',
        //             fields: [
        //                 {
        //                     name: `${message.author.username}`,
        //                     value: `<@${message.author.id}>\n<:excalibur:966537260034043974> \`${ratelocal}\``,
        //                     inline: true,
        //                 },
        //                 {
        //                     name: `${target.username}`,
        //                     value: `<@${target.id}>\n<:excalibur:966537260034043974> \`${ratenonlocal}\``,
        //                     inline: true,
        //                 },
        //                 {
        //                     name: `Results`,
        //                     value: `\`Fightrate is still in proccess...\``,
        //                     inline: false,
        //                 },
        //             ]
        //         }
        //         fightr_msg.edit({ content: `<@${message.author.id}> **VS** <@${target.id}>`, embeds: [fightr_embed] })
        //     }, 1000)

        //     let winner;

        //     if(ratelocal > ratenonlocal) {
        //         winner = message.author
        //     } else if(ratenonlocal > ratelocal) {
        //         winner = target
        //     }

        //     setTimeout(() => {
        //         fightr_embed = {
        //             title: 'Fightrate Game...',
        //             color: 'DARK_BLUE',
        //             fields: [
        //                 {
        //                     name: `${message.author.username}`,
        //                     value: `<@${message.author.id}>\n<:excalibur:966537260034043974> \`${ratelocal}\``,
        //                     inline: true,
        //                 },
        //                 {
        //                     name: `${target.username}`,
        //                     value: `<@${target.id}>\n<:excalibur:966537260034043974> \`${ratenonlocal}\``,
        //                     inline: true,
        //                 },
        //                 {
        //                     name: `Results`,
        //                     value: `\`${winner.username}\` won with a higher rate! Sheesh lucky!`,
        //                     inline: false,
        //                 },
        //             ]
        //         }
        //         fightr_msg.edit({ content: `<@${winner.id}> **is the winner!**`, embeds: [fightr_embed] })
        //     }, 1000)

        // } else {
        //     let confirm = new MessageButton()
        //         .setCustomId('confirm')
        //         .setLabel('Confirm')
        //         .setStyle('PRIMARY')

        //     let cancel = new MessageButton()
        //         .setCustomId('cancel')
        //         .setLabel('Cancel')
        //         .setStyle('DANGER')

        //     let row = new MessageActionRow()
        //         .addComponents(
        //             confirm,
        //             cancel
        //         );

        //     const embed = new MessageEmbed()
        //         .setColor("#A020F0")
        //         .setTitle(`Confirm action`)
        //         .setDescription(`<@${message.author.id}>, are you sure you want to bet \`❀ ${amount.toLocaleString()}\`?`)

        //     const fight_msg = await message.reply({ embeds: [embed], components: [row] })

        //     const collector = fight_msg.createMessageComponentCollector({ time: 60 * 1000 });

        //     collector.on('collect', async (button) => {
        //         if(button.user.id != message.author.id) {
        //             return button.reply({
        //                 content: 'This is not for you.',
        //                 ephemeral: true,
        //             })
        //         } 

                
        //         button.deferUpdate()
        //         if(button.customId === "confirm") {
                    
        //             confirm
        //                 .setDisabled()
        //                 .setStyle("SUCCESS")

        //             cancel
        //                 .setDisabled()
        //                 .setStyle("SECONDARY")

        //             fight_msg.edit({
        //                 embeds: [embed],
        //                 components: [row]
        //             })
                
        //         } else if(button.customId === "cancel") {
        //             confirm
        //                 .setDisabled()
        //                 .setStyle("SECONDARY")

        //             cancel.setDisabled()

        //             embed
        //                 .setColor('RED')
        //                 .setTitle(`Action cancelled`)
        //                 .setDescription(`<@${message.author.id}>, are you sure you want to bet \`❀ ${amount.toLocaleString()}\`?\nNo? Okay...`)
                    
        //             fight_msg.edit({
        //                 embeds: [embed],
        //                 components: [row]
        //             })
            
        //         }
                
        //     });

        //     collector.on('end', async collected => {
        //         if(collected.size > 0) {
                    
        //         } else {
        //             confirm
        //                 .setDisabled()
        //                 .setStyle("SECONDARY")

        //             cancel
        //                 .setDisabled()
        //                 .setStyle("SECONDARY")
                    
        //             embed
        //                 .setColor('RED')
        //                 .setTitle(`Action timed out`)
        //                 .setDescription(`<@${message.author.id}>, are you sure you want to bet \`❀ ${amount.toLocaleString()}\`?\nNo? Okay...`)
                    
        //             fight_msg.edit({
        //                 embeds: [embed],
        //                 components: [row]
        //             })
        //         }
        //     });
        // }

    }
}