const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
} = require("../../utils/currencyfunctions");
const { fetchAllitemsData } = require("../../utils/itemfunctions");
const { setCooldown } = require("../../utils/mainfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Check a user's inventory.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("Specify a user's inventory you want to see");
        }),
    cooldown: 3,
    async execute(interaction, client, theme) {
        const allItems = await fetchAllitemsData();

        const options = {
            user: interaction.options.getUser("user"),
        };

        let user = options.user || interaction.user;

        const inventory_embed = new EmbedBuilder()
            .setTitle(`Inventory`)
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${user.tag}`,
                iconURL: `${user.displayAvatarURL()}`,
            });

        const inventory_fetch = await fetchInventoryData(user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = await fetchEconomyData(user.id);

        if (inventoryData.inventory === {} || !inventoryData.inventory) {
            inventory_embed
                .setDescription(
                    `\`This inventory is empty space, nothing is in it\``
                )
                .setFooter({ text: `Networth: ❀ 0` });
            return interaction.reply({
                embeds: [inventory_embed],
            });
        }

        const mappedData = Object.keys(inventoryData.inventory)
            .sort()
            .map((key) => {
                if (inventoryData.inventory[key] === 0) {
                    return;
                } else {
                    const item = allItems.find(
                        (val) => val.item.toLowerCase() === key
                    );
                    return `${
                        item.icon
                    } \`${key}\` ── \`${inventoryData.inventory[
                        key
                    ].toLocaleString()}\``;
                }
            })
            .filter(Boolean);

        if (mappedData.length === 0) {
            inventory_embed
                .setDescription(
                    `\`This inventory is empty space, nothing is in it\``
                )
                .setFooter({ text: `Networth: ❀ 0` });
            return interaction.reply({
                embeds: [inventory_embed],
            });
            return interaction.reply({ embeds: [inventory_embed] });
        } else {
            const inventory = Object.values(inventoryData.inventory).filter(
                Boolean
            );
            const invlength = inventory.length;
            const itemsperpage = 16;

            let lastpage;
            if (invlength % itemsperpage > 0) {
                lastpage = Math.floor(invlength / itemsperpage) + 1;
            } else {
                lastpage = invlength / itemsperpage;
            }

            let page = 1;
            let display_start = (page - 1) * itemsperpage;
            let display_end = page * itemsperpage;

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
                    .setStyle("Primary")
                    .setDisabled();

                let rightbutton = new ButtonBuilder()
                    .setCustomId("right")
                    .setLabel(">")
                    .setStyle("Primary")
                    .setDisabled();

                let row = new ActionRowBuilder().addComponents(
                    leftfarbutton,
                    leftbutton,
                    pagebutton,
                    rightbutton,
                    rightfarbutton
                );

                inventory_embed
                    .setAuthor({
                        name: `${user.tag}`,
                        iconURL: user.displayAvatarURL(),
                    })
                    .setDescription(
                        `${mappedData
                            .slice(display_start, display_end)
                            .join("\n")}`
                    )
                    .setFooter({
                        text: `Networth: ❀ ${inventory_fetch.networth.toLocaleString()}`,
                    });

                return interaction.reply({
                    embeds: [inventory_embed],
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

                inventory_embed
                    .setAuthor({
                        name: `${user.tag}`,
                        iconURL: user.displayAvatarURL(),
                    })
                    .setDescription(
                        `${mappedData
                            .slice(display_start, display_end)
                            .join("\n")}`
                    )
                    .setFooter({
                        text: `Networth: ❀ ${inventory_fetch.networth.toLocaleString()}`,
                    });

                await interaction.reply({
                    embeds: [inventory_embed],
                    components: [row],
                });

                const inv_msg = await interaction.fetchReply();

                const collector = inv_msg.createMessageComponentCollector({
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

                            inventory_embed.setDescription(
                                `${mappedData
                                    .slice(display_start, display_end)
                                    .join("\n")}`
                            );

                            await inv_msg.edit({
                                embeds: [inventory_embed],
                                components: [row],
                            });
                        } else {
                            leftbutton.setDisabled(false);
                            rightbutton.setDisabled(false);
                            rightfarbutton.setDisabled(false);
                            leftfarbutton.setDisabled(false);

                            inventory_embed.setDescription(
                                `${mappedData
                                    .slice(display_start, display_end)
                                    .join("\n")}`
                            );

                            await inv_msg.edit({
                                embeds: [inventory_embed],
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

                            inventory_embed.setDescription(
                                `${mappedData
                                    .slice(display_start, display_end)
                                    .join("\n")}`
                            );

                            await inv_msg.edit({
                                embeds: [inventory_embed],
                                components: [row],
                            });
                        } else {
                            leftbutton.setDisabled(false);
                            rightbutton.setDisabled(false);
                            rightfarbutton.setDisabled(false);
                            leftfarbutton.setDisabled(false);

                            inventory_embed.setDescription(
                                `${mappedData
                                    .slice(display_start, display_end)
                                    .join("\n")}`
                            );

                            await inv_msg.edit({
                                embeds: [inventory_embed],
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

                            inventory_embed.setDescription(
                                `${mappedData
                                    .slice(display_start, display_end)
                                    .join("\n")}`
                            );

                            await inv_msg.edit({
                                embeds: [inventory_embed],
                                components: [row],
                            });
                        } else {
                            leftbutton.setDisabled(false);
                            rightbutton.setDisabled(false);
                            rightfarbutton.setDisabled(false);
                            leftfarbutton.setDisabled(false);

                            inventory_embed.setDescription(
                                `${mappedData
                                    .slice(display_start, display_end)
                                    .join("\n")}`
                            );

                            await inv_msg.edit({
                                embeds: [inventory_embed],
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

                            inventory_embed.setDescription(
                                `${mappedData
                                    .slice(display_start, display_end)
                                    .join("\n")}`
                            );

                            await inv_msg.edit({
                                embeds: [inventory_embed],
                                components: [row],
                            });
                        } else {
                            leftbutton.setDisabled(false);
                            rightbutton.setDisabled(false);
                            rightfarbutton.setDisabled(false);
                            leftfarbutton.setDisabled(false);

                            inventory_embed.setDescription(
                                `${mappedData
                                    .slice(display_start, display_end)
                                    .join("\n")}`
                            );

                            await inv_msg.edit({
                                embeds: [inventory_embed],
                                components: [row],
                            });
                        }
                    }
                });

                collector.on("end", (collected) => {
                    inv_msg.components[0].components.forEach((c) => {
                        c.setDisabled();
                    });
                    inv_msg.edit({
                        components: inv_msg.components,
                    });
                });
            }
        }

        return setCooldown(interaction, "inventory", 3, economyData.data);
    },
};
