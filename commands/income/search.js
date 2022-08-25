const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    fetchInventoryData,
    fetchEconomyData,
    addCoins,
    addItem,
    addexperiencepoints,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const SearchModel = require("../../models/searchSchema");

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function itemtruefalse(number) {
    const random = Math.floor(Math.random() * 10000);
    if (random <= number) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search some place for coins."),
    cooldown: 30,
    cdmsg: "At that moment, you didn't know where to search.",
    async execute(interaction, client, theme) {
        let endinteraction = false;
        const search_data = await SearchModel.find();
        const allItems = await fetchAllitemsData();
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const economyData = economyData_fetch.data;
        const displayedplaces = getRandom(search_data, 3);

        let display_1 = new MessageButton()
            .setCustomId(displayedplaces[0].place)
            .setLabel(displayedplaces[0].place)
            .setStyle("PRIMARY");

        let display_2 = new MessageButton()
            .setCustomId(displayedplaces[1].place)
            .setLabel(displayedplaces[1].place)
            .setStyle("PRIMARY");

        let display_3 = new MessageButton()
            .setCustomId(displayedplaces[2].place)
            .setLabel(displayedplaces[2].place)
            .setStyle("PRIMARY");

        let row = new MessageActionRow().addComponents(
            display_1,
            display_2,
            display_3
        );

        const search_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Search`)
            .setDescription(
                `**Where do you plan to search?**\n\nPick an option below to start searching that location.\n\`You got 10 seconds to choose!\``
            );

        await interaction.reply({
            embeds: [search_embed],
            components: [row],
        });

        const search_msg = await interaction.fetchReply();
        const collector = await search_msg.createMessageComponentCollector({
            time: 10 * 1000,
        });

        collector.on("collect", async (button) => {
            if (button.user.id != interaction.user.id) {
                return button.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            button.deferUpdate();

            const placesearched = button.customId;
            endinteraction = true;
            let item;
            const placesearched_data = search_data.find(
                (val) => val.place.toLowerCase() === placesearched
            );
            const coins =
                Math.floor(Math.random() * placesearched_data.maxcoins) +
                placesearched_data.mincoins;
            const search_result = placesearched_data.message.replace(
                "COINS",
                coins.toLocaleString()
            );
            search_embed.setDescription(
                `**${interaction.user.username} searched ${placesearched_data.place}**\n\n${search_result}`
            );

            if (placesearched_data.items.length > 0) {
                if (itemtruefalse(placesearched_data.itempecrent) === true) {
                    const selecteditem =
                        placesearched_data.items[
                            Math.floor(
                                Math.random() * placesearched_data.items.length
                            )
                        ];
                    const percent = (
                        placesearched_data.itempecrent / 100
                    ).toFixed(2);
                    item = allItems.find(
                        (val) => val.item.toLowerCase() === selecteditem
                    );

                    search_embed.setDescription(
                        `**${interaction.user.username} searched ${placesearched_data.place}**\n\n${search_result}\nYou also found \`1\` ${item.icon} \`${item.item}\`\n\`${percent}%\` chance of happening`
                    );
                }
            }

            search_msg.components[0].components.forEach((c) => {
                c.setDisabled().setStyle("SECONDARY");
                if (c.customId === button.customId) {
                    c.setStyle("PRIMARY");
                }
            });
            search_msg.edit({
                embeds: [search_embed],
                components: search_msg.components,
            });
            await addCoins(interaction.user.id, coins);
            if (item) {
                await addItem(interaction.user.id, item.item, 1);
            }
        });

        collector.on("end", async (collected) => {
            if (endinteraction === true) {
                return;
            } else {
                await addexperiencepoints(interaction.user.id, 1, 20);
                search_embed
                    .setColor(`#ff8f87`)
                    .setTitle(`Action Timed Out - Search`)
                    .setDescription(
                        `\`So I am guessing your not going to search anywhere\``
                    );
                search_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                search_msg.edit({
                    embeds: [search_embed],
                    components: search_msg.components,
                });
            }
        });
        return setCooldown(interaction, "search", 30, economyData);
    },
};
