const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    fetchStatsData,
} = require("../../utils/currencyfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const { fetchAllitemsData } = require("../../utils/itemfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("See what items are being sold in the xenon shop."),
    cooldown: 5,
    async execute(interaction, client, theme) {
        const allItems = await fetchAllitemsData();
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const inventoryData = inventoryData_fetch.data;

        const shopmaparray = allItems
            .map((value) => {
                if (value.price === "unable to be bought") {
                    return;
                } else {
                    return {
                        price: value.price,
                        icon: value.icon,
                        name: value.name,
                        item: value.item,
                    };
                }
            })
            .filter(Boolean)
            .sort(function (a, b) {
                return a.price - b.price;
            });

        const shopList = shopmaparray
            .map((value) => {
                return `${value.icon} **${
                    value.name
                }**    **───**   \`❀ ${value.price.toLocaleString()}\` (${
                    inventoryData.inventory[value.item]
                        ? inventoryData.inventory[value.item].toLocaleString()
                        : 0
                })\nItem ID: \`${value.item}\``;
            })
            .filter(Boolean);

        const shop = Object.values(shopList).filter(Boolean);
        const shoplength = shop.length;
        const itemsperpage = 6;

        let lastpage;
        if (shoplength % itemsperpage > 0) {
            lastpage = Math.floor(shoplength / itemsperpage) + 1;
        } else {
            lastpage = shoplength / itemsperpage;
        }

        let page = 1;
        let display_start = (page - 1) * itemsperpage;
        let display_end = page * itemsperpage;

        const shop_embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setTitle(`Xenon Shop™`);

        if (lastpage === 1) {
            let pagebutton = new ButtonBuilder()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("Secondary")
                .setDisabled();
            let leftfarbutton = new ButtonBuilder()
                .setCustomId("leftfar")
                .setLabel("<<")
                .setStyle("Primary")
                .setDisabled();

            let leftbutton = new ButtonBuilder()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("Primary")
                .setDisabled();

            let rightfarbutton = new ButtonBuilder()
                .setCustomId("rightfar")
                .setLabel(">>")
                .setStyle("Primary");

            let rightbutton = new ButtonBuilder()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("Primary");

            let row = new ActionRowBuilder().addComponents(
                leftfarbutton,
                leftbutton,
                pagebutton,
                rightbutton,
                rightfarbutton
            );
            shop_embed.setDescription(
                `\`/item\` - View details of an item\n\n${shopList
                    .slice(display_start, display_end)
                    .join("\n\n")}`
            );

            return interaction.reply({
                embeds: [shop_embed],
                components: [row],
            });
        } else {
            let pagebutton = new ButtonBuilder()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("Secondary")
                .setDisabled();
            let leftfarbutton = new ButtonBuilder()
                .setCustomId("leftfar")
                .setLabel("<<")
                .setStyle("Primary")
                .setDisabled();

            let leftbutton = new ButtonBuilder()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("Primary")
                .setDisabled();

            let rightfarbutton = new ButtonBuilder()
                .setCustomId("rightfar")
                .setLabel(">>")
                .setStyle("Primary");

            let rightbutton = new ButtonBuilder()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("Primary");

            let row = new ActionRowBuilder().addComponents(
                leftfarbutton,
                leftbutton,
                pagebutton,
                rightbutton,
                rightfarbutton
            );

            shop_embed.setDescription(
                `\`/item\` - View details of an item\n\n${shopList
                    .slice(display_start, display_end)
                    .join("\n\n")}`
            );

            interaction.reply({
                embeds: [shop_embed],
                components: [row],
            });

            const shop_msg = await interaction.fetchReply();

            const collector = shop_msg.createMessageComponentCollector({
                idle: 20 * 1000,
            });

            collector.on("collect", async (button) => {
                if (button.user.id != interaction.user.id) {
                    return button.reply({
                        content: "This is not for you.",
                        ephemeral: true,
                    });
                }

                button.deferUpdate();

                if (button.customId === "right") {
                    page = page + 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    if (page === lastpage) {
                        leftbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightbutton.setDisabled();
                        rightfarbutton.setDisabled();

                        shop_embed.setDescription(
                            `\`/item\` - View details of an item\n\n${shopList
                                .slice(display_start, display_end)
                                .join("\n\n")}`
                        );

                        await shop_msg.edit({
                            embeds: [shop_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);

                        shop_embed.setDescription(
                            `\`/item\` - View details of an item\n\n${shopList
                                .slice(display_start, display_end)
                                .join("\n\n")}`
                        );
                        await shop_msg.edit({
                            embeds: [shop_embed],
                            components: [row],
                        });
                    }
                } else if (button.customId === "rightfar") {
                    page = lastpage;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    if (page === lastpage) {
                        leftbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightbutton.setDisabled();
                        rightfarbutton.setDisabled();

                        shop_embed.setDescription(
                            `\`/item\` - View details of an item\n\n${shopList
                                .slice(display_start, display_end)
                                .join("\n\n")}`
                        );

                        await shop_msg.edit({
                            embeds: [shop_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);

                        shop_embed.setDescription(
                            `\`/item\` - View details of an item\n\n${shopList
                                .slice(display_start, display_end)
                                .join("\n\n")}`
                        );
                        await shop_msg.edit({
                            embeds: [shop_embed],
                            components: [row],
                        });
                    }
                } else if (button.customId === "left") {
                    page = page - 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    if (page === 1) {
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftbutton.setDisabled();
                        leftfarbutton.setDisabled();

                        shop_embed.setDescription(
                            `\`/item\` - View details of an item\n\n${shopList
                                .slice(display_start, display_end)
                                .join("\n\n")}`
                        );

                        await shop_msg.edit({
                            embeds: [shop_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);

                        shop_embed.setDescription(
                            `\`/item\` - View details of an item\n\n${shopList
                                .slice(display_start, display_end)
                                .join("\n\n")}`
                        );

                        await shop_msg.edit({
                            embeds: [shop_embed],
                            components: [row],
                        });
                    }
                } else if (button.customId === "leftfar") {
                    page = 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    if (page === 1) {
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftbutton.setDisabled();
                        leftfarbutton.setDisabled();

                        shop_embed.setDescription(
                            `\`/item\` - View details of an item\n\n${shopList
                                .slice(display_start, display_end)
                                .join("\n\n")}`
                        );

                        await shop_msg.edit({
                            embeds: [shop_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);

                        shop_embed.setDescription(
                            `\`/item\` - View details of an item\n\n${shopList
                                .slice(display_start, display_end)
                                .join("\n\n")}`
                        );

                        await shop_msg.edit({
                            embeds: [shop_embed],
                            components: [row],
                        });
                    }
                }
            });

            collector.on("end", (collected) => {
                shop_msg.edit({
                    components: [],
                });
            });
        }
    },
};
