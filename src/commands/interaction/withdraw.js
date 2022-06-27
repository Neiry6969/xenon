const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const letternumbers = require("../../reference/letternumber");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Withdraw coins from you bank to your wallet.")
        .addStringOption((oi) => {
            return oi
                .setName("amount")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                )
                .setRequired(true);
        }),
    cdmsg: "Stop withdrawing so fast!",
    cooldown: 5,
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

        let cooldown = 5;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].withdraw = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        const errorembed = new MessageEmbed().setColor("RED");

        let amount = options.amount?.toLowerCase();
        const bankcoins = userData.bank.coins;
        const walletcoins = userData.wallet;

        if (bankcoins === 0) {
            errorembed.setDescription(
                "You got nothing in your bank to withdraw."
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (amount === "max" || amount === "all") {
            amount = bankcoins;
        } else if (amount === "half") {
            amount = Math.floor(bankcoins / 2);
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

        if (amount === 0) {
            errorembed.setDescription(
                "You withdrawn nothing, so nothing changed. Are you good?"
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (amount < 0 || amount % 1 != 0) {
            errorembed.setDescription(
                "Withdrawal amount must be a whole number."
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (amount > bankcoins) {
            errorembed.setDescription(
                `You don't have that amount of coins to withdraw.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        const new_bank = bankcoins - amount;
        const new_wallet = walletcoins + amount;
        try {
            const params = {
                userId: interaction.user.id,
            };
            userData.wallet = new_wallet;
            userData.bank.coins = new_bank;

            await economyModel.findOneAndUpdate(params, userData);

            const embed = {
                color: "RANDOM",
                title: `Withdrawal`,
                author: {
                    name: `${interaction.user.username}#${interaction.user.discriminator}`,
                    icon_url: `${interaction.user.displayAvatarURL()}`,
                },
                description: `**Withdrawn:** \`❀ ${amount.toLocaleString()}\`\nCurrent Bank Balance: \`❀ ${new_bank.toLocaleString()}\`\nCurrent Wallet Balance: \`❀ ${new_wallet.toLocaleString()}\``,
                timestamp: new Date(),
            };
            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.log(err);
        }
    },
};
