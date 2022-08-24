const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    fetchInventoryData,
    fetchEconomyData,
    addItem,
    addexperiencepoints
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");

const lowest = ["bread", "carrot", "lettuce"];
const lowmid = ["tomato", "corn", "eggplant"];
const highmid = ["potato", "onion", "avocado"];
const high = ["bubbletea"];

function harvest() {
    const number = Math.floor(Math.random() * 10000);
    if (number <= 5000) {
        return `You weren't able to harvest anything.`;
    } else if (number <= 8000 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if (number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if (number <= 9950 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if (number > 9950) {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("harvest")
        .setDescription("Harvest crops for your inventory."),
    cooldown: 35,
    cdmsg: "None of your crops grew.",
    async execute(interaction, client, theme) {
        const allItems = await fetchAllitemsData();
        let error_message;
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        const hoe = allItems.find((val) => val.item.toLowerCase() === "hoe");

        const harvest_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Harvest ${hoe.icon}`);

        const result = harvest();
        if (
            !inventoryData.inventory[hoe.item] ||
            inventoryData.inventory[hoe.item] === 0
        ) {
            error_message = `You need at least \`1\` ${hoe.icon} ${hoe.item}  to go harvesting. Use this command again when you have one.`;
            return errorReply(interaction, error_message);
        } else {
            if (result === `You weren't able to harvest anything.`) {
                harvest_embed.setDescription(`\`${result}\``);
                interaction.reply({ embeds: [harvest_embed] });
            } else {
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === result
                );

                await addItem(interaction.user.id, item.item, 1);
                await addexperiencepoints(interaction.user.id, 1, 20)


                harvest_embed.setDescription(
                    `Oh look something actually grew! Your a farmer now! You got \`${1}\` ${
                        item.icon
                    } \`${item.item}\``
                );
                interaction.reply({ embeds: [harvest_embed] });
            }
        }
        return setCooldown(interaction, "harvest", 35, economyData);
    },
};
