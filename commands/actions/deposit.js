const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const letternumbers = require("../../reference/letternumber");

const jsoncooldowns = require("../../cooldowns.json");
const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
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
        .setName("deposit")
        .setDescription("Deposit coins into your bank.")
        .addStringOption((oi) => {
            return oi
                .setName("amount")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                )
                .setRequired(true);
        }),
    cdmsg: "Stop depositing so fast!",
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

        let amount = options.amount?.toLowerCase();
        const bankcoins = userData.bank.coins;
        const walletcoins = userData.wallet;
        const bankspace =
            userData.bank.bankspace +
            userData.bank.expbankspace +
            userData.bank.otherbankspace;
        const bank_percent_filled = ((bankcoins / bankspace) * 100).toFixed(2);
        const availableBankspace = bankspace - bankcoins;

        const errorembed = new MessageEmbed().setColor("RED");

        if (availableBankspace <= 0) {
            errorembed.setDescription(
                `Your bank can't hold anymore coins...\n**Current Bank Status:** \`❀ ${bankcoins.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (walletcoins === 0) {
            errorembed.setDescription(
                "You got nothing in your wallet to deposit."
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (amount === "max" || amount === "all") {
            amount = walletcoins;
            if (amount > availableBankspace) {
                amount = availableBankspace;
            }
        } else if (amount === "half") {
            amount = Math.floor(walletcoins / 2);
            if (amount > availableBankspace) {
                amount = availableBankspace;
            }
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
                "You deposited nothing, so nothing changed. Are you good?"
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (amount < 0 || amount % 1 != 0) {
            errorembed.setDescription("Deposit amount must be a whole number.");
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (amount > walletcoins) {
            errorembed.setDescription(
                `You don't have that amount of coins to deposit.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (amount > availableBankspace) {
            errorembed.setDescription(
                `Your bank can't hold \`❀ ${amount.toLocaleString()}\` more coins. Run more commands to gain experience bankspace or buy bankinteractions to use.\n**Current Bank Status:** \`❀ ${profileData.bank.toLocaleString()}\` | \`${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\`\n**Avaliable Bankspace:** \`❀ ${availableBankspace.toLocaleString()}\``
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        const new_bank = bankcoins + amount;
        const new_wallet = walletcoins - amount;
        try {
            const params = {
                userId: interaction.user.id,
            };
            userData.wallet = new_wallet;
            userData.bank.coins = new_bank;

            await economyModel.findOneAndUpdate(params, userData);

            const embed = {
                color: "RANDOM",
                title: `Deposit`,
                author: {
                    name: `${interaction.user.username}#${interaction.user.discriminator}`,
                    icon_url: `${interaction.user.displayAvatarURL()}`,
                },
                description: `**Deposited:** \`❀ ${amount.toLocaleString()}\`\nCurrent Bank Balance: \`❀ ${new_bank.toLocaleString()}\`\nCurrent Wallet Balance: \`❀ ${new_wallet.toLocaleString()}\``,
                timestamp: new Date(),
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
            jsoncooldowns[interaction.user.id].deposit = timpstamp;
            fs.writeFile(
                "./cooldowns.json",
                JSON.stringify(jsoncooldowns),
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.log(err);
        }
    },
};
