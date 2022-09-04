const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addexperiencepoints,
} = require("../../utils/currencyfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const letternumbers = require("../../reference/letternumber");
const { fetchMultipliers } = require("../../utils/userfunctions");

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
    async execute(interaction, client) {
        const options = {
            amount: interaction.options.getString("amount"),
        };
        let error_message;
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const multipliersData_fetch = await fetchMultipliers(
            interaction.user.id
        );
        const economyData = economyData_fetch.data;
        const inventoryData = inventoryData_fetch.data;

        let maxwinningmulti = 1.5;
        let minwinningmulti = 0.5;

        if (multipliersData_fetch.multiplier >= 245) {
            maxwinningmulti = 250;
            minwinningmulti = 120;
        } else if (multipliersData_fetch.multiplier >= 200) {
            minwinningmulti = 225;
            addedminwinningmulti = 100;
        } else if (multipliersData_fetch.multiplier >= 150) {
            maxwinningmulti = 200;
            minwinningmulti = 100;
        } else if (multipliersData_fetch.multiplier >= 150) {
            maxwinningmulti = 175;
            minwinningmulti = 80;
        }

        let maxwallet = 25000000;

        if (inventoryData.inventory["finecrown"] >= 1) {
            maxwallet = 500000000;
        }
        let amount = options.amount?.toLowerCase();
        const maxamount = 500000;

        if (economyData.wallet >= maxwallet) {
            error_message = `You are too rich to gamble.\n**Cap:** \`❀ ${maxwallet.toLocaleString()}\`\n**Wallet:** \`❀ ${economyData.wallet.toLocaleString()}\``;
            return errorReply(interaction, error_message);
        }

        if (economyData.wallet < 5000) {
            if (economyData.bank.coins >= 5000) {
                error_message = `You need at least ❀ \`5,000\` to use the bet machine, maybe withdraw some?`;
                return errorReply(interaction, error_message);
            } else {
                error_message = `You need at least ❀ \`5,000\` to use the bet machine.`;
                return errorReply(interaction, error_message);
            }
        }

        if (amount === "max" || amount === "all") {
            if (economyData.wallet > maxamount) {
                amount = maxamount;
            } else {
                amount = economyData.wallet;
            }
        } else if (amount === "half") {
            amount = Math.floor(economyData.wallet / 2);
        } else if (
            letternumbers.find((val) => val.letter === amount.slice(-1))
        ) {
            if (parseInt(amount.slice(0, -1))) {
                const number = parseFloat(amount.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === amount.slice(-1)
                ).number;
                amount = number * numbermulti;
            } else {
                amount = null;
            }
        } else {
            amount = parseInt(amount);
        }
        amount = parseInt(amount);

        if (!amount || amount < 0) {
            error_message = `You can only bet a whole number of coins, don't try to break me smh.`;
            return errorReply(interaction, error_message);
        } else if (amount > economyData.wallet) {
            error_message = `You don't have that many coins to bet.\n**Wallet:** \`❀ ${economyData.wallet.toLocaleString()}\``;
            return errorReply(interaction, error_message);
        } else if (amount < 5000) {
            error_message = `You need to bet atleast at least ❀ \`5,000\` with the bet machine.`;
            return errorReply(interaction, error_message);
        } else if (amount > maxamount) {
            error_message = `You aren't able to bet that many coins\n**Max Amount:** \`❀ ${maxamount.toLocaleString()}\``;
            return errorReply(interaction, error_message);
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

        const gamble_embed = new MessageEmbed()
            .setTitle(`Gamble Game`)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setFields(
                {
                    name: `${interaction.user.username}`,
                    value: `${userdice1.symbol}${userdice2.symbol} \`${userdice_total}\``,
                    inline: true,
                },
                {
                    name: `${client.user.username}`,
                    value: `${xenondice1.symbol}${xenondice2.symbol} \`${xenondice_total}\``,
                    inline: true,
                }
            );

        await interaction.reply({ embeds: [gamble_embed] });
        const gamble_msg = await interaction.fetchReply();

        if (userdice_total < xenondice_total) {
            await removeCoins(economyData.userId, amount);

            const newwallet = economyData.wallet - amount;

            gamble_embed
                .setColor(`#ff9497`)
                .setDescription(
                    `You Lost! <a:cat_cry:1008879262671044719>\n\n**You lost:** \`❀ ${amount.toLocaleString()}\``
                )
                .setFooter({
                    text: `New Wallet: ❀ ${newwallet.toLocaleString()}`,
                });

            gamble_msg.edit({ embeds: [gamble_embed] });
        } else if (userdice_total === xenondice_total) {
            gamble_embed
                .setColor(`#fdff87`)
                .setDescription(
                    `You Tied! <a:wumpus_relief:1008882381366759434>\n\`Nothing has changed\``
                )
                .setFooter({
                    text: `New Wallet: ❀ ${economyData.wallet.toLocaleString()}`,
                });

            gamble_msg.edit({ embeds: [gamble_embed] });
        } else {
            const multipliercalc =
                Math.random() * (maxwinningmulti - minwinningmulti) +
                minwinningmulti;
            const multiplier = multipliercalc.toFixed(2);

            const winningamount = Math.floor(parseFloat(multiplier) * amount);
            const newwallet = economyData.wallet + winningamount;

            await addCoins(economyData.userId, winningamount);
            await addexperiencepoints(interaction.user.id, 1, 25);

            gamble_embed
                .setColor(`#95ff87`)
                .setDescription(
                    `You Won! <a:cat_greenbonk:1008879267674865755>\n\n**You Won:** \`❀ ${winningamount.toLocaleString()}\`\n**Multiplier:** \`x${multiplier}\` \`${parseInt(
                        multiplier * 100
                    )}%\``
                )
                .setFooter({
                    text: `New Wallet: ❀ ${newwallet.toLocaleString()}`,
                });

            gamble_msg.edit({ embeds: [gamble_embed] });
        }

        return setCooldown(interaction, "gamble", 10, economyData);
    },
};
