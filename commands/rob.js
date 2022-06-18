const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const interactionproccesses = require('../interactionproccesses.json')

const jsoncooldowns = require('../cooldowns.json');
const fs = require('fs');
const { MessageEmbed } = require("discord.js");
function premiumcooldowncalc(defaultcooldown) {
    if(defaultcooldown <= 5 && defaultcooldown > 2) {
        return defaultcooldown - 2
    } else if(defaultcooldown <= 15) {
        return defaultcooldown - 5
    } else if(defaultcooldown <= 120) {
        return defaultcooldown - 10
    } else {
        return defaultcooldown
    }
}

function getresult(precent) {
    const resultnum = Math.floor(Math.random() * 10000)

    if(resultnum < (precent * 100)) {
        return true;
    } else {
        return false;
    }
}


module.exports = {
    name: "rob",
    aliases: ['steal'],
    cooldown: 40,
    cdmsg: "Wait before you can rob again, stop being so greedy!",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        let cooldown = 40;
        const params = {
            userId: message.author.id
        }
        const user = message.author;
        let target;
        const expectedArgs = 'Expected usage: `xe rob [user]`'
        const eembed = new MessageEmbed()

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
        
        if(target) {
            if(target.id === message.author.id) {
                eembed
                    .setColor('RED')
                    .setDescription("You can't rob yourself...")
                return message.reply({ embeds: [eembed] })
            } 
            
            if(userData.wallet < 5000) {
                if(userData.wallet + userData.bank.coins < 5000) {
                    eembed
                        .setColor('RED')
                        .setDescription("So you need to pay at least `❀ 5,000` from your wallet to pay for the basic supplies to rob someone...")
                    return message.reply({ embeds: [eembed] })
                } else {
                    eembed
                        .setColor('RED')
                        .setDescription(`So you need to pay at least \`❀ 5,000\` from your wallet to pay for the basic supplies to rob someone. At least you have enough if you withdraw some from your bank!`)
                    return message.reply({ embeds: [eembed] })
                }
            }

            let targetData;
            try {   
                targetData = await economyModel.findOne({ userId: target.id });
                if(!targetData) {
                    let targetuser = await economyModel.create({
                        userId: target.id,
                    });

                    targetData = targetuser
                
                    targetuser.save();
                }
            } catch(error) {
                console.log(error)
            }

            const targetWallet = targetData.wallet

            if(targetWallet < 10000) {
                eembed
                    .setColor('RED')
                    .setDescription(`**So this user was too poor to be robbed, leave them alone!**\nMinimum to be robbable: \`❀ 10,000\``)
                return message.reply({ embeds: [eembed] })
            }

            const robembed = new MessageEmbed() 
                .setColor('GOLD')

            let successrate = 50;
            const success = getresult(successrate)

            if(success === true) {
                const outcomenumer = Math.floor(Math.random() * 10000)
                let robamountpercent;
                let robmsg;

                if(outcomenumer <= 10* 100) {
                    robamountpercent = 100
                    robmsg = `Robbed their entire wallet 🤑!`
                } else if(outcomenumer <= 30 * 100) {
                    robamountpercent = 80
                    robmsg = `Robbed most of their entire wallet 💰!`
                } else if(outcomenumer <= 60 * 100) {
                    robamountpercent = 40
                    robmsg = `Robbed some of their wallet 💵!`
                } else {
                    robamountpercent = Math.floor(Math.random() * 24) + 1
                    robmsg = `Robbed a tiny portion of their wallet 💸!`
                }

                const finalsum = Math.floor(targetWallet * (robamountpercent / 100))

                await economyModel.findOneAndUpdate(
                    {userId: target.id},
                    {
                        $inc: {
                            wallet: -finalsum, 
                        },
                    },
                    {
                        upsert: true,
                    }
                );
                
                userData.wallet = userData.wallet + finalsum
                await economyModel.updateOne(params, userData);

                if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
                    cooldown = premiumcooldowncalc(cooldown)
                }
                const cooldown_amount = (cooldown) * 1000;
                const timpstamp = Date.now() + cooldown_amount
                jsoncooldowns[message.author.id].rob = timpstamp
                fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})


                robembed
                    .setDescription(`**Your rob was a success!**\n\`${robmsg}\`\nYou robbed a total of\`❀ ${finalsum.toLocaleString()}\` from \`${target.username}\` <@${target.id}>\n\n**They have now been notified!**`)
                    .setTimestamp()
                const dmembed = new MessageEmbed()
                    .setColor('ORANGE')
                    .setTitle("Oh no, you have been robbed!")
                    .setDescription(`Server: ${message.guild.name} \`${message.guild.id}\`\nRobber: \`${message.author.username}#${message.author.discriminator}\` <@${message.author.id}>\n Amount lost: \`❀ ${finalsum.toLocaleString()}\``)

                client.users.fetch(target.id, false).then((user) => {
                    user.send({ embeds: [dmembed] });
                });

                return message.reply({ embeds: [robembed] })
            } else if(success === false) {
                await economyModel.findOneAndUpdate(
                    {userId: target.id},
                    {
                        $inc: {
                            wallet: 5000,
                        },
                    },
                    {
                        upsert: true,
                    }
                );
                
                userData.wallet = userData.wallet - 5000
                await economyModel.updateOne(params, userData);

                if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
                    cooldown = premiumcooldowncalc(cooldown)
                }
                const cooldown_amount = (cooldown) * 1000;
                const timpstamp = Date.now() + cooldown_amount
                jsoncooldowns[message.author.id].rob = timpstamp
                fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})
                eembed
                    .setColor('RED')
                    .setDescription(`**You tried to rob \`${target.username}\` <@${target.id}> but failed! You really suck!**\nYou paided them: \`❀ 5,000\` 💀📉`)
                return message.reply({ embeds: [eembed] })

            }



        } else {
            eembed
                .setColor('RED')
                .setDescription(`**You need to specify the person you want to rob**\nThis could be because of the following:\n\n-They aren't in ${message.guild.name}\n-Not valid format (\`USERID\` or \`MENTION\` only)\n\n${expectedArgs}`)
            return message.reply({ embeds: [eembed] })
        }
    }
}