const profileModel = require("../models/profileSchema");

const winningicons = [
    '<:excalibur:966537260034043974>',
    '<:creatorscrown:965024171463688323>',
    '<:flamesword:965038139334864966>',
    '<:losttrident:967562834487701555>',
    '<:scythe:966324426993967174>',
    '<:moon:962410227104383006>',
]

const multiplieramount_2 = [
    {
        icon: '<:moon:962410227104383006>',
        multi: 1
    },
    {
        icon: '<:scythe:966324426993967174>',
        multi: 1
    },  
    {
        icon: '<:losttrident:967562834487701555>',
        multi: 1
    },
    {
        icon: '<:flamesword:965038139334864966>',
        multi: 1
    },
    {
        icon: '<:creatorscrown:965024171463688323>',
        multi: 2
    },
    {
        icon: '<:excalibur:966537260034043974>',
        multi: 3
    },
]

const multiplieramount_3 = [
    {
        icon: '<:moon:962410227104383006>',
        multi: 4
    },
    {
        icon: '<:scythe:966324426993967174>',
        multi: 5
    },
    {
        icon: '<:losttrident:967562834487701555>',
        multi: 6
    },
    {
        icon: '<:flamesword:965038139334864966>',
        multi: 10
    },
    {
        icon: '<:creatorscrown:965024171463688323>',
        multi: 15
    },
    {
        icon: '<:excalibur:966537260034043974>',
        multi: 69
    },
]

function majorityElement (arr = []) {
    const threshold = Math.floor(arr.length / 2);
    const map = {};
    for (let i = 0; i < arr.length; i++) {
       const value = arr[i];
       map[value] = map[value] + 1 || 1;
       if (map[value] > threshold)
          return value
    };
    return false;
};
function countElements(num, arr) {
    const counts = {};

    for (num of arr) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    return counts;
}

function slot(num) {
    const leftovericons = [
        '<:flamesword:965038139334864966>',
        '<:losttrident:967562834487701555>',
        '<:scythe:966324426993967174>',
        '<:moon:962410227104383006>',
        '<:fionaskitten:965416467162099812>',
        '<:donut:965343121133162616>',
        '<:silvercrown:963568001213403196>',
        '<:testerstea:965275697855733810>',
    ]
    if(num <= 69) {
        return '<:excalibur:966537260034043974>';
    } else if(num <= 169) {
        return '<:creatorscrown:965024171463688323>';
    } else {
        const result = Math.floor(Math.random() * leftovericons.length);
        return leftovericons[result];
    }
}

