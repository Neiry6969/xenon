const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

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
        .setName("vote")
        .setDescription("Vote rewards you can get from voting every 12 hours."),
    cooldown: 3,
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData,
        itemData
    ) {
        const allItems = itemData;

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
        jsoncooldowns[interaction.user.id].vote = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        const topggvoterewards_coins = 50000;
        const topggvoterewards_items = [{ item: "chestofcommon", quantity: 5 }];

        const voterewards_items_map = topggvoterewards_items.map((element) => {
            const item = allItems.find(
                (val) => val.item.toLowerCase() === element.item
            );

            return `\` > \` ${item.icon} \`${
                item.item
            }\` \`x${element.quantity.toLocaleString()}\``;
        });

        const topggbutton = new MessageButton()
            .setLabel("top.gg")
            .setStyle("LINK")
            .setEmoji("<:topgg:995813492424716399>")
            .setURL("https://top.gg/bot/847528987831304192")
            .setDisabled(false);

        const row = new MessageActionRow().addComponents(topggbutton);

        const votembed = new MessageEmbed()
            .setTitle("Voting Rewards For Xenon")
            .setDescription(
                `[**top.gg** <:topgg:995813492424716399>](https://top.gg/bot/847528987831304192)\n\` > \` \`❀ ${topggvoterewards_coins.toLocaleString()}\`\n${voterewards_items_map}`
            );

        return interaction.reply({ embeds: [votembed], components: [row] });
    },
};
