const inventoryModel = require('../models/inventorySchema');
const profileModel = require('../models/profileSchema');
const allItems = require('../data/all_items');

const lowest = ['bread', 'carrot', 'lettuce']
const lowmid = ['tomato', 'corn', 'eggplant']
const highmid = ['potato', 'onion', 'avocado']
const high = ['bubbletea']

function harvest() {
    const number = Math.floor(Math.random() * 10000);
    if(number <= 5000) {
        return `You weren't able to harvest anything.`
    } else if(number <= 8000 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if(number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if(number <= 9950 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if(number > 9950) {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    }
}

module.exports = {
    name: 'harvest',
    aliases: ['harv'],
    cooldown: 35,
    maxArgs: 0,
    description: "harvest for some food.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const hoe = allItems.find((val) => (val.item.toLowerCase()) === "hoe")

        const iftable = args[0]?.toLowerCase()
        if(iftable === 'table' || iftable === 'list') {
            const bread = allItems.find((val) => (val.item.toLowerCase()) === "bread")
            const carrot = allItems.find((val) => (val.item.toLowerCase()) === "carrot")
            const lettuce = allItems.find((val) => (val.item.toLowerCase()) === "lettuce")
            const tomato = allItems.find((val) => (val.item.toLowerCase()) === "tomato")
            const corn = allItems.find((val) => (val.item.toLowerCase()) === "corn")
            const potato = allItems.find((val) => (val.item.toLowerCase()) === "potato")
            const eggplant = allItems.find((val) => (val.item.toLowerCase()) === "eggplant")
            const onion = allItems.find((val) => (val.item.toLowerCase()) === "onion")
            const bubbletea = allItems.find((val) => (val.item.toLowerCase()) === "bubbletea")
            const avocado = allItems.find((val) => (val.item.toLowerCase()) === "avocado")
            
            const lowest_table = `${bread.icon} \`${bread.item}\`, ${carrot.icon} \`${carrot.item}\`, ${lettuce.icon} \`${lettuce.item}\``
            const lowmid_table = `${tomato.icon} \`${tomato.item}\`, ${corn.icon} \`${corn.item}\`, ${eggplant.icon} \`${eggplant.item}\``
            const highmid_table = `${potato.icon} \`${potato.item}\`, ${onion.icon} \`${onion.item}\`, ${avocado.icon} \`${avocado.item}\``
            const high_table = `${bubbletea.icon} \`${bubbletea.item}\``


            const embed = {
                color: 'RANDOM',
                title: `Harvest Table ${hoe.icon}`,
                description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`30%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.5%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.5%\`\nitems: ${high_table}`,
                timestamp: new Date(),
            };
    
            return message.reply({ embeds: [embed] });
        } else {
            const result = harvest()
            const params = {
                userId: message.author.id,
            }
    
            inventoryModel.findOne(params, async(err, data) => {

                if(data) {
                    if(
                        !data.inventory[hoe.item] || data.inventory[hoe.item] === 0 || !data
                    ) {
                        const embed = {
                            color: 'RANDOM',
                            title: `Harvest Error ${hoe.icon}`,
                            description: `You need atleast \`1\` ${hoe.item} ${hoe.icon} to go harvesting. Use this command again when you have one.`,
                            timestamp: new Date(),
                        };
                
                        return message.reply({ embeds: [embed] });
                    } else {
                        if(result === `You weren't able to harvest anything.`) {
                            const embed = {
                                color: 'RANDOM',
                                title: `${message.author.username} went for a harvest ${hoe.icon}`,
                                description: result,
                                timestamp: new Date(),
                            };
                    
                            return message.reply({ embeds: [embed] });
                        } else {
                            const item = allItems.find((val) => (val.item.toLowerCase()) === result)
                            const hasItem = Object.keys(data.inventory).includes(item.item);
                            if(!hasItem) {
                                data.inventory[item.item] = 1;
                            } else {
                                data.inventory[item.item] = data.inventory[item.item] + 1;
                            }
                            await inventoryModel.findOneAndUpdate(params, data);
                            
                            const expbankspace_amount = Math.floor(Math.random() * 1000) + 69;
                            const experiencepoints_amount = Math.floor(expbankspace_amount / 100);

                            const response = await profileModel.findOneAndUpdate(
                                {
                                    userId: message.author.id,
                                },
                                {
                                    $inc: {
                                        expbankspace: expbankspace_amount,
                                        experiencepoints: experiencepoints_amount,
                                    },
                                },
                                {
                                    upsert: true,
                                }
                            );
                            
                            const embed = {
                                color: 'RANDOM',
                                title: `${message.author.username} went for a harvest ${hoe.icon}`,
                                description: `You were able to harvest something! You got a \`${item.item}\` ${item.icon}`,
                                timestamp: new Date(),
                            };
                    
                            return message.reply({ embeds: [embed] });
                        }
                        
                    }
                } else {
                    const embed = {
                        color: '#FF0000',
                        title: `Harvest Error ${hoe.icon}`,
                        description: `You need atleast \`1\` ${hoe.icon} \`${hoe.item}\` to go harvesting. Use this command again when you have one.`,
                        timestamp: new Date(),
                    };
            
                   return message.reply({ embeds: [embed] });
                }
            })
        }
        
    }
}