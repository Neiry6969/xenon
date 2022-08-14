const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
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
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData,
        itemData
    ) {
        const allItems = await fetchAllitemsData();

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

        const shop_embed = new MessageEmbed()
            .setColor(`#2f3136`)
            .setTitle(`Xenon Shop™`);

        if (lastpage === 1) {
            let pagebutton = new MessageButton()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();
            let leftfarbutton = new MessageButton()
                .setCustomId("leftfar")
                .setLabel("<<")
                .setStyle("PRIMARY")
                .setDisabled();

            let leftbutton = new MessageButton()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightfarbutton = new MessageButton()
                .setCustomId("rightfar")
                .setLabel(">>")
                .setStyle("PRIMARY");

            let rightbutton = new MessageButton()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY");

            let row = new MessageActionRow().addComponents(
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
            let pagebutton = new MessageButton()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();
            let leftfarbutton = new MessageButton()
                .setCustomId("leftfar")
                .setLabel("<<")
                .setStyle("PRIMARY")
                .setDisabled();

            let leftbutton = new MessageButton()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightfarbutton = new MessageButton()
                .setCustomId("rightfar")
                .setLabel(">>")
                .setStyle("PRIMARY");

            let rightbutton = new MessageButton()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY");

            let row = new MessageActionRow().addComponents(
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
                shop_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                shop_msg.edit({
                    components: shop_msg.components,
                });
            });
        }
    },
};
