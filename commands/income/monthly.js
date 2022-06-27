const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");

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
        .setName("monthly")
        .setDescription("Collect your monthly rewards every month."),
    cooldown: 2678400,
    cdmsg: "You already collected your monthly rewards this month.",
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
        const monthly_amount = 10000000;

        const totalamount = monthly_amount + userData.wallet;
        userData.wallet = totalamount;
        userData.bank.expbankspace =
            userData.bank.expbankspace + Math.floor(Math.random() * 69);
        await economyModel.findOneAndUpdate(params, userData);

        const embed = {
            color: "RANDOM",
            title: `Here, have your monthly rewards`,
            description: `**Monthly coins:** \`❀ ${monthly_amount.toLocaleString()}\`\n**User:** \`${
                interaction.user.username
            }\` [<@${
                interaction.user.id
            }>]\n\n**Your next monthly can be collected in:**\n\n\`31d 0h 0m 0s\``,
            timestamp: new Date(),
        };

        let cooldown = 2678400;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].monthly = timpstamp;
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
