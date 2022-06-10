const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const allItems = require('../data/all_items');

const lowest = ['worm', 'rat', 'rock']
const lowmid = ['snail', 'lizard', 'chestofwooden']
const highmid = ['scorpion']
const high = ['statue', 'bronzecrown']

function dig() {
    const number = Math.floor(Math.random() * 10000);
    if(number <= 5000) {
        return `You weren't able to dig anything, just bad luck.`
    } else if(number <= 8000 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if(number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if(number <= 9990 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if(number > 9990) {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    }
}

module.exports = {
    name: 'dig',
    cooldown: 35,
    maxArgs: 0,
    description: "Dig for some treasures.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        const params = {
            userId: message.author.id
        }
        const shovel = allItems.find((val) => (val.item.toLowerCase()) === "shovel")

        const iftable = args[0]?.toLowerCase()
        if(iftable === 'table' || iftable === 'list') {
            const worm = allItems.find((val) => (val.item.toLowerCase()) === "worm")
            const rat = allItems.find((val) => (val.item.toLowerCase()) === "rat")
            const rock = allItems.find((val) => (val.item.toLowerCase()) === "rock")
            const lizard = allItems.find((val) => (val.item.toLowerCase()) === "lizard")
            const snail = allItems.find((val) => (val.item.toLowerCase()) === "snail")
            const scorpion = allItems.find((val) => (val.item.toLowerCase()) === "scorpion")
            const statue = allItems.find((val) => (val.item.toLowerCase()) === "statue")
            const bronzecrown = allItems.find((val) => (val.item.toLowerCase()) === "bronzecrown")
            const chestofwooden = allItems.find((val) => (val.item.toLowerCase()) === "chestofwooden")
            
            const lowest_table = `${worm.icon} \`${worm.item}\`, ${rat.icon} \`${rat.item}\`, ${rock.icon} \`${rock.item}\``
            const lowmid_table = `${lizard.icon} \`${lizard.item}\`, ${snail.icon} \`${snail.item}\`, ${chestofwooden.icon} \`${chestofwooden.item}\``
            const highmid_table = `${scorpion.icon} \`${scorpion.item}\``
            const high_table = `${statue.icon} \`${statue.item}\`, ${bronzecrown.icon} \`${bronzecrown.item}\``


            const embed = {
                color: 'RANDOM',
                title: `Dig Table ${shovel.icon}`,
                description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`30%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.9%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.1%\`\nitems: ${high_table}`,
                timestamp: new Date(),
            };
    
            return message.reply({ embeds: [embed] });
        } else {
                const result = dig()
                if(
                    !inventoryData.inventory[shovel.item] || inventoryData.inventory[shovel.item] === 0 || !userData
                ) {
                    const embed = {
                        color: 'RANDOM',
                        title: `Dig Error ${shovel.icon}`,
                        description: `You need atleast \`1\` ${shovel.item} ${shovel.icon} to go digging. Use this command again when you have one.`,
                        timestamp: new Date(),
                    };
            
                    return message.reply({ embeds: [embed] });
                } else {
                    if(result === `You weren't able to dig anything, just bad luck.`) {
                        const embed = {
                            color: 'RANDOM',
                            title: `${message.author.username} went for a dig ${shovel.icon}`,
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
                            title: `${message.author.username} went for a dig ${shovel.icon}`,
                            description: `You pulled something out of the ground! You got a \`${item.item}\` ${item.icon}`,
                            timestamp: new Date(),
                        };
                
                        return message.reply({ embeds: [embed] });
                    }
                    
                }
    
        }
    }
}