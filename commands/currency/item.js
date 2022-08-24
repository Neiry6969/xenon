const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const { errorReply } = require("../../utils/errorfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("item")
        .setDescription("View an item.")
        .addStringOption((oi) => {
            return oi
                .setName("item")
                .setDescription("Specify an item you want to view.")
                .setRequired(true);
        }),
    cdmsg: `You can't be checking items so fast, slow it buddy!`,
    cooldown: 5,
    async execute(interaction, client, theme) {
        const options = {
            item: interaction.options.getString("item"),
        };
        let error_message;

        if (options.item.length < 3) {
            error_message = `\`You need give more than just 2 characters for me to find the item\``;
            return errorReply(interaction, error_message);
        }

        const itemData = await fetchItemData(options.item);

        if (!itemData) {
            error_message = `\`That is not an existing item\``;
            return errorReply(interaction, error_message);
        }

        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = await fetchEconomyData(interaction.user.id);
        const allItems = await fetchAllitemsData();

        function ifhasamountitem(reqm, hasa) {
            if (hasa >= reqm) {
                return true;
            } else {
                return false;
            }
        }

        let crafttools;
        if (itemData.crafttools) {
            crafttools = itemData.crafttools
                .map((value) => {
                    const toolitem = allItems.find(
                        ({ item }) => item === value.i
                    );

                    const ownedquantity =
                        inventoryData.inventory[toolitem.item] || 0;

                    return `${
                        ifhasamountitem(value.q, ownedquantity) === true
                            ? `[\`${value.q.toLocaleString()}\`](https://www.google.com/)`
                            : `\`${value.q.toLocaleString()}\``
                    } ${toolitem.icon} \`${toolitem.item}\``;
                })
                .join("\n");
        }

        let craftitems;
        if (itemData.craftitems) {
            craftitems = itemData.craftitems
                .map((value) => {
                    const craftitem = allItems.find(
                        ({ item }) => item === value.i
                    );

                    const ownedquantity =
                        inventoryData.inventory[craftitem.item] || 0;

                    return `${
                        ifhasamountitem(value.q, ownedquantity) === true
                            ? `[\`${value.q.toLocaleString()}\`](https://www.google.com/)`
                            : `\`${value.q.toLocaleString()}\``
                    } ${craftitem.icon} \`${craftitem.item}\``;
                })
                .join("\n");
        }

        let lootboxitems;
        if (itemData.lootbox) {
            lootboxitems = itemData.lootbox
                .map((value) => {
                    const lootboxitem = allItems.find(
                        ({ item }) => item === value.i
                    );

                    return `${lootboxitem.icon} \`${
                        lootboxitem.item
                    }\` [\`${value.minq.toLocaleString()} - ${value.maxq.toLocaleString()}\`]`;
                })
                .join("\n");
        }

        let drophistory;
        if (itemData.drophistory) {
            drophistory = itemData.drophistory
                .map((value) => {
                    return `<a:drop:992514722232541207> \`${value.amountbought.toLocaleString()}/${value.maxdrop.toLocaleString()}\` on: <t:${
                        value.dropstart
                    }:d> to: <t:${value.dropend}:d>`;
                })
                .join("\n");
        }

        const embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setTitle(
                `**${itemData.icon} ${itemData.name}** (${
                    inventoryData.inventory[itemData.item]
                        ? inventoryData.inventory[
                              itemData.item
                          ].toLocaleString()
                        : "0"
                })`
            )
            .setThumbnail(itemData.imageUrl)
            .setDescription(`> ${itemData.description}`)
            .addFields(
                {
                    name: "ID",
                    value: `\`${itemData.item}\``,
                    inline: true,
                },
                {
                    name: "Rarity",
                    value: `\`${itemData.rarity}\``,
                    inline: true,
                },
                {
                    name: "Type",
                    value: `\`${itemData.type}\``,
                    inline: true,
                },
                {
                    name: "_ _",
                    value: `**BUY:** \`❀ ${itemData.price?.toLocaleString()}\`\n**SELL:** \`❀ ${itemData.sell?.toLocaleString()}\`\n**TRADE:** \`❀ ${itemData.trade?.toLocaleString()}\``,
                }
            );

        let interactioncontents = { embeds: [embed] };

        if (craftitems) {
            embed.addFields({
                name: "Required Caft Tools",
                value: `${crafttools}`,
                inline: true,
            });
        }

        if (crafttools) {
            embed.addFields({
                name: "Required Caft Materials",
                value: `${craftitems}`,
                inline: true,
            });
        }

        let row = new MessageActionRow();

        if (lootboxitems) {
            let itemsbutton = new MessageButton()
                .setCustomId("itemsbutton")
                .setLabel("Possible Items")
                .setStyle("PRIMARY");

            row.addComponents(itemsbutton);
        }

        if (drophistory) {
            let drophistorybutton = new MessageButton()
                .setCustomId("drophistorybutton")
                .setLabel("Drop History")
                .setStyle("SUCCESS")
                .setEmoji("<a:drop:992514722232541207>");

            row.addComponents(drophistorybutton);
        }

        if (lootboxitems || drophistory) {
            interactioncontents = { embeds: [embed], components: [row] };
        }
        await interaction.reply(interactioncontents);

        const item_msg = await interaction.fetchReply();

        if (lootboxitems || drophistory) {
            const ephemerallootboxitems_embed = new MessageEmbed()
                .setTitle(`**Possible Items** [Possible Quantities]`)
                .setDescription(lootboxitems);

            const ephemeraldrophistory_embed = new MessageEmbed()
                .setTitle(`**Drop History**`)
                .setDescription(drophistory);

            const collector = item_msg.createMessageComponentCollector({
                time: 10 * 1000,
            });
            collector.on("collect", async (interaction) => {
                if (interaction.customId === "itemsbutton") {
                    await interaction.reply({
                        embeds: [ephemerallootboxitems_embed],
                        ephemeral: true,
                    });
                } else if (interaction.customId === "drophistorybutton") {
                    await interaction.reply({
                        embeds: [ephemeraldrophistory_embed],
                        ephemeral: true,
                    });
                }
            });

            collector.on("end", (collected) => {
                item_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                    c.setStyle("SECONDARY");
                });
                item_msg.edit({
                    components: item_msg.components,
                });
            });
        }

        setCooldown(interaction, "item", 5, economyData.data);
    },
};
