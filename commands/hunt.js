const inventoryModel = require('../models/inventorySchema');
const allItems = require('../data/all_items');

const lowest = ['bird', 'chick', 'money']
const lowmid = ['koala', 'pig', 'sheep']
const highmid = ['panda', 'elepahnt', 'parrot']
const high = ['dragon', 'unicorn']

function hunt() {
    const number = Math.floor(Math.random() * 10000);
    if(number <= 5000) {
        return `You weren't able to hunt any animals, welp I guess you should sharpen your aim.`
    } else if(number <= 8000 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length) - 1;

        return lowest[result];
    } else if(number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length) - 1;

        return lowmid[result];
    } else if(number <= 9980 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length) - 1;

        return highmid[result];
    } else if(number > 9980) {
        const result = Math.floor(Math.random() * high.length) - 1;

        return high[result];
    }
}

module.exports = {
    name: 'hunt',
    cooldown: 20,
    description: "hunt for some animals.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const result = hunt()
        const params = {
            userId: message.author.id,
        }

        inventoryModel.findOne(params, async(err, data) => {
            if(data) {
                const rifle = allItems.find((val) => (val.item.toLowerCase()) === "rifle")
                if(
                    !data.inventory[rifle.item] || data.inventory[rifle.item] === 0
                ) {
                    const embed = {
                        color: 'RANDOM',
                        title: `Hunt Error`,
                        description: `You need atleast \`1\` ${rifle.item} ${rifle.icon} to go hunting. Use this command again when you have one.`,
                        timestamp: new Date(),
                    };
            
                    return message.reply({ embeds: [embed] });
                } else {
                    if(result === `You weren't able to hunt any animals, welp I guess you should sharpen your aim.`) {
                        const embed = {
                            color: 'RANDOM',
                            title: `${message.author.username} went for a hunt`,
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

                        const embed = {
                            color: 'RANDOM',
                            title: `${message.author.username} went for a hunt`,
                            description: `Wow nice shot! You got a \`${item.item}\` ${item.icon}`,
                            timestamp: new Date(),
                        };
                
                        return message.reply({ embeds: [embed] });
                    }
                    
                }
            } else {
                const embed = {
                    color: '#FF0000',
                    title: `Hunt Error`,
                    description: `You need atleast \`1\` ${rifle.icon} \`${rifle.item}\` to go hunting. Use this command again when you have one.`,
                    timestamp: new Date(),
                };
        
               return message.reply({ embeds: [embed] });
            }
        })
    }
}