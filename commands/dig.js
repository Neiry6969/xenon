const inventoryModel = require('../models/inventorySchema');
const profileModel = require('../models/profileSchema');
const allItems = require('../data/all_items');

const lowest = ['worm', 'rat', 'rock']
const lowmid = ['snail', 'lizard']
const highmid = ['scorpion', 'web', 'bluecoin']
const high = ['statue']

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
    cooldown: 20,
    maxArgs: 0,
    description: "dig for some treasures.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const iftable = args[0]?.toLowerCase()
        if(iftable === 'table' || iftable === 'list') {
            const worm = allItems.find((val) => (val.item.toLowerCase()) === "worm")
            const rat = allItems.find((val) => (val.item.toLowerCase()) === "rat")
            const rock = allItems.find((val) => (val.item.toLowerCase()) === "rock")
            const lizard = allItems.find((val) => (val.item.toLowerCase()) === "lizard")
            const snail = allItems.find((val) => (val.item.toLowerCase()) === "snail")
            const scorpion = allItems.find((val) => (val.item.toLowerCase()) === "scorpion")
            const bluecoin = allItems.find((val) => (val.item.toLowerCase()) === "bluecoin")
            const web = allItems.find((val) => (val.item.toLowerCase()) === "web")
            const statue = allItems.find((val) => (val.item.toLowerCase()) === "statue")
            
            const lowest_table = `${worm.icon} \`${worm.item}\`, ${rat.icon} \`${rat.item}\`, ${rock.icon} \`${rock.item}\``
            const lowmid_table = `${lizard.icon} \`${lizard.item}\`, ${snail.icon} \`${snail.item}\``
            const highmid_table = `${scorpion.icon} \`${scorpion.item}\`, ${bluecoin.icon} \`${bluecoin.item}\`, ${web.icon} \`${web.item}\``
            const high_table = `${statue.icon} \`${statue.item}\``


            const embed = {
                color: 'RANDOM',
                title: `Dig Table`,
                description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`30%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.9%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.1%\`\nitems: ${high_table}`,
                timestamp: new Date(),
            };
    
            return message.reply({ embeds: [embed] });
        } else {
            const result = dig()
            const params = {
                userId: message.author.id,
            }

            inventoryModel.findOne(params, async(err, data) => {
                if(data) {
                    const shovel = allItems.find((val) => (val.item.toLowerCase()) === "shovel")
                    if(
                        !data.inventory[shovel.item] || data.inventory[shovel.item] === 0
                    ) {
                        const embed = {
                            color: 'RANDOM',
                            title: `Dig Error`,
                            description: `You need atleast \`1\` ${shovel.item} ${shovel.icon} to go digging. Use this command again when you have one.`,
                            timestamp: new Date(),
                        };
                
                        return message.reply({ embeds: [embed] });
                    } else {
                        if(result === `You weren't able to dig anything, just bad luck.`) {
                            const embed = {
                                color: 'RANDOM',
                                title: `${message.author.username} went for a dig`,
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
                                title: `${message.author.username} went for a dig`,
                                description: `You pulled something out of the ground! You got a \`${item.item}\` ${item.icon}`,
                                timestamp: new Date(),
                            };
                    
                            return message.reply({ embeds: [embed] });
                        }
                        
                    }
                } else {
                    const embed = {
                        color: '#FF0000',
                        title: `Dig Error`,
                        description: `You need atleast \`1\` ${shovel.icon} \`${shovel.item}\` to go digging. Use this command again when you have one.`,
                        timestamp: new Date(),
                    };
            
                return message.reply({ embeds: [embed] });
                }
            })
        }
    }
}