const profileModel = require("../models/profileSchema");
const letternumbers = require('../reference/letternumber');

const dice = [
    {
        symbol: "⚅",
        value: 6
    },
    {
        symbol: "⚄",
        value: 5
    },
    {
        symbol: "⚃",
        value: 4
    },
    {
        symbol: "⚂",
        value: 3
    },
    {
        symbol: "⚁",
        value: 2
    },
    {
        symbol: "⚀",
        value: 1
    },

]

module.exports = {
    name: "gamble",
    aliases: ['bet'],
    cooldown: 10,
    minArgs: 0,
    maxArgs: 0,
    description: "bet your money away.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const maxwinningmulti = 2.0;
        const minwinningmulti = 0.5;
        const iftable = args[0]?.toLowerCase();

        if(iftable === 'table' || iftable === 'list') {
            const embed = {
                color: 'RANDOM',
                title: `Gamble Table`,
                description: `MAX WINNING MULTIPLIER: **x${maxwinningmulti}** \`${maxwinningmulti * 100}%\` (-0.1 x dice difference)\nMIN WINNING MULTIPLIER: **x${minwinningmulti}** \`${minwinningmulti * 100}%\``,
                timestamp: new Date(),
            };
    
            message.reply({ embeds: [embed] })
        } else {
            let betamount = args[0]
            const maxbetamount = 500000;

            if(profileData.coins < 5000) {
                if(profileData.bank >= 5000) {
                    return message.reply(`You need at least ❀ \`5,000\` to use the bet machine, maybe withdraw some?`)
                } else {
                    return message.reply(`You need at least ❀ \`5,000\` to use the bet machine.`)
                }
            }
            

            if(betamount === 'max' || betamount === 'all') {
                if(profileData.coins > maxbetamount) {
                    betamount = maxbetamount;
                } else {
                    betamount = profileData.coins;
                }
            } else if(letternumbers.find((val) => val.letter === betamount.slice(-1))) {
                if(parseInt(betamount.slice(0, -1))) {
                    const number = parseFloat(betamount.slice(0, -1));
                    const numbermulti = letternumbers.find((val) => val.letter === betamount.slice(-1)).number;
                    betamount = number * numbermulti;
                } else {
                    betamount = null;
                }
            } else {
                betamount = parseInt(betamount)
                if(betamount > profileData.coins) {
                    const embed = {
                        color: '#FF0000',
                        title: `Gamble Error`,
                        description: `You don't have that many coins to bet.\n**Wallet:** ❀ \`${profileData.coins.toLocaleString()}\``,
                    };
    
                    return message.reply({ embeds: [embed] });
                }
            }   

            if(!betamount || betamount < 0) {
                return message.reply(`You can only bet a whole number of coins, don't try to break me smh.`)
            } else if(betamount > maxbetamount) {
                const embed = {
                    color: '#FF0000',
                    title: `Gamble Error`,
                    description: `You aren't able to bet that many coins\n**Max Amount:** ❀ \`${maxbetamount.toLocaleString()}\``,
                };

                return message.reply({ embeds: [embed] });
            } 

            const userdice1_random = Math.floor(Math.random() * 6) + 1;
            const userdice2_random = Math.floor(Math.random() * 6) + 1;
            const xenondice1_random = Math.floor(Math.random() * 6) + 1;
            const xenondice2_random = Math.floor(Math.random() * 6) + 1;

            userdice_total = userdice1_random + userdice2_random;
            xenondice_total = xenondice1_random + xenondice2_random;
            
            const userdice1 = dice.find((val) => val.value === userdice1_random);
            const userdice2 = dice.find((val) => val.value === userdice2_random);
            const xenondice1 = dice.find((val) => val.value === xenondice1_random);
            const xenondice2 = dice.find((val) => val.value === xenondice2_random);

            const embed = {
                color: '#000000',
                title: `${message.author.username}'s betting game`,
                fields: [
                    {
                        name: `${message.author.username}`,
                        value: `${userdice1.symbol}${userdice2.symbol} \`${userdice_total}\``,
                        inline: true,
                    },
                    {
                        name: `${client.user.username}`,
                        value: `${xenondice1.symbol}${xenondice2.symbol} \`${xenondice_total}\``,
                        inline: true,
                    },
                ],
                footer: {
                    text: 'Xenon Gamble'
                }
            };

            const msg = await message.channel.send({ embeds: [embed] })  
            
            if(userdice_total < xenondice_total) {
                const response = await profileModel.findOneAndUpdate(
                    {
                        userId: message.author.id,
                    },
                    {
                        $inc: {
                            coins: -betamount,
                        },
                    },
                    {
                        upsert: true,
                    }
                );

                const lostamount = profileData.coins - betamount;

                const embed = {
                    color: '#ff4c4c',
                    title: `${message.author.username}'s betting game`,
                    description: `You Lost!\n\n**You lost:** ❀ \`${betamount.toLocaleString()}\`\n**Wallet:** ❀ \`${lostamount.toLocaleString()}\``,
                    fields: [
                        {
                            name: `${message.author.username}`,
                            value: `${userdice1.symbol}${userdice2.symbol} \`${userdice_total}\``,
                            inline: true,
                        },
                        {
                            name: `${client.user.username}`,
                            value: `${xenondice1.symbol}${xenondice2.symbol} \`${xenondice_total}\``,
                            inline: true,
                        },
                    ],
                    footer: {
                        text: 'Xenon Gamble'
                    }
                };

                msg.edit({ embeds: [embed] })
            } else if(userdice_total === xenondice_total) {
                const lostamount = profileData.coins - betamount;

                const embed = {
                    color: '#FFFF00',
                    title: `${message.author.username}'s betting game`,
                    description: `You Tied! Nothing has channed.\n\n**You Won:** ❀ \`0\`\n**Wallet:** ❀ \`${profileData.coins.toLocaleString()}\``,
                    fields: [
                        {
                            name: `${message.author.username}`,
                            value: `${userdice1.symbol}${userdice2.symbol} \`${userdice_total}\``,
                            inline: true,
                        },
                        {
                            name: `${client.user.username}`,
                            value: `${xenondice1.symbol}${xenondice2.symbol} \`${xenondice_total}\``,
                            inline: true,
                        },
                    ],
                    footer: {
                        text: 'Xenon Gamble'
                    }
                };

                msg.edit({ embeds: [embed] })
            } else {
                const dicedifference = userdice_total - xenondice_total;
                const maxwinmulti = maxwinningmulti - (0.1 * dicedifference - 0.1);

                const multipliercalc = (Math.random() * maxwinmulti) + minwinningmulti;
                const multiplier = multipliercalc.toFixed(2);

                const winningamount = Math.floor(multiplier * betamount);
                const wallet = profileData.coins + winningamount;

                const response = await profileModel.findOneAndUpdate(
                    {
                        userId: message.author.id,
                    },
                    {
                        $inc: {
                            coins: winningamount,
                        },
                    },
                    {
                        upsert: true,
                    }
                );


                const embed = {
                    color: '#00FF00',
                    title: `${message.author.username}'s betting game`,
                    description: `You Won!\n\n**You Won:** ❀ \`${winningamount.toLocaleString()}\`\n**Multiplier:** \`x${multiplier}\` \`${parseInt(multiplier * 100)}%\`\n**Wallet:** ❀ \`${wallet.toLocaleString()}\``,
                    fields: [
                        {
                            name: `${message.author.username}`,
                            value: `${userdice1.symbol}${userdice2.symbol} \`${userdice_total}\``,
                            inline: true,
                        },
                        {
                            name: `${client.user.username}`,
                            value: `${xenondice1.symbol}${xenondice2.symbol} \`${xenondice_total}\``,
                            inline: true,
                        },
                    ],
                    footer: {
                        text: 'Xenon Gamble'
                    }
                };

                msg.edit({ embeds: [embed] })
            }
        }
    }
}