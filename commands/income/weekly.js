const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");

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
        .setName("weekly")
        .setDescription("Collect your weekly rewards every week."),
    cooldown: 604800,
    cdmsg: "You already collected your weekly rewards this week.",
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData
    ) {
        const params = {
            userId: interaction.user.id,
        };
        const weekly_amount = 1000000;

        const totalamount = weekly_amount + userData.wallet;
        userData.wallet = totalamount;
        userData.bank.expbankspace =
            userData.bank.expbankspace + Math.floor(Math.random() * 69);
        await economyModel.findOneAndUpdate(params, userData);

        const embed = {
            color: "RANDOM",
            title: `Here, have your weekly rewards`,
            description: `**Weekly coins:** \`❀ ${weekly_amount.toLocaleString()}\`\n**User:** \`${
                interaction.user.username
            }\` [<@${
                interaction.user.id
            }>]\n\n**Your next weekly can be collected in:**\n\n\`7d 0h 0m 0s\``,
            timestamp: new Date(),
        };

        let cooldown = 604800;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].weekly = timpstamp;
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
    },
};
