const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    fetchInventoryData,
    fetchEconomyData,
    addItem,
    addexperiencepoints,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");

const lowest = ["bird", "chick", "monkey"];
const lowmid = ["koala", "pig", "sheep"];
const highmid = ["elephant", "parrot"];
const high = ["dragon", "unicorn"];
const highest = ["panda"];

function hunt() {
    const number = Math.floor(Math.random() * 10000);
    if (number <= 5000) {
        return `You weren't able to hunt any animals, welp I guess you should sharpen your aim.`;
    } else if (number <= 8000 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if (number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if (number <= 9950 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if (number <= 9999 && number > 9950) {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    } else if (number >= 10000) {
        const result = Math.floor(Math.random() * highest.length);

        return highest[result];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hunt")
        .setDescription("Go hunting for cute animals."),
    cooldown: 35,
    cdmsg: "All the animals are weary of you so they hid very well.",
    async execute(interaction, client, theme) {
        const allItems = await fetchAllitemsData();
        let error_message;
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        const rifle = allItems.find(
            (val) => val.item.toLowerCase() === "rifle"
        );

        const hunt_embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Hunt ${rifle.icon}`);

        const result = hunt();
        if (
            !inventoryData.inventory[rifle.item] ||
            inventoryData.inventory[rifle.item] === 0
        ) {
            error_message = `You need at least \`1\` ${rifle.icon} ${rifle.item}  to go hunting. Use this command again when you have one.`;
            return errorReply(interaction, error_message);
        } else {
            if (
                result ===
                `You weren't able to hunt any animals, welp I guess you should sharpen your aim.`
            ) {
                hunt_embed.setDescription(`\`${result}\``);
                interaction.reply({ embeds: [hunt_embed] });
            } else {
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === result
                );

                await addItem(interaction.user.id, item.item, 1);
                await addexperiencepoints(interaction.user.id, 1, 20);

                hunt_embed.setDescription(
                    `And that is a wrap, you actually can shoot! Now you got some raw meat to deal with! You got \`${1}\` ${
                        item.icon
                    } \`${item.item}\``
                );
                interaction.reply({ embeds: [hunt_embed] });
            }
        }
        return setCooldown(interaction, "hunt", 35, economyData);
    },
};
