const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    fetchInventoryData,
    fetchEconomyData,
    fetchStatsData,
    removeCoins,
    addCoins,
    addItem,
    removeItem,
    addexperiencepoints,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const { death_handler } = require("../../utils/currencyevents");
const BegModel = require("../../models/begSchema");

function randomizer(precent) {
    const randomnum = Math.floor(Math.random() * 10000);

    if (randomnum < precent) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("beg")
        .setDescription("Beg random strangers for coins."),
    cooldown: 45,
    cdmsg: `There is no one you can beg to right now, making money by begging isn't this easy!`,
    async execute(interaction, client, theme) {
        const beg_data = await BegModel.find();
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const statsData_fetch = await fetchStatsData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;
        const statsData = statsData_fetch.data;
        const searchidexrandom = Math.floor(Math.random() * beg_data.length);
        const beginteraction = beg_data[searchidexrandom];
        const resultsuccess = randomizer(beginteraction.successrate);
        const resultdeath = randomizer(beginteraction.deathrate);

        const embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Beg`);

        if (resultsuccess === true) {
            const maxcoins = beginteraction.maxcoins - beginteraction.mincoins;
            const mincoins = beginteraction.mincoins;
            const coins = Math.floor(Math.random() * maxcoins) + mincoins;
            const beg_result = beginteraction.description.replace(
                "COINS",
                coins.toLocaleString()
            );

            await addCoins(interaction.user.id, coins);
            await addexperiencepoints(interaction.user.id, null, null, 10);

            if (beginteraction.items) {
                const ifgetitems = randomizer(beginteraction.itemsprecent);
                embed.setDescription(
                    `**${beginteraction.title}**` + `\n\n` + beg_result
                );
                if (ifgetitems === true) {
                    const itemnum = Math.floor(
                        Math.random() * beginteraction.items.length
                    );
                    const resultitem = await fetchItemData(
                        beginteraction.items[itemnum]
                    );

                    const beg_resultitem =
                        beginteraction.itemdescription.replace(
                            "ITEM",
                            `${resultitem.icon} \`${resultitem.item}\``
                        );
                    embed.setDescription(
                        `**${beginteraction.title}**` +
                            `\n\n` +
                            `${beg_result}\n${beg_resultitem}`
                    );

                    await addItem(interaction.user.id, resultitem.item, 1);
                }
            }
        } else if (resultdeath === true) {
            embed
                .setDescription(
                    `**${beginteraction.title}**` +
                        `\n\n` +
                        beginteraction.deathdescription
                )
                .setColor("#ff8f87");

            await death_handler(
                client,
                interaction.user.id,
                economyData,
                inventoryData,
                statsData,
                "begging"
            );
        } else {
            embed.setDescription(
                `**${beginteraction.title}**` +
                    `\n\n` +
                    beginteraction.faildescription
            );
        }

        interaction.reply({ embeds: [embed] });
        return setCooldown(interaction, "beg", 45, economyData);
    },
};
