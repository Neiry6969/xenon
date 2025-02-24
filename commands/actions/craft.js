const {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuOptionBuilder,
    EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const { SlashCommandBuilder } = require("@discordjs/builders");

const InventoryModel = require("../../models/inventorySchema");
const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addItem,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown, setProcessingLock } = require("../../utils/mainfunctions");

function ifhasamountitem(reqm, hasa) {
    if (hasa >= reqm) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("craft")
        .setDescription("Craft craftable items."),

    cdmsg: "You were already at your crafting table, stop trying to break me!",
    cooldown: 10,
    async execute(interaction, client, theme) {
        const allItems = await fetchAllitemsData();

        const params = {
            userId: interaction.user.id,
        };

        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        const craft_msg_embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setThumbnail(
                "https://media.discordapp.net/attachments/965028200390475858/992588652465111120/image-removebg-preview_17.png"
            )
            .setTitle("Crafting Table");

        try {
            const craftingtable_map = allItems
                .map((v) => {
                    const ifcraftabe =
                        !!v.craftitems.length > 0 || v.crafttools.length > 0;

                    if (ifcraftabe === true) {
                        return `${v.icon} **${v.name}**\nItem ID: \`${v.item}\``;
                    } else {
                        return;
                    }
                })
                .filter(Boolean);
            const craftingtable_mapData = allItems
                .map((v) => {
                    const ifcraftabe =
                        !!v.craftitems.length > 0 || v.crafttools.length > 0;

                    if (ifcraftabe === true) {
                        return v;
                    } else {
                        return;
                    }
                })
                .filter(Boolean);

            const craftlength = craftingtable_map.length;
            const itemsperpage = 3;

            let lastpage;
            if (craftlength % itemsperpage > 0) {
                lastpage = Math.floor(craftlength / itemsperpage) + 1;
            } else {
                lastpage = craftlength / itemsperpage;
            }

            let page = 1;
            let display_start = (page - 1) * itemsperpage;
            let display_end = page * itemsperpage;

            let pageslice = craftingtable_mapData.slice(
                display_start,
                display_end
            );
            let mappedCraftOptions = pageslice.map((v) => {
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === v.item
                );
                return {
                    label: item.name,
                    value: item.item,
                    emoji: item.icon,
                };
            });

            let pagebutton = new ButtonBuilder()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();
            let leftfarbutton = new ButtonBuilder()
                .setCustomId("leftfar")
                .setLabel("<<")
                .setStyle("PRIMARY")
                .setDisabled();

            let leftbutton = new ButtonBuilder()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightfarbutton = new ButtonBuilder()
                .setCustomId("rightfar")
                .setLabel(">>")
                .setStyle("PRIMARY");

            let rightbutton = new ButtonBuilder()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY");
            let craftmenu = new StringSelectMenuOptionBuilder()
                .setCustomId("dropmenu")
                .setMinValues(0)
                .setMaxValues(1)
                .setPlaceholder("Select an item to craft")
                .addOptions(mappedCraftOptions);

            let endinteractionbutton = new ButtonBuilder()
                .setCustomId("endinteraction")
                .setLabel("End Interaction")
                .setStyle("SECONDARY");

            let backbutton = new ButtonBuilder()
                .setCustomId("backbutton")
                .setLabel("Back")
                .setStyle("SECONDARY");
            let minusbutton = new ButtonBuilder()
                .setCustomId("minusbutton")
                .setLabel("-")
                .setStyle("SUCCESS");
            let addbutton = new ButtonBuilder()
                .setCustomId("addbutton")
                .setLabel("+")
                .setStyle("SUCCESS");
            let setmaxbutton = new ButtonBuilder()
                .setCustomId("setmaxbutton")
                .setLabel("Set Max")
                .setStyle("SUCCESS");
            let sethalfbutton = new ButtonBuilder()
                .setCustomId("sethalfbutton")
                .setLabel("Set Half")
                .setStyle("SUCCESS");
            let setminbutton = new ButtonBuilder()
                .setCustomId("setminbutton")
                .setLabel("Set Min")
                .setStyle("SUCCESS");
            let craftbutton = new ButtonBuilder()
                .setCustomId("craftbutton")
                .setLabel("Craft Item")
                .setStyle("PRIMARY");

            let row = new ActionRowBuilder().addComponents([
                leftfarbutton,
                leftbutton,
                pagebutton,
                rightbutton,
                rightfarbutton,
            ]);
            let row2 = new ActionRowBuilder().addComponents([craftmenu]);
            let row3 = new ActionRowBuilder().addComponents([
                endinteractionbutton,
            ]);

            craft_msg_embed.setDescription(
                `${craftingtable_map
                    .slice(display_start, display_end)
                    .join("\n\n")}`
            );

            await interaction.reply({
                embeds: [craft_msg_embed],
                components: [row2, row, row3],
            });
            const craft_msg = await interaction.fetchReply();

            const collector = craft_msg.createMessageComponentCollector({
                idle: 30 * 1000,
            });

            let craftcounter;
            let crafttools;
            let craftitems;
            let item;
            let missingitems = false;
            let maxcraftamount;
            let halfcraftamount;

            setProcessingLock(interaction.user.id, true);
            collector.on("collect", async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({
                        content: "This is not for you.",
                        ephemeral: true,
                    });
                }

                i.deferUpdate();
                if (i.customId === "endinteraction") {
                    setProcessingLock(interaction.user.id, false);

                    craft_msg.components[0].components.forEach((c) => {
                        c.setDisabled();
                    });
                    craft_msg.components[1].components.forEach((c) => {
                        c.setDisabled();
                    });

                    craft_msg.components[2].components.forEach((c) => {
                        c.setDisabled();
                    });

                    return craft_msg.edit({
                        components: craft_msg.components,
                    });
                } else if (i.customId === "backbutton") {
                    craftcounter = 0;
                    crafttools = null;
                    craftitems = null;
                    item = null;
                    missingitems = false;
                    maxcraftamount = null;
                    halfcraftamount = null;

                    row.setComponents([
                        leftfarbutton,
                        leftbutton,
                        pagebutton,
                        rightbutton,
                        rightfarbutton,
                    ]);
                    row2.setComponents(craftmenu);
                    row3.setComponents(endinteractionbutton);

                    craft_msg_embed
                        .setColor(theme.embed.color)
                        .setDescription(
                            `${craftingtable_map
                                .slice(display_start, display_end)
                                .join("\n\n")}`
                        );

                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "right") {
                    page = page + 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    pageslice = craftingtable_mapData.slice(
                        display_start,
                        display_end
                    );
                    mappedCraftOptions = pageslice.map((v) => {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === v.item
                        );
                        return {
                            label: item.name,
                            value: item.item,
                            emoji: item.icon,
                        };
                    });

                    craft_msg_embed.setDescription(
                        `${craftingtable_map
                            .slice(display_start, display_end)
                            .join("\n\n")}`
                    );
                    craftmenu.setOptions(mappedCraftOptions);

                    if (page === lastpage) {
                        leftbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightbutton.setDisabled();
                        rightfarbutton.setDisabled();
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    }

                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "rightfar") {
                    page = lastpage;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    pageslice = craftingtable_mapData.slice(
                        display_start,
                        display_end
                    );
                    mappedCraftOptions = pageslice.map((v) => {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === v.item
                        );
                        return {
                            label: item.name,
                            value: item.item,
                            emoji: item.icon,
                        };
                    });

                    craft_msg_embed.setDescription(
                        `${craftingtable_map
                            .slice(display_start, display_end)
                            .join("\n\n")}`
                    );
                    craftmenu.setOptions(mappedCraftOptions);

                    if (page === lastpage) {
                        leftbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightbutton.setDisabled();
                        rightfarbutton.setDisabled();
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    }
                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "left") {
                    page = page - 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    pageslice = craftingtable_mapData.slice(
                        display_start,
                        display_end
                    );
                    mappedCraftOptions = pageslice.map((v) => {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === v.item
                        );
                        return {
                            label: item.name,
                            value: item.item,
                            emoji: item.icon,
                        };
                    });

                    craft_msg_embed.setDescription(
                        `${craftingtable_map
                            .slice(display_start, display_end)
                            .join("\n\n")}`
                    );
                    craftmenu.setOptions(mappedCraftOptions);

                    if (page === 1) {
                        leftbutton.setDisabled();
                        leftfarbutton.setDisabled();
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    }
                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "leftfar") {
                    page = 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    pageslice = craftingtable_mapData.slice(
                        display_start,
                        display_end
                    );
                    mappedCraftOptions = pageslice.map((v) => {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === v.item
                        );
                        return {
                            label: item.name,
                            value: item.item,
                            emoji: item.icon,
                        };
                    });

                    craft_msg_embed.setDescription(
                        `${craftingtable_map
                            .slice(display_start, display_end)
                            .join("\n\n")}`
                    );
                    craftmenu.setOptions(mappedCraftOptions);

                    if (page === 1) {
                        leftbutton.setDisabled();
                        leftfarbutton.setDisabled();
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    }
                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "dropmenu") {
                    craftcounter = 1;
                    item = pageslice.find(
                        (val) => val.item.toLowerCase() === i.values[0]
                    );
                    craftbutton.setEmoji(item.icon);
                    row2.setComponents([craftbutton, addbutton, minusbutton]);
                    row.setComponents([
                        setminbutton,
                        sethalfbutton,
                        setmaxbutton,
                    ]);
                    row3.setComponents([endinteractionbutton, backbutton]);

                    if (item.crafttools) {
                        crafttools = item.crafttools
                            .map((value) => {
                                const toolitem = allItems.find(
                                    ({ item }) => item === value.i
                                );
                                let hasamount =
                                    inventoryData.inventory[toolitem.item];
                                if (!inventoryData.inventory[toolitem.item]) {
                                    hasamount = 0;
                                }
                                if (
                                    ifhasamountitem(value.q, hasamount) ===
                                    false
                                ) {
                                    missingitems = true;
                                }
                                let message = `\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\` ${
                                    toolitem.icon
                                } \`${toolitem.item}\``;
                                if (
                                    ifhasamountitem(value.q, hasamount) === true
                                ) {
                                    message = `[\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
                                        toolitem.icon
                                    } \`${toolitem.item}\``;
                                }
                                return message;
                            })
                            .join("\n");
                    }
                    if (item.craftitems) {
                        craftitems = item.craftitems
                            .map((value) => {
                                const craftitem = allItems.find(
                                    ({ item }) => item === value.i
                                );
                                let craftitemamount_counter =
                                    value.q * craftcounter;

                                let hasamount =
                                    inventoryData.inventory[craftitem.item];
                                if (!inventoryData.inventory[craftitem.item]) {
                                    hasamount = 0;
                                }
                                if (
                                    ifhasamountitem(value.q, hasamount) ===
                                    false
                                ) {
                                    craftitemamount_counter = 0;

                                    missingitems = true;
                                }

                                let message = `\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\` ${
                                    craftitem.icon
                                } \`${craftitem.item}\``;
                                if (
                                    ifhasamountitem(value.q, hasamount) === true
                                ) {
                                    message = `[\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
                                        craftitem.icon
                                    } \`${
                                        craftitem.item
                                    }\` (\`- ${craftitemamount_counter.toLocaleString()}\`)`;
                                }
                                return message;
                            })
                            .join("\n");
                    }

                    const craftitemamountmap = item.craftitems.map((value) => {
                        const craftitem = allItems.find(
                            ({ item }) => item === value.i
                        );
                        return Math.floor(
                            inventoryData.inventory[craftitem.item] / value.q
                        );
                    });

                    maxcraftamount = Math.min(...craftitemamountmap);

                    if (isNaN(maxcraftamount)) {
                        maxcraftamount = 0;
                    }
                    halfcraftamount = Math.floor(maxcraftamount / 2);
                    setmaxbutton.setLabel(
                        `Set Max (${maxcraftamount.toLocaleString()})`
                    );
                    setminbutton.setLabel(`Set Min (1)`);
                    sethalfbutton.setLabel(
                        `Set Half (${halfcraftamount.toLocaleString()})`
                    );

                    let displaytext = `**Craft Counter:** \`${craftcounter.toLocaleString()}\`\nMax: \`${maxcraftamount.toLocaleString()}\`\n\n${
                        item.icon
                    } **${item.name}**\nID: \`${
                        item.item
                    }\`\n\n**Craft Tools:**\n${crafttools}\n\n**Craft Items:**\n${craftitems}`;

                    if (missingitems === true) {
                        craftcounter = 0;
                        row2.components.forEach((c) => {
                            c.setDisabled();
                        });
                        row.components.forEach((c) => {
                            c.setDisabled();
                        });
                        displaytext =
                            displaytext +
                            `\n\n\`\`\`You do not meet the requirements to craft even one of this item\`\`\``;
                        craft_msg_embed.setColor("#ff8f87");
                    } else if (maxcraftamount === 1) {
                        minusbutton.setDisabled();
                        addbutton.setDisabled();
                        row.components.forEach((c) => {
                            c.setDisabled();
                        });
                    } else {
                        row2.components.forEach((c) => {
                            c.setDisabled(false);
                        });
                        row.components.forEach((c) => {
                            c.setDisabled(false);
                        });
                    }

                    if (craftcounter <= 1) {
                        minusbutton.setDisabled();
                    } else {
                        minusbutton.setDisabled(false);
                    }

                    craft_msg_embed.setDescription(displaytext);

                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "addbutton") {
                    craftcounter = craftcounter + 1;

                    craftitems = item.craftitems
                        .map((value) => {
                            const craftitem = allItems.find(
                                ({ item }) => item === value.i
                            );
                            let craftitemamount_counter =
                                value.q * craftcounter;

                            let hasamount =
                                inventoryData.inventory[craftitem.item];
                            if (!inventoryData.inventory[craftitem.item]) {
                                hasamount = 0;
                            }
                            if (ifhasamountitem(value.q, hasamount) === false) {
                                craftitemamount_counter = 0;

                                missingitems = true;
                            }

                            let message = `\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\` ${
                                craftitem.icon
                            } \`${craftitem.item}\``;
                            if (ifhasamountitem(value.q, hasamount) === true) {
                                message = `[\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
                                    craftitem.icon
                                } \`${
                                    craftitem.item
                                }\` (\`- ${craftitemamount_counter.toLocaleString()}\`)`;
                            }
                            return message;
                        })
                        .join("\n");

                    if (craftcounter === maxcraftamount) {
                        addbutton.setDisabled();
                        setmaxbutton.setDisabled();
                    } else {
                        addbutton.setDisabled(false);
                        setmaxbutton.setDisabled(false);
                    }

                    if (craftcounter === halfcraftamount) {
                        sethalfbutton.setDisabled();
                    } else {
                        sethalfbutton.setDisabled(false);
                    }

                    if (craftcounter <= 1) {
                        minusbutton.setDisabled();
                        setminbutton.setDisabled();
                    } else {
                        minusbutton.setDisabled(false);
                        setminbutton.setDisabled(false);
                    }

                    let displaytext = `**Craft Counter:** \`${craftcounter.toLocaleString()}\`\nMax: \`${maxcraftamount.toLocaleString()}\`\n\n${
                        item.icon
                    } **${item.name}**\nID: \`${
                        item.item
                    }\`\n\n**Craft Tools:**\n${crafttools}\n\n**Craft Items:**\n${craftitems}`;
                    craft_msg_embed.setDescription(displaytext);

                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "minusbutton") {
                    craftcounter = craftcounter - 1;

                    craftitems = item.craftitems
                        .map((value) => {
                            const craftitem = allItems.find(
                                ({ item }) => item === value.i
                            );
                            let craftitemamount_counter =
                                value.q * craftcounter;

                            let hasamount =
                                inventoryData.inventory[craftitem.item];
                            if (!inventoryData.inventory[craftitem.item]) {
                                hasamount = 0;
                            }
                            if (ifhasamountitem(value.q, hasamount) === false) {
                                craftitemamount_counter = 0;

                                missingitems = true;
                            }

                            let message = `\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\` ${
                                craftitem.icon
                            } \`${craftitem.item}\``;
                            if (ifhasamountitem(value.q, hasamount) === true) {
                                message = `[\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
                                    craftitem.icon
                                } \`${
                                    craftitem.item
                                }\` (\`- ${craftitemamount_counter.toLocaleString()}\`)`;
                            }
                            return message;
                        })
                        .join("\n");

                    if (craftcounter <= 1) {
                        minusbutton.setDisabled();
                        setminbutton.setDisabled();
                    } else {
                        minusbutton.setDisabled(false);
                        setminbutton.setDisabled(false);
                    }

                    if (craftcounter === maxcraftamount) {
                        addbutton.setDisabled();
                        setmaxbutton.setDisabled();
                    } else {
                        addbutton.setDisabled(false);
                        setmaxbutton.setDisabled(false);
                    }

                    if (craftcounter === halfcraftamount) {
                        sethalfbutton.setDisabled();
                    } else {
                        sethalfbutton.setDisabled(false);
                    }

                    let displaytext = `**Craft Counter:** \`${craftcounter.toLocaleString()}\`\nMax: \`${maxcraftamount.toLocaleString()}\`\n\n${
                        item.icon
                    } **${item.name}**\nID: \`${
                        item.item
                    }\`\n\n**Craft Tools:**\n${crafttools}\n\n**Craft Items:**\n${craftitems}`;
                    craft_msg_embed.setDescription(displaytext);

                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "setmaxbutton") {
                    craftcounter = maxcraftamount;

                    craftitems = item.craftitems
                        .map((value) => {
                            const craftitem = allItems.find(
                                ({ item }) => item === value.i
                            );
                            let craftitemamount_counter =
                                value.q * craftcounter;

                            let hasamount =
                                inventoryData.inventory[craftitem.item];
                            if (!inventoryData.inventory[craftitem.item]) {
                                hasamount = 0;
                            }
                            if (ifhasamountitem(value.q, hasamount) === false) {
                                craftitemamount_counter = 0;

                                missingitems = true;
                            }

                            let message = `\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\` ${
                                craftitem.icon
                            } \`${craftitem.item}\``;
                            if (ifhasamountitem(value.q, hasamount) === true) {
                                message = `[\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
                                    craftitem.icon
                                } \`${
                                    craftitem.item
                                }\` (\`- ${craftitemamount_counter.toLocaleString()}\`)`;
                            }
                            return message;
                        })
                        .join("\n");

                    if (craftcounter <= 1) {
                        minusbutton.setDisabled();
                        setminbutton.setDisabled();
                    } else {
                        minusbutton.setDisabled(false);
                        setminbutton.setDisabled(false);
                    }

                    if (craftcounter === maxcraftamount) {
                        addbutton.setDisabled();
                        setmaxbutton.setDisabled();
                    } else {
                        addbutton.setDisabled(false);
                        setmaxbutton.setDisabled(false);
                    }

                    if (craftcounter === halfcraftamount) {
                        sethalfbutton.setDisabled();
                    } else {
                        sethalfbutton.setDisabled(false);
                    }

                    let displaytext = `**Craft Counter:** \`${craftcounter.toLocaleString()}\`\nMax: \`${maxcraftamount.toLocaleString()}\`\n\n${
                        item.icon
                    } **${item.name}**\nID: \`${
                        item.item
                    }\`\n\n**Craft Tools:**\n${crafttools}\n\n**Craft Items:**\n${craftitems}`;
                    craft_msg_embed.setColor(`#95ff87`);

                    craft_msg_embed.setDescription(displaytext);

                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "setminbutton") {
                    craftcounter = 1;

                    craftitems = item.craftitems
                        .map((value) => {
                            const craftitem = allItems.find(
                                ({ item }) => item === value.i
                            );
                            let craftitemamount_counter =
                                value.q * craftcounter;

                            let hasamount =
                                inventoryData.inventory[craftitem.item];
                            if (!inventoryData.inventory[craftitem.item]) {
                                hasamount = 0;
                            }
                            if (ifhasamountitem(value.q, hasamount) === false) {
                                craftitemamount_counter = 0;

                                missingitems = true;
                            }

                            let message = `\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\` ${
                                craftitem.icon
                            } \`${craftitem.item}\``;
                            if (ifhasamountitem(value.q, hasamount) === true) {
                                message = `[\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
                                    craftitem.icon
                                } \`${
                                    craftitem.item
                                }\` (\`- ${craftitemamount_counter.toLocaleString()}\`)`;
                            }
                            return message;
                        })
                        .join("\n");

                    if (craftcounter <= 1) {
                        minusbutton.setDisabled();
                        setminbutton.setDisabled();
                    } else {
                        minusbutton.setDisabled(false);
                        setminbutton.setDisabled(false);
                    }

                    if (craftcounter === maxcraftamount) {
                        addbutton.setDisabled();
                        setmaxbutton.setDisabled();
                    } else {
                        addbutton.setDisabled(false);
                        setmaxbutton.setDisabled(false);
                    }

                    if (craftcounter === halfcraftamount) {
                        sethalfbutton.setDisabled();
                    } else {
                        sethalfbutton.setDisabled(false);
                    }

                    let displaytext = `**Craft Counter:** \`${craftcounter.toLocaleString()}\`\nMax: \`${maxcraftamount.toLocaleString()}\`\n\n${
                        item.icon
                    } **${item.name}**\nID: \`${
                        item.item
                    }\`\n\n**Craft Tools:**\n${crafttools}\n\n**Craft Items:**\n${craftitems}`;
                    craft_msg_embed.setColor(`#95ff87`);

                    craft_msg_embed.setDescription(displaytext);

                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "sethalfbutton") {
                    craftcounter = halfcraftamount;

                    craftitems = item.craftitems
                        .map((value) => {
                            const craftitem = allItems.find(
                                ({ item }) => item === value.i
                            );
                            let craftitemamount_counter =
                                value.q * craftcounter;

                            let hasamount =
                                inventoryData.inventory[craftitem.item];
                            if (!inventoryData.inventory[craftitem.item]) {
                                hasamount = 0;
                            }
                            if (ifhasamountitem(value.q, hasamount) === false) {
                                craftitemamount_counter = 0;

                                missingitems = true;
                            }

                            let message = `\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\` ${
                                craftitem.icon
                            } \`${craftitem.item}\``;
                            if (ifhasamountitem(value.q, hasamount) === true) {
                                message = `[\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
                                    craftitem.icon
                                } \`${
                                    craftitem.item
                                }\` (\`- ${craftitemamount_counter.toLocaleString()}\`)`;
                            }
                            return message;
                        })
                        .join("\n");

                    if (craftcounter <= 1) {
                        minusbutton.setDisabled();
                        setminbutton.setDisabled();
                    } else {
                        minusbutton.setDisabled(false);
                        setminbutton.setDisabled(false);
                    }

                    if (craftcounter === maxcraftamount) {
                        addbutton.setDisabled();
                        setmaxbutton.setDisabled();
                    } else {
                        addbutton.setDisabled(false);
                        setmaxbutton.setDisabled(false);
                    }

                    if (craftcounter === halfcraftamount) {
                        sethalfbutton.setDisabled();
                    } else {
                        sethalfbutton.setDisabled(false);
                    }

                    let displaytext = `**Craft Counter:** \`${craftcounter.toLocaleString()}\`\nMax: \`${maxcraftamount.toLocaleString()}\`\n\n${
                        item.icon
                    } **${item.name}**\nID: \`${
                        item.item
                    }\`\n\n**Craft Tools:**\n${crafttools}\n\n**Craft Items:**\n${craftitems}`;
                    craft_msg_embed.setColor(`#95ff87`);

                    craft_msg_embed.setDescription(displaytext);

                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (i.customId === "craftbutton") {
                    setProcessingLock(interaction.user.id, false);

                    craftitems = item.craftitems
                        .map((value) => {
                            const craftitem = allItems.find(
                                ({ item }) => item === value.i
                            );
                            let craftitemamount_counter =
                                value.q * craftcounter;

                            let hasamount =
                                inventoryData.inventory[craftitem.item];
                            if (!inventoryData.inventory[craftitem.item]) {
                                hasamount = 0;
                            }
                            if (ifhasamountitem(value.q, hasamount) === false) {
                                craftitemamount_counter = 0;

                                missingitems = true;
                            }

                            const amountleft =
                                inventoryData.inventory[craftitem.item] -
                                craftcounter * value.q;
                            inventoryData.inventory[craftitem.item] =
                                amountleft;

                            let message = `\`${amountleft.toLocaleString()}/${value.q.toLocaleString()}\` ${
                                craftitem.icon
                            } \`${craftitem.item}\``;
                            if (ifhasamountitem(value.q, amountleft) === true) {
                                message = `[\`${amountleft.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
                                    craftitem.icon
                                } \`${
                                    craftitem.item
                                }\` (\`- ${craftitemamount_counter.toLocaleString()}\`)`;
                            }
                            return message;
                        })
                        .join("\n");

                    if (craftcounter <= 1) {
                        minusbutton.setDisabled();
                        setminbutton.setDisabled();
                    } else {
                        minusbutton.setDisabled(false);
                        setminbutton.setDisabled(false);
                    }

                    if (craftcounter === maxcraftamount) {
                        addbutton.setDisabled();
                        setmaxbutton.setDisabled();
                    } else {
                        addbutton.setDisabled(false);
                        setmaxbutton.setDisabled(false);
                    }

                    if (craftcounter === halfcraftamount) {
                        sethalfbutton.setDisabled();
                    } else {
                        sethalfbutton.setDisabled(false);
                    }

                    let displaytext = `**Craft Counter:** \`${craftcounter.toLocaleString()}\`\nMax: \`${maxcraftamount.toLocaleString()}\`\n\n${
                        item.icon
                    } **${item.name}**\nID: \`${
                        item.item
                    }\`\n\n**Craft Tools:**\n${crafttools}\n\n**Craft Items:**\n${craftitems}\n\n\`\`\`fix\n⚒️ Craft was successful!\n\nItem: ${
                        item.item
                    }\nQuantity: ${craftcounter.toLocaleString()}\`\`\``;
                    craft_msg_embed
                        .setColor("#95ff87")
                        .setDescription(displaytext);

                    craft_msg.components[0].components.forEach((c) => {
                        c.setDisabled();
                    });
                    craft_msg.components[1].components.forEach((c) => {
                        c.setDisabled();
                    });
                    craft_msg.components[2].components.forEach((c) => {
                        c.setDisabled();
                    });

                    const hasItem = Object.keys(
                        inventoryData.inventory
                    ).includes(item.item);
                    if (!hasItem) {
                        inventoryData.inventory[item.item] = craftcounter;
                    } else {
                        inventoryData.inventory[item.item] =
                            inventoryData.inventory[item.item] + craftcounter;
                    }

                    await InventoryModel.findOneAndUpdate(
                        params,
                        inventoryData
                    );

                    return craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: craft_msg.components,
                    });
                }
            });

            collector.on("end", (collected) => {
                setProcessingLock(interaction.user.id, false);

                craft_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                craft_msg.components[1].components.forEach((c) => {
                    c.setDisabled();
                });
                craft_msg.components[2].components.forEach((c) => {
                    c.setDisabled();
                });

                return craft_msg.edit({
                    components: craft_msg.components,
                });
            });
        } catch (error) {
            console.log(error);
        }

        return setCooldown(interaction, "craft", 10, economyData);
    },
};
