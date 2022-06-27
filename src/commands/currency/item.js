const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const allItems = require("../../data/all_items");

const jsoncooldowns = require("../../../cooldowns.json");
const fs = require("fs");
function premiumcooldowncalc(defaultcooldown) {
    if (defaultcooldown <= 5 && defaultcooldown > 2) {
        return defaultcooldown - 2;
    } else if (defaultcooldown <= 15) {
        return defaultcooldown - 5;
    } else if (defaultcooldown <= 120) {
        return defaultcooldown - 10;
    } else {
        return defaultcooldown;
    }
}

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
    async execute(interaction, client, userData, inventoryData) {
        const options = {
            item: interaction.options.getString("item"),
        };

        let cooldown = 5;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].shop = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        const errorembed = new MessageEmbed().setColor("#FF5C5C");

        const getItem = options.item;

        if (getItem.length < 3) {
            errorembed.setDescription(
                `\`${getItem}\` is not even an existing item.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (getItem.length > 250) {
            errorembed.setDescription(
                `Couldn't find that item because you typed passed the limit of 250 characters.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }
        const itemssearch = allItems.filter((value) => {
            return value.item.includes(getItem);
        });

        const item = itemssearch[0];

        if (item === undefined) {
            errorembed.setDescription(
                `\`${getItem}\` is not even an existing item.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }
        function ifhasamountitem(reqm, hasa) {
            if (hasa >= reqm) {
                return true;
            } else {
                return false;
            }
        }

        let crafttools;
        if (item.crafttools) {
            crafttools = item.crafttools
                .map((value) => {
                    const toolitem = allItems.find(
                        ({ item }) => item === value.i
                    );

                    return `${
                        ifhasamountitem(
                            value.q,
                            inventoryData.inventory[toolitem.item]
                        ) === true
                            ? `[\`${value.q.toLocaleString()}\`](https://www.google.com/)`
                            : `\`${value.q.toLocaleString()}\``
                    } ${toolitem.icon} \`${toolitem.item}\``;
                })
                .join("\n");
        }

        let craftitems;
        if (item.craftitems) {
            craftitems = item.craftitems
                .map((value) => {
                    const craftitem = allItems.find(
                        ({ item }) => item === value.i
                    );

                    return `${
                        ifhasamountitem(
                            value.q,
                            inventoryData.inventory[craftitem.item]
                        ) === true
                            ? `[\`${value.q.toLocaleString()}\`](https://www.google.com/)`
                            : `\`${value.q.toLocaleString()}\``
                    } ${craftitem.icon} \`${craftitem.item}\``;
                })
                .join("\n");
        }

        let lootboxitems;
        if (item.lootbox) {
            lootboxitems = item.lootbox
                .map((value) => {
                    const craftitem = allItems.find(
                        ({ item }) => item === value.i
                    );

                    return `${craftitem.icon} \`${
                        craftitem.item
                    }\` [\`${value.minq.toLocaleString()} - ${value.maxq.toLocaleString()}\`]`;
                })
                .join("\n");
        }

        const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle(
                `**${item.icon} ${item.name}** (${
                    inventoryData.inventory[item.item]
                        ? inventoryData.inventory[item.item].toLocaleString()
                        : "0"
                } Owned)`
            )
            .setThumbnail(item.imageUrl)
            .setDescription(`> ${item.description}`)
            .addFields(
                {
                    name: "_ _",
                    value: `**BUY:** \`❀ ${item.price?.toLocaleString()}\`\n**SELL:** \`❀ ${item.sell?.toLocaleString()}\`\n**TRADE:** \`❀ ${item.trade?.toLocaleString()}\``,
                },
                {
                    name: "ID",
                    value: `\`${item.item}\``,
                    inline: true,
                },
                {
                    name: "Rarity",
                    value: `\`${item.rarity}\``,
                    inline: true,
                },
                {
                    name: "Type",
                    value: `\`${item.type}\``,
                    inline: true,
                }
            )
            .setTimestamp();

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

        if (lootboxitems) {
            let itemsbutton = new MessageButton()
                .setCustomId("itemsbutton")
                .setLabel("Possible Items")
                .setStyle("PRIMARY");

            let row = new MessageActionRow().addComponents(itemsbutton);

            interactioncontents = { embeds: [embed], components: [row] };
        }

        await interaction.reply(interactioncontents);

        const item_msg = await interaction.fetchReply();

        if (lootboxitems) {
            const ephemeralitemsembed = new MessageEmbed()
                .setTitle(`**Possible Items** [Possible Quantities]`)
                .setDescription(lootboxitems);
            const collector = item_msg.createMessageComponentCollector({
                time: 10 * 1000,
            });
            collector.on("collect", async (interaction) => {
                if (interaction.customId === "itemsbutton") {
                    await interaction.reply({
                        embeds: [ephemeralitemsembed],
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
    },
};
