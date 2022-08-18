const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    fetchInventoryData,
    fetchEconomyData,
    addItem,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");

const lowest = ["shrimp", "crab", "fish"];
const lowmid = ["lobster", "squid"];
const highmid = ["whale", "dolphin", "shark"];
const high = ["losttrident"];

function fish() {
    const number = Math.floor(Math.random() * 10000);
    if (number <= 6000) {
        return `You weren't able to catch anything.`;
    } else if (number <= 8000 && number > 6000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if (number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if (number <= 9999 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if (number > 9999) {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fish")
        .setDescription("Go fishing for fishies."),
    cooldown: 35,
    cdmsg: "Theres no fish in these waters right now!",
    async execute(interaction) {
        const allItems = await fetchAllitemsData();
        let error_message;
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        const fishingrod = allItems.find(
            (val) => val.item.toLowerCase() === "fishingrod"
        );

        const fish_embed = new MessageEmbed()
            .setColor("#2f3136")
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Fish ${fishingrod.icon}`);

        const result = fish();
        if (
            !inventoryData.inventory[fishingrod.item] ||
            inventoryData.inventory[fishingrod.item] === 0
        ) {
            error_message = `You need at least \`1\` ${fishingrod.icon} ${fishingrod.item}  to go fishing. Use this command again when you have one.`;
            return errorReply(interaction, error_message);
        } else {
            if (result === `You weren't able to catch anything.`) {
                fish_embed.setDescription(`\`${result}\``);
                interaction.reply({ embeds: [fish_embed] });
            } else {
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === result
                );

                await addItem(interaction.user.id, item.item, 1);

                fish_embed.setDescription(
                    `There is something on your hook! You pulled something out of the water! You got \`${1}\` ${
                        item.icon
                    } \`${item.item}\``
                );
                interaction.reply({ embeds: [fish_embed] });
            }
        }
        return setCooldown(interaction, "fish", 35, economyData);
    },
};
