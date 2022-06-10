const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const allItems = require('../data/all_items');

const lowest = ['shrimp', 'crab', 'fish']
const lowmid = ['lobster', 'squid']
const highmid = ['whale', 'dolphin', 'shark']
const high = ['losttrident']

function fish() {
    const number = Math.floor(Math.random() * 10000);
    if(number <= 6000) {
        return `You weren't able to catch anything.`
    } else if(number <= 8000 && number > 6000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if(number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if(number <= 9999 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if(number > 9999) {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    }
}

module.exports = {
    name: 'fish',
    cooldown: 35,
    maxArgs: 0,
    description: "fish for some food.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        const params = {
            userId: message.author.id
        }
        const fishingrod = allItems.find((val) => (val.item.toLowerCase()) === "fishingrod")

        const iftable = args[0]?.toLowerCase()
        if(iftable === 'table' || iftable === 'list') {
            const fish = allItems.find((val) => (val.item.toLowerCase()) === "fish")
            const crab = allItems.find((val) => (val.item.toLowerCase()) === "crab")
            const shrimp = allItems.find((val) => (val.item.toLowerCase()) === "shrimp")
            const lobster = allItems.find((val) => (val.item.toLowerCase()) === "lobster")
            const squid = allItems.find((val) => (val.item.toLowerCase()) === "squid")
            const whale = allItems.find((val) => (val.item.toLowerCase()) === "whale")
            const dolphin = allItems.find((val) => (val.item.toLowerCase()) === "dolphin")
            const shark = allItems.find((val) => (val.item.toLowerCase()) === "shark")
            const losttrident = allItems.find((val) => (val.item.toLowerCase()) === "losttrident")
            
            const lowest_table = `${fish.icon} \`${fish.item}\`, ${crab.icon} \`${crab.item}\`, ${shrimp.icon} \`${shrimp.item}\``
            const lowmid_table = `${lobster.icon} \`${lobster.item}\`, ${squid.icon} \`${squid.item}\``
            const highmid_table = `${shark.icon} \`${shark.item}\`, ${dolphin.icon} \`${dolphin.item}\`, ${whale.icon} \`${whale.item}\``
            const high_table = `${losttrident.icon} \`${losttrident.item}\``


            const embed = {
                color: 'RANDOM',
                title: `Fishing Table ${fishingrod.icon}`,
                description: `**Fail** ──── \`60%\`\n\n**Lowest** ──── \`20%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.99%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.01%\`\nitems: ${high_table}`,
                timestamp: new Date(),
            };
    
            return message.reply({ embeds: [embed] });
        } else {
            const result = fish()
            if(
                !inventoryData.inventory[fishingrod.item] || inventoryData.inventory[fishingrod.item] === 0 || !userData
            ) {
                const embed = {
                    color: 'RANDOM',
                    title: `Fishing Error ${fishingrod.icon}`,
                    description: `You need atleast \`1\` ${fishingrod.item} ${fishingrod.icon} to go fishing. Use this command again when you have one.`,
                    timestamp: new Date(),
                };
        
                return message.reply({ embeds: [embed] });
            } else {
                if(result === `You weren't able to catch anything.`) {
                    const embed = {
                        color: 'RANDOM',
                        title: `${message.author.username} went for a fish ${fishingrod.icon}`,
                        description: result,
                        timestamp: new Date(),
                    };
            
                    return message.reply({ embeds: [embed] });
                } else {
                    const item = allItems.find((val) => (val.item.toLowerCase()) === result)
                    const hasItem = Object.keys(inventoryData.inventory).includes(item.item);
                    if(!hasItem) {
                        inventoryData.inventory[item.item] = 1;
                    } else {
                        inventoryData.inventory[item.item] = inventoryData.inventory[item.item] + 1;
                    }

                    const expbankspace_amount = Math.floor(Math.random() * 1000) + 100;
                    const experiencepoints_amount = Math.floor(expbankspace_amount / 100);
                    userData.bank.expbankspace = userData.bank.expbankspace + expbankspace_amount
                    userData.experiencepoints = userData.experiencepoints + experiencepoints_amount
                    userData.bank.expbankspace = userData.bank.expbankspace + Math.floor(Math.random() * 69)
                    await inventoryModel.findOneAndUpdate(params, inventoryData);
                    await economyModel.findOneAndUpdate(params, userData);
            
                    
                    const embed = {
                        color: 'RANDOM',
                        title: `${message.author.username} went for a fish ${fishingrod.icon}`,
                        description: `You were able to catch something! You got a \`${item.item}\` ${item.icon}`,
                        timestamp: new Date(),
                    };
            
                    return message.reply({ embeds: [embed] });
                }
                
            }

    
        }
        
    }
}