module.exports = [
    {
        title: "Fiona",
        mincoins: 500,
        maxcoins: 1000,
        itemsprecent: 70 * 100,
        items: ["donut", 'bottleofcola'],
        description: "Fiona was feeling generous and gave you ❀ \`COINS\`", 
        faildescription: "Fiona didn't know you and thought you were a stalker so she ran away.",  
        deathdescription: "She didn't like you begging so you got hit to death, scary!",
        itemdescription: "She also gave you a ITEM",
        multicoins: 1,
        successrate: 70 * 100,
        deathrate: 50 * 100,
    },
    {
        title: "Your Best Friend",
        mincoins: 500,
        maxcoins: 1000,
        itemsprecent: 0.01 * 100,
        items: ["airpods"],
        description: "Here homey have ❀ \`COINS\`", 
        faildescription: "Srry man I got no coins.",  
        deathdescription: "You friend thought you were disgusting for begging so much and killed you on the spot.",
        itemdescription: "They also gave you a ITEM",
        multicoins: 1,
        successrate: 80 * 100,
        deathrate: 10 * 100,
    },
    {
        title: "Stranger",
        mincoins: 500,
        maxcoins: 10000,
        itemsprecent: 70 * 100,
        items: ["donut", 'bottleofcola', 'kfcchicken'],
        description: "The stranger put ❀ \`COINS\` in your wallet and left.", 
        faildescription: "The stranger pretended they didn't see you and just left on his way.",  
        deathdescription: `"You are no use to society you shall die."`,
        itemdescription: "They also gave you a ITEM",
        multicoins: 1,
        successrate: 70 * 100,
        deathrate: 50 * 100,
    },
]

// {
//     title: "",
//     coins: ,
//     items: [
//         {
//             name: "",
//             precent: ""
//         }
//     ],
//     description: "",  
//     faildescription: "",
//     multicoins: ,
//     deathrate: ,
// }