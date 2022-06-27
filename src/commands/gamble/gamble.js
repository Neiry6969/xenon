const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");

const letternumbers = require("../../reference/letternumber");

const jsoncooldowns = require("../../../cooldowns.json");
const fs = require("fs");
function premiumcooldowncalc(defaultcooldown) {
    if (defaultcooldown <= 5 && defaultcooldown > 2) {
        return defaultcooldown - 2;
    } else if (defaultcooldown <= 15) {
        return defaultcooldown - 5;
    } else if (defaultcooldown <= 120) {
        return defaultcooldown - 10;
    } else {
        return defaultcooldown;
    }
}

const dice = [
    {
        symbol: "⚅",
        value: 6,
    },
    {
        symbol: "⚄",
        value: 5,
    },
    {
        symbol: "⚃",
        value: 4,
    },
    {
        symbol: "⚂",
        value: 3,
    },
    {
        symbol: "⚁",
        value: 2,
    },
    {
        symbol: "⚀",
        value: 1,
    },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gamble")
        .setDescription("Gamble your coins.")
        .addStringOption((oi) => {
            return oi
                .setName("amount")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                )
                .setRequired(true);
        }),
    cdmsg: "Stop gambling so fast! If this keeps up, I bet you'll be much more poor.",
    cooldown: 10,
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData
    ) {
        const options = {
            amount: interaction.options.getString("amount"),
        };

        const errorembed = new MessageEmbed().setColor("#FF5C5C");
        const maxwinningmulti = 1.5;
        const minwinningmulti = 0.5;
        let maxwallet = 25000000;

        if (inventoryData.inventory["finecrown"] >= 1) {
            maxwallet = 500000000;
        }
        let betamount = options.amount;
        const maxbetamount = 500000;

        if (userData.wallet >= maxwallet) {
            errorembed.setDescription(
                `You are too rich to gamble.\n**Cap:** \`❀ ${maxwallet.toLocaleString()}\`\n**Wallet:** \`❀ ${userData.wallet.toLocaleString()}\``
            );

            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (userData.wallet < 5000) {
            if (userData.bank.coins >= 5000) {
                errorembed.setDescription(
                    `You need at least ❀ \`5,000\` to use the bet machine, maybe withdraw some?`
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                errorembed.setDescription(
                    `You need at least ❀ \`5,000\` to use the bet machine.`
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            }
        }

        if (betamount === "max" || betamount === "all") {
            if (userData.wallet > maxbetamount) {
                betamount = maxbetamount;
            } else {
                betamount = userData.wallet;
            }
        } else if (betamount === "half") {
            betamount = Math.floor(userData.wallet / 2);
        } else if (
            letternumbers.find((val) => val.letter === betamount.slice(-1))
        ) {
            if (parseInt(betamount.slice(0, -1))) {
                const number = parseFloat(betamount.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === betamount.slice(-1)
                ).number;
                betamount = number * numbermulti;
            } else {
                betamount = null;
            }
        } else {
            betamount = parseInt(betamount);
        }
        betamount = parseInt(betamount);

        if (!betamount || betamount < 0) {
            errorembed.setDescription(
                `You can only bet a whole number of coins, don't try to break me smh.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (betamount > userData.wallet) {
            errorembed.setDescription(
                `You don't have that many coins to bet.\n**Wallet:** \`❀ ${userData.wallet.toLocaleString()}\``
            );

            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (betamount < 5000) {
            errorembed.setDescription(
                `You need to bet atleast at least ❀ \`5,000\` with the bet machine.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (betamount > maxbetamount) {
            errorembed.setDescription(
                `You aren't able to bet that many coins\n**Max Amount:** \`❀ ${maxbetamount.toLocaleString()}\``
            );

            return interaction.reply({ embeds: [errorembed], ephemeral: true });
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
            color: "#000000",
            title: `${interaction.user.username}'s betting game`,
            fields: [
                {
                    name: `${interaction.user.username}`,
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
                text: "Xenon Gamble",
            },
        };

        await interaction.reply({ embeds: [embed] });
        const msg = await interaction.fetchReply();

        if (userdice_total < xenondice_total) {
            const response = await economyModel.findOneAndUpdate(
                {
                    userId: interaction.user.id,
                },
                {
                    $inc: {
                        wallet: -betamount,
                    },
                },
                {
                    upsert: true,
                }
            );

            const lostamount = userData.wallet - betamount;

            const embed = {
                color: "#ff4c4c",
                title: `${interaction.user.username}'s betting game`,
                description: `You Lost!\n\n**You lost:** \`❀ ${betamount.toLocaleString()}\`\n**Wallet:** \`❀ ${lostamount.toLocaleString()}\``,
                fields: [
                    {
                        name: `${interaction.user.username}`,
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
                    text: "Xenon Gamble",
                },
            };

            msg.edit({ embeds: [embed] });
        } else if (userdice_total === xenondice_total) {
            const embed = {
                color: "#FFFF00",
                title: `${interaction.user.username}'s betting game`,
                description: `You Tied! Nothing has changed.\n\n**You Won:** ❀ \`0\`\n**Wallet:** \`❀ ${userData.wallet.toLocaleString()}\``,
                fields: [
                    {
                        name: `${interaction.user.username}`,
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
                    text: "Xenon Gamble",
                },
            };

            msg.edit({ embeds: [embed] });
        } else {
            const dicedifference = userdice_total - xenondice_total;
            const maxwinmulti = maxwinningmulti - (0.1 * dicedifference - 0.1);

            const multipliercalc =
                Math.random() * maxwinmulti + minwinningmulti;
            const multiplier = multipliercalc.toFixed(2);

            const winningamount = Math.floor(multiplier * betamount);
            const wallet = userData.wallet + winningamount;

            const response = await economyModel.findOneAndUpdate(
                {
                    userId: interaction.user.id,
                },
                {
                    $inc: {
                        wallet: winningamount,
                    },
                },
                {
                    upsert: true,
                }
            );

            const embed = {
                color: "#b7ffa1",
                title: `${interaction.user.username}'s betting game`,
                description: `You Won!\n\n**You Won:** \`❀ ${winningamount.toLocaleString()}\`\n**Multiplier:** \`x${multiplier}\` \`${parseInt(
                    multiplier * 100
                )}%\`\n**Wallet:** \`❀ ${wallet.toLocaleString()}\``,
                fields: [
                    {
                        name: `${interaction.user.username}`,
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
                    text: "Xenon Gamble",
                },
            };

            msg.edit({ embeds: [embed] });
        }

        let cooldown = 10;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].gamble = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    },
};
