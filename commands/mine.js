// const inventoryModel = require('../models/inventorySchema');
// const profileModel = require('../models/profileSchema');
// const allItems = require('../data/all_items');

// const lowest = ['bird', 'chick', 'monkey']
// const lowmid = ['koala', 'pig', 'sheep']
// const highmid = ['panda', 'elephant', 'parrot']
// const high = ['dragon', 'unicorn']

// function hunt() {
//     const number = Math.floor(Math.random() * 10000);
//     if(number <= 5000) {
//         return `You weren't able to hunt any animals, welp I guess you should sharpen your aim.`
//     } else if(number <= 8000 && number > 5000) {
//         const result = Math.floor(Math.random() * lowest.length);

//         return lowest[result];
//     } else if(number <= 9500 && number > 8000) {
//         const result = Math.floor(Math.random() * lowmid.length);

//         return lowmid[result];
//     } else if(number <= 9950 && number > 9500) {
//         const result = Math.floor(Math.random() * highmid.length);

//         return highmid[result];
//     } else if(number > 9950) {
//         const result = Math.floor(Math.random() * high.length);

//         return high[result];
//     }
// }

// module.exports = {
//     name: 'hunt',
//     cooldown: 20,
//     maxArgs: 0,
//     description: "hunt for some animals.",
//     async execute(message, args, cmd, client, Discord, profileData) {
//         const iftable = args[0]?.toLowerCase()
//         if(iftable === 'table' || iftable === 'list') {
//             const bird = allItems.find((val) => (val.item.toLowerCase()) === "bird")
//             const chick = allItems.find((val) => (val.item.toLowerCase()) === "chick")
//             const monkey = allItems.find((val) => (val.item.toLowerCase()) === "monkey")
//             const koala = allItems.find((val) => (val.item.toLowerCase()) === "koala")
//             const pig = allItems.find((val) => (val.item.toLowerCase()) === "pig")
//             const sheep = allItems.find((val) => (val.item.toLowerCase()) === "sheep")
//             const panda = allItems.find((val) => (val.item.toLowerCase()) === "panda")
//             const elephant = allItems.find((val) => (val.item.toLowerCase()) === "elephant")
//             const parrot = allItems.find((val) => (val.item.toLowerCase()) === "parrot")
//             const dragon = allItems.find((val) => (val.item.toLowerCase()) === "dragon")
//             const unicorn = allItems.find((val) => (val.item.toLowerCase()) === "unicorn")
            
//             const lowest_table = `${bird.icon} \`${bird.item}\`, ${chick.icon} \`${chick.item}\`, ${monkey.icon} \`${monkey.item}\``
//             const lowmid_table = `${koala.icon} \`${koala.item}\`, ${pig.icon} \`${pig.item}\`, ${sheep.icon} \`${sheep.item}\``
//             const highmid_table = `${panda.icon} \`${panda.item}\`, ${elephant.icon} \`${elephant.item}\`, ${parrot.icon} \`${parrot.item}\``
//             const high_table = `${dragon.icon} \`${dragon.item}\`, ${unicorn.icon} \`${unicorn.item}\``


//             const embed = {
//                 color: 'RANDOM',
//                 title: `Hunt Table`,
//                 description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`30%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.5%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.5%\`\nitems: ${high_table}`,
//                 timestamp: new Date(),
//             };
    
//             return message.reply({ embeds: [embed] });
//         } else {
//             const result = hunt()
//             const params = {
//                 userId: message.author.id,
//             }
    
//             inventoryModel.findOne(params, async(err, data) => {
//                 const rifle = allItems.find((val) => (val.item.toLowerCase()) === "rifle")

//                 if(data) {
//                     if(
//                         !data.inventory[rifle.item] || data.inventory[rifle.item] === 0 || !data
//                     ) {
//                         const embed = {
//                             color: 'RANDOM',
//                             title: `Hunt Error`,
//                             description: `You need atleast \`1\` ${rifle.item} ${rifle.icon} to go hunting. Use this command again when you have one.`,
//                             timestamp: new Date(),
//                         };
                
//                         return message.reply({ embeds: [embed] });
//                     } else {
//                         if(result === `You weren't able to hunt any animals, welp I guess you should sharpen your aim.`) {
//                             const embed = {
//                                 color: 'RANDOM',
//                                 title: `${message.author.username} went for a hunt`,
//                                 description: result,
//                                 timestamp: new Date(),
//                             };
                    
//                             return message.reply({ embeds: [embed] });
//                         } else {
//                             const item = allItems.find((val) => (val.item.toLowerCase()) === result)
//                             const hasItem = Object.keys(data.inventory).includes(item.item);
//                             if(!hasItem) {
//                                 data.inventory[item.item] = 1;
//                             } else {
//                                 data.inventory[item.item] = data.inventory[item.item] + 1;
//                             }
//                             await inventoryModel.findOneAndUpdate(params, data);
                            
//                             const expbankspace_amount = Math.floor(Math.random() * 1000) + 69;
//                             const experiencepoints_amount = Math.floor(expbankspace_amount / 100);

//                             const response = await profileModel.findOneAndUpdate(
//                                 {
//                                     userId: message.author.id,
//                                 },
//                                 {
//                                     $inc: {
//                                         expbankspace: expbankspace_amount,
//                                         experiencepoints: experiencepoints_amount,
//                                     },
//                                 },
//                                 {
//                                     upsert: true,
//                                 }
//                             );
                            
//                             const embed = {
//                                 color: 'RANDOM',
//                                 title: `${message.author.username} went for a hunt`,
//                                 description: `Wow nice shot! You got a \`${item.item}\` ${item.icon}`,
//                                 timestamp: new Date(),
//                             };
                    
//                             return message.reply({ embeds: [embed] });
//                         }
                        
//                     }
//                 } else {
//                     const embed = {
//                         color: '#FF0000',
//                         title: `Hunt Error`,
//                         description: `You need atleast \`1\` ${rifle.icon} \`${rifle.item}\` to go hunting. Use this command again when you have one.`,
//                         timestamp: new Date(),
//                     };
            
//                    return message.reply({ embeds: [embed] });
//                 }
//             })
//         }
        
//     }
// }