module.exports = {
    name: "slots",
    aliases: ['slot'],
    cooldown: 0,
    minArgs: 0,
    maxArgs: 0,
    description: "slots you money away.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const iftable = args[0]?.toLowerCase();

        if(iftable === 'table' || iftable === 'list') {
            const multifor2_icons = multiplieramount_2.map((value) => {
                return `${value.icon}${value.icon}`;
            }).join("\n")
            const multifor3_icons = multiplieramount_3.map((value) => {
                return `${value.icon}${value.icon}${value.icon}`;
            }).join("\n")
            const multifor2_multi =  multiplieramount_2.map((value) => {
                return `\`x${value.multi}\``;
            }).join("\n")
            const multifor3_multi =  multiplieramount_3.map((value) => {
                return `\`x${value.multi}\``;
            }).join("\n")

            const embed = {
                color: 'RANDOM',
                title: `Slots Table`,
                description: `Here is the slots table.`,
                fields: [
                    {
                        name: '**ICON**',
                        value: `${multifor2_icons}\n${multifor3_icons}`,
                        inline: true,
                    },
                    {
                        name: '**MULTIPLIER**',
                        value: `${multifor2_multi}\n${multifor3_multi}`, 
                        inline: true,
                    },
                ],
                timestamp: new Date(),
            };
    
            message.reply({ embeds: [embed] })
        } else {
            let slotsamount = args[0]
            const maxslotsamount = 300000;

            if(profileData.coins < 5000) {
                if(profileData.bank >= 5000) {
                    return message.reply(`You need at least ❀ \`5,000\` to use the slots machine, maybe withdraw some?`)
                } else {
                    return message.reply(`You need at least ❀ \`5,000\` to use the slots machine.`)
                }
            }
            

            if(slotsamount === 'max' || slotsamount === 'all') {
                if(profileData.coins > maxslotsamount) {
                    slotsamount = maxslotsamount;
                } else {
                    slotsamount = profileData.coins;
                }
            } else {
                slotsamount = parseInt(slotsamount)
                if(slotsamount > profileData.coins) {
                    const embed = {
                        color: '#FF0000',
                        title: `Slots Error`,
                        description: `You don't have that many coins to slots.\n**Wallet:** ❀ \`${profileData.coins.toLocaleString()}\``,
                    };
    
                    return message.reply({ embeds: [embed] });
                }
            }   

            if(!slotsamount || slotsamount < 0) {
                return message.reply(`You can only slots a whole number of coins, don't try to break me smh.`)
            } else if(slotsamount > maxslotsamount) {
                const embed = {
                    color: '#FF0000',
                    title: `Slots Error`,
                    description: `You aren't able to slots that many coins\n**Max Amount:** ❀ \`${maxslotsamount.toLocaleString()}\``,
                };

                return message.reply({ embeds: [embed] });
            } 

            const slot1_num = Math.floor(Math.random() * 100 * 100);
            const slot2_num = Math.floor(Math.random() * 100 * 100);
            const slot3_num = Math.floor(Math.random() * 100 * 100);
            const slots1 = slot(slot1_num);
            const slots2 = slot(slot2_num);
            const slots3 = slot(slot3_num);
            const resultslots = [slots1, slots2, slots3];


            const embed = {
                color: '#000000',
                title: `${message.author.username}'s slots machine`,
                description: `**[>${resultslots.join(' ')}<]**`,
                footer: {
                    text: 'Xenon Slots'
                }
            };

            const msg = await message.channel.send({ embeds: [embed] })

            let multiplier;
            const majorityelement = majorityElement(resultslots)
            const majorityelementcount = countElements(majorityElement, resultslots)

            if(majorityelement === false) {
                const response = await profileModel.findOneAndUpdate(
                    {
                        userId: message.author.id,
                    },
                    {
                        $inc: {
                            coins: -slotsamount,
                        },
                    },
                    {
                        upsert: true,
                    }
                );

                const lostamount = profileData.coins - slotsamount;

                const embed = {
                    color: '#ff4c4c',
                    title: `${message.author.username}'s losing slots machine`,
                    description: `**[>${resultslots.join(' ')}<]**\n\n**You lost:** \`${slotsamount.toLocaleString()}\`\n**Wallet:** \`${lostamount.toLocaleString()}\``,
                    footer: {
                        text: 'Xenon Slots'
                    }
                };

                msg.edit({ embeds: [embed] })
            } else if (!winningicons.includes(majorityelement)) {
                const response = await profileModel.findOneAndUpdate(
                    {
                        userId: message.author.id,
                    },
                    {
                        $inc: {
                            coins: -slotsamount,
                        },
                    },
                    {
                        upsert: true,
                    }
                );

                const lostamount = profileData.coins - slotsamount;

                const embed = {
                    color: '#ff4c4c',
                    title: `${message.author.username}'s losing slots machine`,
                    description: `**[>${resultslots.join(' ')}<]**\n\n**You lost:** \`${slotsamount.toLocaleString()}\`\n**Wallet:** \`${lostamount.toLocaleString()}\``,
                    footer: {
                        text: 'Xenon Slots'
                    }
                };

                msg.edit({ embeds: [embed] })
            } else {
                let multiplier;
                if(majorityelementcount[majorityelement] === 3) {
                    multiplier = multiplieramount_3.find((val) => (val.icon.toLowerCase()) === majorityelement).multi;
                } else if(majorityelementcount[majorityelement] === 2) {
                    multiplier = multiplieramount_2.find((val) => (val.icon.toLowerCase()) === majorityelement).multi;
                } else {
                    multiplier = multiplieramount_2.find((val) => (val.icon.toLowerCase()) === majorityelement).multi;
                }

                const winamount = multiplier * slotsamount;
                const wallet = profileData.coins + winamount;

                const response = await profileModel.findOneAndUpdate(
                    {
                        userId: message.author.id,
                    },
                    {
                        $inc: {
                            coins: winamount,
                        },
                    },
                    {
                        upsert: true,
                    }
                );

                const embed = {
                    color: '#b7ffa1',
                    title: `${message.author.username}'s winning slots machine`,
                    description: `**[>${resultslots.join(' ')}<]**\n\n**Multiplier:** \`x${multiplier.toLocaleString()}\`\n**You Won:** \`${winamount.toLocaleString()}\`\n**Wallet:** \`${wallet.toLocaleString()}\``,
                    footer: {
                        text: 'Xenon Slots'
                    }
                };

                msg.edit({ embeds: [embed] })
            }
        }
    }
}