const { MessageActionRow, MessageButton } = require('discord.js')

const economyModel = require("../models/economySchema");
const letternumbers = require('../reference/letternumber');

module.exports = {
    name: "share",
    aliases: ['give', 'shr'],
    cooldown: 10,
    minArgs: 0,
    maxArgs: 1,
    description: "share coins with other users.",
    async execute(message, args, cmd, client, Discord, userData) {

        const params = {
            userId: message.author.id
        }
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

        const expectedsyntax = `**Expected Syntax:** \`xe share [user] [amount]\``

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
        } 
        
        if(userData.wallet <= 0) {
            if (userData.bank.coins <= 0) {
                return message.reply(`You got no coins in your wallet or your bank to share, your broke :c.`);
            } else {
                return message.reply(`You got no coins in your wallet to share, maybe withdraw some?`);
            }
        }

        if(!amount) {
            const embed = {
                color: '#FF0000',
                title: `Transaction Error`,
                description: `Specify the amount you want to share.\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] })
        }

        if(amount === 'max' || amount === 'all') {
            amount = userData.wallet;
        } else if(amount === 'half') {
            amount = Math.floor(userData.wallet / 2)
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
        
        
        if(amount === 0) {
            return message.reply("So you want to share nothing, pretend you did that in your mind");
        } else if(!amount) {
            const embed = {
                color: '#FF0000',
                title: `Transaction Error`,
                description: `Specify the amount you want to share.\n${expectedsyntax}`,
            };
            return message.reply({ embeds: [embed] })
        } else if(amount < 0 || amount % 1 != 0) {
            return message.reply("Share amount must be a whole number.");
        } else if(amount > userData.wallet) {
            if(amount < userData.bank.coins + userData.wallet) {
                return message.reply(`You don't have that amount of coins to give from your wallet, maybe withdraw some?`);
            } else {
                return message.reply(`You don't have that amount of coins to give from your wallet or your bank.`);
            }
        } 

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
            description: `<@${message.author.id}>, do you want to share \`❀ ${amount.toLocaleString()}\` to <@${target.id}>?`,
            timestamp: new Date(),
        };
        const share_msg = await message.reply({ embeds: [embed], components: [row] });

        const collector = share_msg.createMessageComponentCollector({ time: 20 * 1000 });

        const target_profileData = await economyModel.findOne({ userId: target.id });
        let target_profileData_coins;
        if(!target_profileData) {
            profile = await economyModel.create({
                userId: target.id,
                wallet: amount
            });
            profile.save();
            target_profileData_coins = amount
        } else {
            await economyModel.findOneAndUpdate(
                {userId: target.id},
                {
                    $inc: {
                        wallet: amount,
                    },
                },
                {
                    upsert: true,
                }
            );
            target_profileData_coins = target_profileData.wallet + amount
        }

        userData.interactionproccesses.interaction = true
        userData.interactionproccesses.proccessing = true
        userData.wallet = userData.wallet - amount
        await economyModel.updateOne(params, userData);


        collector.on('collect', async (button) => {
            if(button.user.id != message.author.id) {
                return button.reply({
                    content: 'This is not for you.',
                    ephemeral: true,
                })
            } 

            
            button.deferUpdate()
            if(button.customId === "confirm") {
                userData.interactionproccesses.interaction = false
                userData.interactionproccesses.proccessing = false

                await economyModel.updateOne(params, userData);
                const embed = {
                    color: '#00FF00',
                    author: {
                        name: `_____________`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                    },
                    title: `Transaction success, here is the receipt`,
                    description: `<@${message.author.id}> shared \`❀ ${amount.toLocaleString()}\` to <@${target.id}>`,
                    fields: [
                        {
                            name: `${message.author.username}`,
                            value: `**Wallet:** -\`❀ ${amount.toLocaleString()}\`\n**New Wallet:** \`${(userData.wallet - amount).toLocaleString()}\``,
                            inline: true,
                        },
                        {
                            name: `${target.username}`,
                            value: `**Wallet:** +\`❀ ${amount.toLocaleString()}\`\n**New Wallet:** \`${(target_profileData_coins).toLocaleString()}\``,
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
                await economyModel.findOneAndUpdate(
                    {userId: target.id},
                    {
                        $inc: {
                            wallet: -amount,
                        },
                    },
                    {
                        upsert: true,
                    }
                );
                userData.interactionproccesses.interaction = false
                userData.interactionproccesses.proccessing = false
                userData.wallet = userData.wallet + amount
                await economyModel.updateOne(params, userData);

                const embed = {
                    color: '#FF0000',
                    author: {
                        name: `_____________`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                    },
                    title: `Transaction cancelled`,
                    description: `<@${message.author.id}>, do you want to share \`❀ ${amount.toLocaleString()}\` to <@${target.id}>?\nI guess not...`,
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
                await economyModel.findOneAndUpdate(
                    {userId: target.id},
                    {
                        $inc: {
                            wallet: -amount,
                        },
                    },
                    {
                        upsert: true,
                    }
                );
                userData.interactionproccesses.interaction = false
                userData.interactionproccesses.proccessing = false
                userData.wallet = userData.wallet + amount
                await economyModel.updateOne(params, userData);
                const embed = {
                    color: '#FF0000',
                    author: {
                        name: `_____________`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                    },
                    title: `Transaction timeout`,
                    description: `<@${message.author.id}>, do you want to share \`❀ ${amount.toLocaleString()}\` to <@${target.id}>?\nI guess not...`,
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