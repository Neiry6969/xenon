const inventoryModel = require('../models/inventorySchema');
const profileModel = require('../models/profileSchema');
const allItems = require('../data/all_items');

let amount;

const lowest = [
    {
        item: 'rock',
        maxamount: 25
    }, 
    {
        item: 'shardofsteel',
        maxamount: 20
    },
]
const lowmid = [
    {
        item: 'shardofsteel',
        maxamount: 30
    },
    {
        item: 'shardofuranium',
        maxamount: 12
    },
    {
        item: 'shardofcopper',
        maxamount: 18
    },
]
const highmid = [
    {
        item: 'shardofaluminum',
        maxamount: 10
    },
    {
        item: 'shardofgold',
        maxamount: 5
    }
]
const high = [
    {
        item: 'shardofdiamond',
        maxamount: 3
    }, 
    {
        item: 'enhancedpickaxe',
        maxamount: 1
    }
]

function mine() {
    const number = Math.floor(Math.random() * 10000);
    if(number <= 5000) {
        return `You weren't able to mine anything, unlucky.`
    } else if(number <= 8300 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);
        amount = Math.floor(Math.random() * lowest[result].maxamount) + 1;

        return lowest[result].item;
    } else if(number <= 9800 && number > 8300) {
        const result = Math.floor(Math.random() * lowmid.length);
        amount = Math.floor(Math.random() * lowmid[result].maxamount) + 1;

        return lowmid[result].item;
    } else if(number <= 9999 && number > 9800) {
        const result = Math.floor(Math.random() * highmid.length);
        amount = Math.floor(Math.random() * highmid[result].maxamount) + 1;

        return highmid[result].item;
    } else if(number > 9999) {
        const result = Math.floor(Math.random() * high.length);
        amount = Math.floor(Math.random() * high[result].maxamount) + 1;

        return high[result].item;
    }
}

module.exports = {
    name: 'mine',
    cooldown: 120,
    maxArgs: 0,
    description: "Mine for some materials.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const pickaxe = allItems.find((val) => (val.item.toLowerCase()) === "pickaxe")

        const iftable = args[0]?.toLowerCase()
        if(iftable === 'table' || iftable === 'list') {
            const lowestMap = lowest
            .map((value) => {
                const item = allItems.find((val) => (val.item.toLowerCase()) === value.item);
                return `${item.icon} \`${item.item}\` [\`max: ${value.maxamount.toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug)`
            })
            .sort()
            .join('\n')

            const lowmidtMap = lowmid
            .map((value) => {
                const item = allItems.find((val) => (val.item.toLowerCase()) === value.item);
                return `${item.icon} \`${item.item}\` [\`max: ${value.maxamount.toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug)`
            })
            .sort()
            .join('\n')

            const highmidMap = highmid
            .map((value) => {
                const item = allItems.find((val) => (val.item.toLowerCase()) === value.item);
                return `${item.icon} \`${item.item}\` [\`max: ${value.maxamount.toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug)`
            })
            .sort()
            .join('\n')

            const highMap = high
            .map((value) => {
                const item = allItems.find((val) => (val.item.toLowerCase()) === value.item);
                return `${item.icon} \`${item.item}\` [\`max: ${value.maxamount.toLocaleString().toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug)`
            })
            .sort()
            .join('\n')
            
            const embed = {
                color: 'RANDOM',
                title: `Mine Table`,
                description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`33%\`\n${lowestMap}\n\n**Low Mid** ──── \`15%\`\n${lowmidtMap}\n\n**High Mid** ──── \`1.99%\`\n${highmidMap}\n\n**High** ──── \`0.01%\`\n${highMap}`,
                timestamp: new Date(),
            };
    
            return message.reply({ embeds: [embed] });
        } else {
            const result = mine()
            const params = {
                userId: message.author.id,
            }
    
            inventoryModel.findOne(params, async(err, data) => {

                if(data) {
                    if(
                        !data.inventory[pickaxe.item] || data.inventory[pickaxe.item] === 0 || !data
                    ) {
                        const embed = {
                            color: 'RANDOM',
                            title: `Mine Error ${pickaxe.icon}`,
                            description: `You need atleast \`1\` ${pickaxe.item} ${pickaxe.icon} to go minning. Use this command again when you have one.`,
                            timestamp: new Date(),
                        };
                
                        return message.reply({ embeds: [embed] });
                    } else {
                        if(result === `You weren't able to mine anything, unlucky.`) {
                            const embed = {
                                color: 'RANDOM',
                                title: `${message.author.username} went for a mine ${pickaxe.icon}`,
                                description: result,
                                timestamp: new Date(),
                            };
                    
                            return message.reply({ embeds: [embed] });
                        } else {
                            const item = allItems.find((val) => (val.item.toLowerCase()) === result)
                            const hasItem = Object.keys(data.inventory).includes(item.item);
                            if(!hasItem) {
                                data.inventory[item.item] = amount;
                            } else {
                                data.inventory[item.item] = data.inventory[item.item] + amount;
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
                                title: `${message.author.username} went for a mine ${pickaxe.icon}`,
                                description: `Nice find! You got [\`${amount.toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug) \`${item.item}\` ${item.icon}`,
                                timestamp: new Date(),
                            };
                    
                            return message.reply({ embeds: [embed] });
                        }
                        
                    }
                } else {
                    const embed = {
                        color: '#FF0000',
                        title: `Mine Error ${pickaxe.icon}`,
                        description: `You need atleast \`1\` ${pickaxe.icon} \`${pickaxe.item}\` to go minning. Use this command again when you have one.`,
                        timestamp: new Date(),
                    };
            
                   return message.reply({ embeds: [embed] });
                }
            })
        }
        
    }
}