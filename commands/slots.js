const profileModel = require("../models/profileSchema");

const icons = [
    '<:excalibur:966537260034043974>',
    '<:creatorscrown:965024171463688323>',
    '<:flamesword:965038139334864966>',
    '<:losttrident:967562834487701555>',
    '<:scythe:966324426993967174>',
    '<:moon:962410227104383006>',

]

const iconsother = [
    '<:flamesword:965038139334864966>',
    '<:losttrident:967562834487701555>',
    '<:scythe:966324426993967174>',
    '<:moon:962410227104383006>',
]


function slot(num) {
    if(num <= 10) {
        return '<:excalibur:966537260034043974>';
    } else if(num <= 30) {
        return '<:creatorscrown:965024171463688323>';
    } else {
        const result = Math.floor(Math.random() * iconsother.length)
        return iconsother[result];
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
            const embed = {
                color: 'RANDOM',
                title: `Slots Table`,
                description: `Here is the slots table.`,
                fields: [
                    {
                        name: '**ICON**',
                        value: '<:moon:962410227104383006><:moon:962410227104383006>\n<:scythe:966324426993967174><:scythe:966324426993967174>\n<:losttrident:967562834487701555><:losttrident:967562834487701555>\n<:flamesword:965038139334864966><:flamesword:965038139334864966>\n<:creatorscrown:965024171463688323><:creatorscrown:965024171463688323>\n<:excalibur:966537260034043974><:excalibur:966537260034043974>\n<:moon:962410227104383006><:moon:962410227104383006><:moon:962410227104383006>\n<:scythe:966324426993967174><:scythe:966324426993967174><:scythe:966324426993967174>\n<:losttrident:967562834487701555><:losttrident:967562834487701555><:losttrident:967562834487701555>\n<:flamesword:965038139334864966><:flamesword:965038139334864966><:flamesword:965038139334864966>\n<:creatorscrown:965024171463688323><:creatorscrown:965024171463688323><:creatorscrown:965024171463688323>\n<:excalibur:966537260034043974><:excalibur:966537260034043974><:excalibur:966537260034043974>',
                        inline: true,
                    },
                    {
                        name: '**MULTIPLIER**',
                        value: 'x1\nx1\nx1\nx1\nx2\nx3\nx4\nx5\nx6\nx10\nx15\nx30', 
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
            const slot1_num = Math.floor(Math.random() * 100);
            const slot2_num = Math.floor(Math.random() * 100);
            const slot3_num = Math.floor(Math.random() * 100);
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
            const allthree = slots1 === slots2 && slots2 === slots3;

            let multiplier;
            if(allthree === true) {
                if(slots1 === '<:excalibur:966537260034043974>') {
                    multiplier = 30;
                } else if(slots1 === '<:creatorscrown:965024171463688323>') {
                    multiplier = 15;
                } else if(slots1 === '<:flamesword:965038139334864966>') {
                    multiplier = 10;
                } else if(slots1 === '<:losttrident:967562834487701555>') {
                    multiplier = 6;
                } else if(slots1 === '<:scythe:966324426993967174>') {
                    multiplier = 5;
                } else if(slots1 === '<:moon:962410227104383006>') {
                    multiplier = 4;
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
                    description: `**[>${resultslots.join(' ')}<]**\n\n**Multiplier:** \`${multiplier.toLocaleString()}\`\n**You Won:** \`${winamount.toLocaleString()}\`\n**Wallet:** \`${wallet.toLocaleString()}\``,
                    footer: {
                        text: 'Xenon Slots'
                    }
                };

                msg.edit({ embeds: [embed] })
            } else if(slots1 === slots2) {
                if(slots1 === '<:excalibur:966537260034043974>') {
                    multiplier = 3;
                } else if(slots1 === '<:creatorscrown:965024171463688323>') {
                    multiplier = 2;
                } else if(slots1 === '<:flamesword:965038139334864966>' || slots1 === '<:scythe:966324426993967174>' || slots1 === '<:losttrident:967562834487701555>' || slots1 === '<:flamesword:965038139334864966>') {
                    multiplier = 1;
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
                    description: `**[>${resultslots.join(' ')}<]**\n\n**Multiplier:** \`${multiplier.toLocaleString()}\`\n**You Won:** \`${winamount.toLocaleString()}\`\n**Wallet:** \`${wallet.toLocaleString()}\``,
                    footer: {
                        text: 'Xenon Slots'
                    }
                };

                msg.edit({ embeds: [embed] })
            } else if(slots1 === slots3) {
                if(slots1 === '<:excalibur:966537260034043974>') {
                    multiplier = 3;
                } else if(slots1 === '<:creatorscrown:965024171463688323>') {
                    multiplier = 2;
                } else if(slots1 === '<:flamesword:965038139334864966>' || slots1 === '<:scythe:966324426993967174>' || slots1 === '<:losttrident:967562834487701555>' || slots1 === '<:flamesword:965038139334864966>') {
                    multiplier = 1;
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
                    description: `**[>${resultslots.join(' ')}<]**\n\n**Multiplier:** \`${multiplier.toLocaleString()}\`\n**You Won:** \`${winamount.toLocaleString()}\`\n**Wallet:** \`${wallet.toLocaleString()}\``,
                    footer: {
                        text: 'Xenon Slots'
                    }
                };

                msg.edit({ embeds: [embed] })
            } else if(slots3 === slots2) {
                if(slots3 === '<:excalibur:966537260034043974>') {
                    multiplier = 3;
                } else if(slots3 === '<:creatorscrown:965024171463688323>') {
                    multiplier = 2;
                } else if(slots3 === '<:flamesword:965038139334864966>' || slots3 === '<:scythe:966324426993967174>' || slots3 === '<:losttrident:967562834487701555>' || slots3 === '<:flamesword:965038139334864966>') {
                    multiplier = 1;
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
                    description: `**[>${resultslots.join(' ')}<]**\n\n**Multiplier:** \`${multiplier.toLocaleString()}\`\n**You Won:** \`${winamount.toLocaleString()}\`\n**Wallet:** \`${wallet.toLocaleString()}\``,
                    footer: {
                        text: 'Xenon Slots'
                    }
                };

                msg.edit({ embeds: [embed] })
            } else {
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
            }

        }
    }
}