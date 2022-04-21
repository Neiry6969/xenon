// const itemModel = require("../models/itemSchema");
// const allItems = require("../data/all_items")

// module.exports = {
//     name: "createitems",
//     cooldown: 2,
//     description: "createitems.",
//     async execute(message, args, cmd, client, Discord, profileData) {
//         if(message.author.id === '567805802388127754') {
//             try {   
//                 const getitems = allItems.map(async (value) => {
//                     let item = await itemModel.create({
//                         item: value.item,
//                         name: value.name,
//                         aliases: value.aliases,
//                         icon: value.icon,
//                         price: value.price,
//                         sell: value.sell,
//                         trade: value.trade,
//                         imageUrl: value.imageUrl,
//                         description: value.description,
//                         rarity: value.rarity,
//                         type: value.type,
//                     });
                
//                     item.save();
            
//                     const embed = {
//                         color: '#0000FF',
//                         title: `Created an item`,
//                         description: `${item}`,
//                         timestamp: new Date(),
//                     };
//                     return message.reply({ embeds: [embed] });
//                 })
        
                
//             } catch (error) {
//                 console.log(error)
//             }
//         } else {
//             return message.channel.send("OK.");
//         }
//     }
// }