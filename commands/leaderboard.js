// const profileModel = require("../models/profileSchema");

// module.exports = {
//     name: 'test',
//     cooldown: 0,
//     description: "check the bit's latency status.",
//     execute(message, args, cmd, client, Discord) {
//         let topnetbalance;
//         let leaderboard = [];
//         const guildusers = ['567805802388127754', '811301172505739315'];

//         // guildusers.forEach((id) => {
//         //     profileModel.find({ userId: id }).then((data) => {
//         //         const networth = data.coins + data.bank;

//         //         if(leaderboard.length === 0) {
//         //             topnetbalance = networth
//         //             return leaderboard.push(data)
//         //         } 

//         //         if(networth > topnetbalance) {
//         //             return leaderboard.unshift(data)
//         //         }

//         //     })
//         // })  
//         profileModel.find({ userId: guildusers }).then((data) => {
//             // leaderboard = data;
//             // // const networth = data.coins + data.bank;

//             // // if(leaderboard.length === 0) {
//             // //     topnetbalance = networth
//             // //     return leaderboard.push(data)
//             // // } 

//             // // if(networth > topnetbalance) {
//             // //     return leaderboard.unshift(data)
//             // // }

//         })

//         console.log(leaderboard)
//     }
// }