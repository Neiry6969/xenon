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

const lowest = ["worm", "rat", "rock"];
const lowmid = ["snail", "lizard", "chestofwooden"];
const highmid = ["scorpion"];
const high = ["statue", "bronzecrown"];

function dig() {
    const number = Math.floor(Math.random() * 10000);
    if (number <= 5000) {
        return `You weren't able to dig anything, just bad luck.`;
    } else if (number <= 8000 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if (number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if (number <= 9990 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if (number > 9990) {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dig")
        .setDescription("Dig for treasures."),
    cooldown: 35,
    cdmsg: "You are too tired to be digging so much.",
    async execute(interaction, client, theme) {
        const allItems = await fetchAllitemsData();
        let error_message;
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        const shovel = allItems.find(
            (val) => val.item.toLowerCase() === "shovel"
        );

        const dig_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Dig ${shovel.icon}`);

        const result = dig();
        if (
            !inventoryData.inventory[shovel.item] ||
            inventoryData.inventory[shovel.item] === 0
        ) {
            error_message = `You need at least \`1\` ${shovel.icon} ${shovel.item}  to go digging. Use this command again when you have one.`;
            return errorReply(interaction, error_message);
        } else {
            if (result === `You weren't able to dig anything, just bad luck.`) {
                dig_embed.setDescription(`\`${result}\``);
                interaction.reply({ embeds: [dig_embed] });
            } else {
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === result
                );

                await addItem(interaction.user.id, item.item, 1);

                dig_embed.setDescription(
                    `You pulled something out of the ground! You got \`${1}\` ${
                        item.icon
                    } \`${item.item}\``
                );
                interaction.reply({ embeds: [dig_embed] });
            }
        }
        return setCooldown(interaction, "dig", 35, economyData);
    },
};
