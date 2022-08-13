const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
} = require("../../utils/currencyfunctions");

const jsoncooldowns = require("../../cooldowns.json");
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
        .setName("balance")
        .setDescription("Check a user's balance.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("Specify a user's balance you want to see");
        }),
    cdmsg: `You can't be checking balance so fast, chilldown!`,
    cooldown: 3,
    async execute(interaction, client) {
        const options = {
            user: interaction.options.getUser("user"),
        };

        let user = options.user;

        const balance_embed = new MessageEmbed()
            .setTitle("Balance")
            .setColor("RANDOM");

        if (!user) {
            user = interaction.user;
        }

        const economyData = await fetchEconomyData(user.id);
        const inventoryData = await fetchInventoryData(user.id);
        const networth = economyData.networth + inventoryData.networth;
        const bankspace_filled = (
            (economyData.data.bank.coins / economyData.netbankspace) *
            100
        ).toFixed(2);

        balance_embed
            .setDescription(
                `Wallet: \`❀ ${economyData.data.wallet.toLocaleString()}\`\nBank: \`❀ ${economyData.data.bank.coins.toLocaleString()} / ${economyData.netbankspace.toLocaleString()}\` \`${bankspace_filled}%\``
            )
            .setAuthor({
                name: `${user.tag}`,
                iconURL: user.displayAvatarURL(),
            })
            .addFields({
                name: `Net Worth`,
                value: `\`❀ ${networth.toLocaleString()}\``,
            });

        interaction.reply({ embeds: [balance_embed] });

        let cooldown = 3;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id]["balance"] = timpstamp;
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
