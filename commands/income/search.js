const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    fetchInventoryData,
    fetchEconomyData,
    addCoins,
    addItem,
    addexperiencepoints
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const searchplaces = require("../../data/search_places");

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
        const allItems = await fetchAllitemsData();
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const economyData = economyData_fetch.data;
        const displayedplaces = getRandom(searchplaces, 3);
        let placesearched;

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

            if (button.customId === displayedplaces[0].place) {
                endinteraction = true;
                placesearched = displayedplaces[0].place;
                const placesearched_items = searchplaces.find(
                    (val) => val.place.toLowerCase() === placesearched
                );
                const coins =
                    Math.floor(Math.random() * placesearched_items.coins) + 500;
                const search_result = placesearched_items.message.replace(
                    "COINS",
                    coins.toLocaleString()
                );

                if (placesearched_items.items) {
                    if (
                        itemtruefalse(placesearched_items.itempecrent) === true
                    ) {
                        const percent = (
                            placesearched_items.itempecrent / 100
                        ).toFixed(2);
                        const item = allItems.find(
                            (val) =>
                                val.item.toLowerCase() ===
                                placesearched_items.items
                        );

                        search_embed.setDescription(
                            `**${interaction.user.username} searched ${placesearched_items.place}**\n\n${search_result}\nYou also found \`1\` ${item.icon}\n\`${percent}%\` chance of happening`
                        );

                        display_1.setDisabled();
                        display_2.setStyle("SECONDARY").setDisabled();
                        display_3.setStyle("SECONDARY").setDisabled();
                        search_msg.edit({
                            embeds: [search_embed],
                            components: [row],
                        });
                        await addCoins(interaction.user.id, coins);
                        await addItem(interaction.user.id, item.item, 1);
                    } else {
                        search_embed.setDescription(
                            `**${interaction.user.username} searched ${placesearched_items.place}**\n\n${search_result}`
                        );
                        display_1.setDisabled();
                        display_2.setStyle("SECONDARY").setDisabled();
                        display_3.setStyle("SECONDARY").setDisabled();
                        search_msg.edit({
                            embeds: [search_embed],
                            components: [row],
                        });
                        await addCoins(interaction.user.id, coins);
                    }
                } else {
                    await addCoins(interaction.user.id, coins);

                    search_embed.setDescription(
                        `**${interaction.user.username} searched ${placesearched_items.place}**\n\n${search_result}`
                    );
                    display_1.setDisabled();
                    display_2.setStyle("SECONDARY").setDisabled();
                    display_3.setStyle("SECONDARY").setDisabled();
                    search_msg.edit({
                        embeds: [search_embed],
                        components: [row],
                    });
                    await addCoins(interaction.user.id, coins);
                }
            } else if (button.customId === displayedplaces[1].place) {
                endinteraction = true;
                placesearched = displayedplaces[1].place;
                const placesearched_items = searchplaces.find(
                    (val) => val.place.toLowerCase() === placesearched
                );

                const coins =
                    Math.floor(Math.random() * placesearched_items.coins) + 500;
                const search_result = placesearched_items.message.replace(
                    "COINS",
                    coins.toLocaleString()
                );

                if (placesearched_items.items) {
                    if (
                        itemtruefalse(placesearched_items.itempecrent) === true
                    ) {
                        const percent = (
                            placesearched_items.itempecrent / 100
                        ).toFixed(2);
                        const item = allItems.find(
                            (val) =>
                                val.item.toLowerCase() ===
                                placesearched_items.items
                        );
                        await addCoins(interaction.user.id, coins);
                        await addItem(interaction.user.id, item.item, 1);

                        search_embed.setDescription(
                            `**${interaction.user.username} searched ${placesearched_items.place}**\n\n${search_result}\nYou also found \`1\` ${item.icon}\n\`${percent}%\` chance of happening`
                        );
                        display_2.setDisabled();
                        display_1.setStyle("SECONDARY").setDisabled();
                        display_3.setStyle("SECONDARY").setDisabled();
                        search_msg.edit({
                            embeds: [search_embed],
                            components: [row],
                        });
                        await addCoins(interaction.user.id, coins);
                        await addItem(interaction.user.id, item.item, 1);
                    } else {
                        search_embed.setDescription(
                            `**${interaction.user.username} searched ${placesearched_items.place}**\n\n${search_result}`
                        );
                        display_2.setDisabled();
                        display_1.setStyle("SECONDARY").setDisabled();
                        display_3.setStyle("SECONDARY").setDisabled();
                        search_msg.edit({
                            embeds: [search_embed],
                            components: [row],
                        });
                        await addCoins(interaction.user.id, coins);
                    }
                } else {
                    search_embed.setDescription(
                        `**${interaction.user.username} searched ${placesearched_items.place}**\n\n${search_result}`
                    );
                    display_2.setDisabled();
                    display_1.setStyle("SECONDARY").setDisabled();
                    display_3.setStyle("SECONDARY").setDisabled();
                    search_msg.edit({
                        embeds: [search_embed],
                        components: [row],
                    });
                    await addCoins(interaction.user.id, coins);
                }
            } else if (button.customId === displayedplaces[2].place) {
                endinteraction = true;
                placesearched = displayedplaces[2].place;
                const placesearched_items = searchplaces.find(
                    (val) => val.place.toLowerCase() === placesearched
                );
                const coins =
                    Math.floor(Math.random() * placesearched_items.coins) + 500;
                const search_result = placesearched_items.message.replace(
                    "COINS",
                    coins.toLocaleString()
                );

                if (placesearched_items.items) {
                    const percent = (
                        placesearched_items.itempecrent / 100
                    ).toFixed(2);
                    if (
                        itemtruefalse(placesearched_items.itempecrent) === true
                    ) {
                        const item = allItems.find(
                            (val) =>
                                val.item.toLowerCase() ===
                                placesearched_items.items
                        );

                        search_embed.setDescription(
                            `**${interaction.user.username} searched ${placesearched_items.place}**\n\n${search_result}\nYou also found \`1\` ${item.icon}\n\`${percent}%\` chance of happening`
                        );
                        display_3.setDisabled();
                        display_1.setStyle("SECONDARY").setDisabled();
                        display_2.setStyle("SECONDARY").setDisabled();
                        search_msg.edit({
                            embeds: [search_embed],
                            components: [row],
                        });
                        await addCoins(interaction.user.id, coins);
                        await addItem(interaction.user.id, item.item, 1);
                    } else {
                        search_embed.setDescription(
                            `**${interaction.user.username} searched ${placesearched_items.place}**\n\n${search_result}`
                        );
                        display_3.setDisabled();
                        display_1.setStyle("SECONDARY").setDisabled();
                        display_2.setStyle("SECONDARY").setDisabled();
                        search_msg.edit({
                            embeds: [search_embed],
                            components: [row],
                        });
                        await addCoins(interaction.user.id, coins);
                    }
                } else {
                    search_embed.setDescription(
                        `**${interaction.user.username} searched ${placesearched_items.place}**\n\n${search_result}`
                    );
                    display_3.setDisabled();
                    display_1.setStyle("SECONDARY").setDisabled();
                    display_2.setStyle("SECONDARY").setDisabled();
                    search_msg.edit({
                        embeds: [search_embed],
                        components: [row],
                    });
                    await addCoins(interaction.user.id, coins);
                }
            }
        });

        collector.on("end", (collected) => {
            if (endinteraction === true) {
                return;
            } else {
                await addexperiencepoints(interaction.user.id, 1, 20)
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
