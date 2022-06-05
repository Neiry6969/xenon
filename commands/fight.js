// const { MessageActionRow, MessageButton } = require('discord.js')
// const fs = require('fs')

// const profileModel = require("../models/profileSchema");
// const letternumbers = require('../reference/letternumber');
// const userModel = require('../models/userSchema')
// const inventoryModel = require('../models/inventorySchema')

// module.exports = {
//     name: "fight",
//     aliases: [],
//     cooldown: 0,
//     minArgs: 0,
//     maxArgs: 1,
//     description: "fight coins with other users.",
//     async execute(message, args, cmd, client, Discord, profileData) {
//         let target;

//         if(message.mentions.users.first()) {
//             target = message.mentions.users.first()
//         } else {
//             try {
//                 const featch_user = await message.guild.members.fetch(args[0])
//                 target = featch_user.user
//             } catch (error) {
//                 target = null
//             }
//         }
        
//         let amount = args[1]?.toLowerCase();

//         const expectedsyntax = `**Expected Syntax:** \`xe fight [user] [amount]\``

//         if(!target) {
//             const embed = {
//                 color: '#FF0000',
//                 title: `Action Error`,
//                 description: `Mention a user to fight coins with!\n${expectedsyntax}`,
//             };
//             return message.reply({ embeds: [embed] });
//         } else if(target.id === message.author.id) {
//             const embed = {
//                 color: '#FF0000',
//                 title: `Action Error`,
//                 description: `You can't fight with yourself, just do it mentally!\n${expectedsyntax}`,
//             };
//             return message.reply({ embeds: [embed] });
//         } 

//         const target_profileData = await profileModel.findOne({ userId: target.id });
//         const target_inventoryData = await inventoryModel.findOne({ userId: target.id });
        
//         if(profileData.coins <= 0) {
//             if (profileData.bank <= 0) {
//                 return message.reply(`You got no coins in your wallet or your bank to fight, your broke :c.`);
//             } else {
//                 return message.reply(`You got no coins in your wallet to fight, maybe withdraw some?`);
//             }
//         }

//         if(!amount) {
//             amount = 0
//         } else if(amount === 'max' || amount === 'all') {
//             amount = profileData.coins;
//         } else if(amount === 'half') {
//             amount = Math.floor(profileData.coins / 2)
//         } else if(letternumbers.find((val) => val.letter === amount.slice(-1))) {
//             if(parseInt(amount.slice(0, -1))) {
//                 const number = parseFloat(amount.slice(0, -1));
//                 const numbermulti = letternumbers.find((val) => val.letter === amount.slice(-1)).number;
//                 amount = number * numbermulti;
//             } else {
//                 amount = null;
//             }
//         } else {
//             amount = parseInt(amount)
//         }

//         if(
//             amount === 0 ||
//             !amount ||
//             amount < 0 || 
//             amount % 1 != 0 
//         ) {
//             amount = 0
//         }
        
        
//         // if(amount === 0) {
//         //     return message.reply("So you want to fight nothing, pretend you did that in your mind");
//         // } else if(!amount) {
//         //     const embed = {
//         //         color: '#FF0000',
//         //         title: `Action Error`,
//         //         description: `Specify the amount you want to fight.\n${expectedsyntax}`,
//         //     };
//         //     return message.reply({ embeds: [embed] })
//         // } else if(amount < 0 || amount % 1 != 0) {
//         //     return message.reply("Share amount must be a whole number.");
//         // } 

//         if(amount > profileData.coins) {
//             if(amount < profileData.bank + profileData.coins) {
//                 return message.reply(`You don't have that amount of coins to give from your wallet, maybe withdraw some?`);
//             } else {
//                 return message.reply(`You don't have that amount of coins to give from your wallet or your bank.`);
//             }
//         } else if(target_profileData.coins < amount) {
//             return message.reply(`<@${target.id}> doesn't have that many coins to fight.`);
//         } 

//         if(amount > 0) {
//             const local_response = await profileModel.updateMany(
//                 {},
//                 {
//                     $inc: {
//                         coins: -amount,
//                     },
//                 },
//                 {
//                     upsert: true,
//                     arrayFilters: [ message.author.id, target.id ]
//                 }
//             )
//         }

//         message.reply(`Fighting ${(amount * 2)}`)


//     }
// }