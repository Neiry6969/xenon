const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addItem,
    removeItem,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const {
    setCooldown,
    setProcessingLock,
    checknewaccount,
} = require("../../utils/mainfunctions");
const { death_handler } = require("../../utils/currencyevents");
const letternumbers = require("../../reference/letternumber");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gift")
        .setDescription("Gift an item to another user.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("Specify the user you want to gift to.")
                .setRequired(true);
        })
        .addStringOption((oi) => {
            return oi
                .setName("item")
                .setDescription("Specify the item you want to gift.")
                .setRequired(true);
        })
        .addStringOption((oi) => {
            return oi
                .setName("quantity")

                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                );
        }),
    cooldown: 10,
    async execute(interaction, client, theme) {
        let endinteraction = false;
        let error_message;
        const options = {
            user: interaction.options.getUser("user"),
            item: interaction.options.getString("item"),
            quantity: interaction.options.getString("quantity"),
        };

        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;
        const target = options.user;
        const itemData = await fetchItemData(options.item);
        if (!itemData) {
            error_message = `\`That is not an existing item\``;
            return errorReply(interaction, error_message);
        }
        let quantity = options.quantity?.toLowerCase();

        if (target.id === interaction.user.id) {
            error_message = `You can't gift items to yourself you already have it. Well thats depressing.`;
            return errorReply(interaction, error_message);
        }

        if (quantity === "max" || quantity === "all") {
            quantity = inventoryData.inventory[itemData.item];
        } else if (quantity === "half") {
            quantity = Math.floor(inventoryData.inventory[itemData.item] / 2);
        } else if (!quantity) {
            quantity = 1;
        } else if (
            letternumbers.find((val) => val.letter === quantity.slice(-1))
        ) {
            if (parseInt(quantity.slice(0, -1))) {
                const number = parseFloat(quantity.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === quantity.slice(-1)
                ).number;
                quantity = number * numbermulti;
            } else {
                quantity = null;
            }
        } else {
            quantity = parseInt(quantity);
        }

        quantity = parseInt(quantity);

        if (quantity === 0) {
            error_message = `Ok so you want to gift nothing, pretend you did that in your mind.`;
            return errorReply(interaction, error_message);
        } else if (!quantity || quantity < 0 || quantity % 1 != 0) {
            error_message = "You can only gift a whole number of an item.";
            return errorReply(interaction, error_message);
        } else if (quantity > inventoryData.inventory[itemData.item]) {
            error_message = `You don't have that quantity of that item to share.\n\nOwned Units: ${
                itemData.icon
            } \`${itemData.item}\` \`x ${inventoryData.inventory[
                itemData.item
            ]?.toLocaleString()}\``;
            return errorReply(interaction, error_message);
        }

        if (
            !inventoryData.inventory[itemData.item] ||
            inventoryData.inventory[itemData.item] === 0
        ) {
            error_message = `You have \`0\` ${itemData.icon} \`${itemData.item}\`, so how are you going to gift that?`;
            return errorReply(interaction, error_message);
        }

        const checknewaccount_local = await checknewaccount(
            interaction.user.id
        );
        const checknewaccount_user = await checknewaccount(options.user.id);
        if (checknewaccount_local.rawboolean === true) {
            error_message = `Your account is too new to gift items, you need the following\n\n${
                checknewaccount_local.commandsleft > 0
                    ? `Commands: \`${checknewaccount_local.commandsleft_display}\`\n`
                    : ""
            }${
                checknewaccount_local.timeleft > 0
                    ? `Ready: <t:${Math.floor(
                          checknewaccount_local.readytimestamp / 1000
                      )}:R>`
                    : ""
            }`;
            return errorReply(interaction, error_message);
        }
        if (
            checknewaccount_user.rawboolean === true &&
            interaction.user.id !== "567805802388127754"
        ) {
            error_message = `That account is too new to gift items to`;
            return errorReply(interaction, error_message);
        }

        let confirm = new MessageButton()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle("PRIMARY");

        let cancel = new MessageButton()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("DANGER");

        let row = new MessageActionRow().addComponents(confirm, cancel);

        const gift_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Action Confirmation - Gift`)
            .setDescription(
                `<@${
                    interaction.user.id
                }>, are you sure you want to gift \`${quantity.toLocaleString()}\` ${
                    itemData.icon
                } \`${itemData.item}\` to <@${target.id}>?`
            );

        await interaction.reply({
            embeds: [gift_embed],
            components: [row],
        });

        const gift_msg = await interaction.fetchReply();

        const collector = gift_msg.createMessageComponentCollector({
            time: 20 * 1000,
        });

        setProcessingLock(interaction.user.id, true);
        collector.on("collect", async (button) => {
            if (button.user.id != interaction.user.id) {
                return button.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            button.deferUpdate();

            if (button.customId === "confirm") {
                endinteraction = true;

                const newquantityowned =
                    inventoryData.inventory[itemData.item] - quantity;

                gift_embed
                    .setColor(`#95ff87`)
                    .setTitle(`Receipt - Gift`)
                    .setDescription(
                        `<@${interaction.user.id}> gifted items to <@${
                            target.id
                        }>, here are the details:\n\n**Item:** ${
                            itemData.icon
                        } \`${
                            itemData.item
                        }\`\n**Quantity:** \`${quantity.toLocaleString()}\``
                    )
                    .setFooter({
                        text: `Units Owned: ${newquantityowned.toLocaleString()}`,
                    });

                confirm.setDisabled().setStyle("SUCCESS");
                cancel.setDisabled().setStyle("SECONDARY");

                gift_msg.edit({
                    embeds: [gift_embed],
                    components: [row],
                });
                setProcessingLock(interaction.user.id, false);
                await removeItem(interaction.user.id, itemData.item, quantity);
                await addItem(target.id, itemData.item, quantity);
            } else if (button.customId === "cancel") {
                endinteraction = true;
                setProcessingLock(interaction.user.id, false);

                gift_embed
                    .setTitle(`Action Cancellend - Gift`)
                    .setColor(`#ff8f87`);

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled();

                gift_msg.edit({
                    embeds: [gift_embed],
                    components: [row],
                });
            }
        });

        collector.on("end", async (collected) => {
            setProcessingLock(interaction.user.id, false);

            if (endinteraction === true) {
            } else {
                gift_embed
                    .setTitle(`Action Timed Out - Gift`)
                    .setColor(`#ff8f87`);

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled().setStyle("SECONDARY");

                gift_msg.edit({
                    embeds: [gift_embed],
                    components: [row],
                });
            }
        });

        return setCooldown(interaction, "gift", 10, economyData);
    },
};
