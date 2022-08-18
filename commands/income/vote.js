const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const {
    fetchInventoryData,
    fetchEconomyData,
    addCoins,
    addItem,
    fetchUserData,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const searchplaces = require("../../data/search_places");

function time_split(time) {
    if (time < 60) {
        return `${time}s`;
    } else if (time >= 60 && time < 3600) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}m ${seconds}s`;
    } else if (time >= 3600 && time < 86400) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor((time % 3600) % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (time >= 86400) {
        const days = Math.floor(time / 86400);
        const hours = Math.floor((time % 86400) / 3600);
        const minutes = Math.floor(((time % 86400) % 3600) / 60);
        const seconds = Math.floor(((time % 86400) % 3600) % 60);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
        return `${time}s`;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("Vote rewards you can get from voting every 12 hours."),
    cooldown: 3,
    async execute(interaction) {
        const allItems = await fetchAllitemsData();
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const userData_fetch = await fetchUserData(interaction.user.id);
        const userData = userData_fetch.data;
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const economyData = economyData_fetch.data;
        const nowtimestamp = Date.now();

        const topggvoterewards_coins = 50000;
        const topggvoterewards_items = [
            { item: "chestofcommon", quantity: 5 },
            { item: "bankmessage", quantity: 5 },
            { item: "ticketofvoting", quantity: 1 },
        ];
        const topgglastvotedtimestamp = userData.eventcooldowns.vote_topgg;
        const topggvotetimestampready = topgglastvotedtimestamp + 43200000;

        const voterewards_items_map = topggvoterewards_items
            .map((element) => {
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === element.item
                );

                return `\` > \` ${item.icon} \`${
                    item.item
                }\` \`x${element.quantity.toLocaleString()}\``;
            })
            .join("\n");

        const topggbutton = new MessageButton()
            .setLabel("top.gg")
            .setStyle("LINK")
            .setEmoji("<:topgg:995813492424716399>")
            .setURL("https://top.gg/bot/847528987831304192/vote")
            .setDisabled(false);

        const row = new MessageActionRow().addComponents(topggbutton);

        if (topggvotetimestampready > nowtimestamp) {
            const timeleft = topggvotetimestampready - nowtimestamp;
            const formattime = time_split(timeleft / 1000);
            topggbutton.setLabel(formattime).setDisabled();
        }

        const votembed = new MessageEmbed()
            .setColor(`#2f3136`)
            .setTitle("Voting Rewards For Xenon")
            .setDescription(
                `[**top.gg** <:topgg:995813492424716399>](https://top.gg/bot/847528987831304192/vote)\n\` > \` \`❀ ${topggvoterewards_coins.toLocaleString()}\`\n${voterewards_items_map}`
            );

        interaction.reply({ embeds: [votembed], components: [row] });
        return setCooldown(interaction, "weekly", 604800, economyData);
    },
};
