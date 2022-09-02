const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const fs = require("fs");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const ItemModel = require("../models/itemSchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");
const interactionproccesses = require("../interactionproccesses.json");
const { setProcessingLock } = require("../utils/mainfunctions");
const { errorReply } = require("../utils/errorfunctions");
const { fetchEmbedColor } = require("./cosmeticsfunctions");
const {
    fetchUserData,
    removeItem,
    fetchStatsData,
} = require("./currencyfunctions");
const { addActiveItem } = require("./userfunctions");
const { death_handler } = require("./currencyevents");

class Useitem {
    static async bankmessage(
        interaction,
        economyData,
        inventoryData,
        useItem,
        useAmount
    ) {
        let error_message;
        let endinteraction = false;
        const params = {
            userId: interaction.user.id,
        };

        const item = useItem;
        const useamount = useAmount;

        const expandedspace =
            Math.floor(Math.random() * (200000 * useamount)) +
            50000 * useamount;
        const newbankspacetotal =
            expandedspace +
            economyData.bank.bankmessagespace +
            economyData.bank.expbankspace +
            economyData.bank.otherbankspace;
        const averageexpansion = Math.floor(expandedspace / useamount);

        const confirmembed = new MessageEmbed()
            .setColor(await fetchEmbedColor(interaction))
            .setDescription(
                `Are you sure you want to use ${item.icon} \`${
                    item.item
                }\`  \`x ${useamount.toLocaleString()}\` `
            );

        let confirm = new MessageButton()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle("PRIMARY");

        let cancel = new MessageButton()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("DANGER");

        let row = new MessageActionRow().addComponents(confirm, cancel);

        await interaction.reply({
            embeds: [confirmembed],
            components: [row],
        });
        const use_msg = await interaction.fetchReply();
        const collector = use_msg.createMessageComponentCollector({
            time: 20 * 1000,
        });

        economyData.bank.bankmessagespace =
            economyData.bank.bankmessagespace + expandedspace;
        economyData.bank.bankmessagespace =
            economyData.bank.bankmessagespace + expandedspace;
        inventoryData.inventory[item.item] =
            inventoryData.inventory[item.item] - useamount;
        await EconomyModel.findOneAndUpdate(params, economyData);
        await InventoryModel.findOneAndUpdate(params, inventoryData);
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

                const embed = {
                    color: "#95ff87",
                    thumbnail: {
                        url: item.imageUrl,
                    },
                    title: `You expanded your bankspace`,
                    description: `**Item:** ${item.icon} \`${
                        item.item
                    }\`\n**Amount Used:** \`${useamount.toLocaleString()}\``,
                    fields: [
                        {
                            name: "Expanded Bankspace",
                            value: `+ \`${expandedspace.toLocaleString()}\``,
                            inline: true,
                        },
                        {
                            name: "New Bankspace Total",
                            value: `\`${newbankspacetotal.toLocaleString()}\``,
                            inline: true,
                        },
                        {
                            name: "Average Per One",
                            value: `+ \`${averageexpansion.toLocaleString()}\``,
                            inline: false,
                        },
                    ],
                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SUCCESS");
                cancel.setDisabled().setStyle("SECONDARY");

                use_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
                setProcessingLock(interaction.user.id, false);
            } else if (button.customId === "cancel") {
                endinteraction = true;

                economyData.bank.bankmessagespace =
                    economyData.bank.bankmessagespace - expandedspace;
                economyData.bank.bankmessagespace =
                    economyData.bank.bankmessagespace - expandedspace;
                inventoryData.inventory[item.item] =
                    inventoryData.inventory[item.item] + useamount;
                await EconomyModel.findOneAndUpdate(params, economyData);
                await InventoryModel.findOneAndUpdate(params, inventoryData);

                confirmembed
                    .setColor(await fetchEmbedColor(interaction))
                    .setDescription(
                        `Are you sure you want to use \`${useamount.toLocaleString()} x\` ${
                            item.icon
                        } \`${item.item}\``
                    );

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled();

                use_msg.edit({
                    embeds: [confirmembed],
                    components: [row],
                });
                setProcessingLock(interaction.user.id, false);
            }
        });

        collector.on("end", async (collected) => {
            if (endinteraction === true) {
            } else {
                setProcessingLock(interaction.user.id, false);

                economyData.bank.bankmessagespace =
                    economyData.bank.bankmessagespace - expandedspace;
                economyData.bank.bankmessagespace =
                    economyData.bank.bankmessagespace - expandedspace;
                inventoryData.inventory[item.item] =
                    inventoryData.inventory[item.item] + useamount;
                await EconomyModel.findOneAndUpdate(params, economyData);
                await InventoryModel.findOneAndUpdate(params, inventoryData);

                confirmembed
                    .setColor(await fetchEmbedColor(interaction))
                    .setDescription(
                        `Are you sure you want to use \`${useamount.toLocaleString()} x\` ${
                            item.icon
                        } \`${item.item}\``
                    );

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled().setStyle("SECONDARY");

                return use_msg.edit({
                    embeds: [confirmembed],
                    components: [row],
                });
            }
        });
    }

    static async preniumcard(interaction, economyData, inventoryData, useItem) {
        let error_message;
        let endinteraction = false;

        const params = {
            userId: interaction.user.id,
        };

        const item = useItem;
        const useamount = 1;

        if (economyData.premium.rank >= 1) {
            error_message = `You can't use a ${item.icon} \`${item.item}\`, since you are already a premium.`;
            return errorReply(interaction, error_message);
        }

        const confirmembed = new MessageEmbed()
            .setColor(await fetchEmbedColor(interaction))
            .setDescription(
                `Are you sure you want to use ${item.icon} \`${
                    item.item
                }\`  \`x ${useamount.toLocaleString()}\` `
            );

        let confirm = new MessageButton()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle("PRIMARY");

        let cancel = new MessageButton()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("DANGER");

        let row = new MessageActionRow().addComponents(confirm, cancel);

        await interaction.reply({
            embeds: [confirmembed],
            components: [row],
        });

        const use_msg = await interaction.fetchReply();
        const collector = use_msg.createMessageComponentCollector({
            time: 20 * 1000,
        });

        inventoryData.inventory[item.item] =
            inventoryData.inventory[item.item] - 1;
        economyData.premium.rank = economyData.premium.rank + 1;

        await EconomyModel.findOneAndUpdate(params, economyData);
        await InventoryModel.findOneAndUpdate(params, inventoryData);

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

                const embed = {
                    color: await fetchEmbedColor(interaction),
                    thumbnail: {
                        url: item.imageUrl,
                    },
                    description: `You used \`1 x\` ${item.icon} \`${item.item}\` and became a \`rank 1\` prenium forever.\n**This is irreversible.**`,

                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SUCCESS");
                cancel.setDisabled().setStyle("SECONDARY");

                use_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
                setProcessingLock(interaction.user.id, false);
            } else if (button.customId === "cancel") {
                endinteraction = true;

                inventoryData.inventory[item.item] =
                    inventoryData.inventory[item.item] + 1;
                economyData.premium.rank = economyData.premium.rank - 1;

                await EconomyModel.findOneAndUpdate(params, economyData);
                await InventoryModel.findOneAndUpdate(params, inventoryData);

                confirmembed
                    .setColor(await fetchEmbedColor(interaction))
                    .setDescription(
                        `Are you sure you want to use \`${useamount.toLocaleString()} x\` ${
                            item.icon
                        } \`${item.item}\``
                    );

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled();

                use_msg.edit({
                    embeds: [confirmembed],
                    components: [row],
                });
                setProcessingLock(interaction.user.id, false);
            }
        });

        collector.on("end", async (collected) => {
            if (endinteraction === true) {
            } else {
                setProcessingLock(interaction.user.id, false);

                inventoryData.inventory[item.item] =
                    inventoryData.inventory[item.item] + 1;
                economyData.premium.rank = economyData.premium.rank - 1;

                await EconomyModel.findOneAndUpdate(params, economyData);
                await InventoryModel.findOneAndUpdate(params, inventoryData);

                confirmembed
                    .setColor(await fetchEmbedColor(interaction))
                    .setDescription(
                        `Are you sure you want to use \`${useamount.toLocaleString()} x\` ${
                            item.icon
                        } \`${item.item}\``
                    );

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled().setStyle("SECONDARY");

                return use_msg.edit({
                    embeds: [confirmembed],
                    components: [row],
                });
            }
        });
    }

    static async lootbox(interaction, inventoryData, useItem, useAmount) {
        const allItems = await ItemModel.find({});
        const params = {
            userId: interaction.user.id,
        };

        const item = useItem;
        const useamount = useAmount;
        let itemsarray = [];

        let i;
        for (i = 0; i < useamount; i++) {
            const resultitemnumber = Math.floor(
                Math.random() * item.lootbox.length
            );
            const resultitemobject = item.lootbox[resultitemnumber];
            const resultitem = resultitemobject.i;
            const maxq = resultitemobject.maxq - resultitemobject.minq;
            const minq = resultitemobject.minq;
            const resultamount = Math.floor(Math.random() * maxq) + minq;

            const hasitem = itemsarray.find(({ item }) => item === resultitem);
            if (hasitem) {
                const index = itemsarray.findIndex((object) => {
                    return object.item === hasitem.item;
                });

                const added_amount = hasitem.quantity + resultamount;

                itemsarray[index].quantity = added_amount;
            } else {
                itemsarray.push({
                    item: resultitem,
                    quantity: resultamount,
                });
            }
        }

        itemsarray.forEach((value) => {
            const hasItem = Object.keys(inventoryData.inventory).includes(
                value.item
            );
            if (!hasItem) {
                inventoryData.inventory[value.item] = value.quantity;
            } else {
                inventoryData.inventory[value.item] =
                    inventoryData.inventory[value.item] + value.quantity;
            }
        });

        inventoryData.inventory[item.item] =
            inventoryData.inventory[item.item] - useamount;
        await InventoryModel.findOneAndUpdate(params, inventoryData);

        const resultsmap = itemsarray
            .map((value) => {
                const lootitem = allItems.find(
                    ({ item }) => item === value.item
                );

                return `\`${value.quantity.toLocaleString()} x\` ${
                    lootitem.icon
                } \`${lootitem.item}\``;
            })
            .sort()
            .join("\n");

        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username}'s ${item.name}`)
            .setColor(await fetchEmbedColor(interaction))
            .setThumbnail(item.imageUrl)
            .setDescription(resultsmap)
            .setFooter({
                text: `${useamount.toLocaleString()}x ${item.item}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        return interaction.reply({ embeds: [embed] });
    }

    static async watermelon(interaction, itemData) {
        const colors = ["#ffac80", "#fff280", "#ffd980", "#d7ff80", "#ff8880"];
        const fetch_userData = await fetchUserData(interaction.user.id);
        const userData = fetch_userData.data;

        userData.cosmetics.embedcolors = [
            "#ffac80",
            "#fff280",
            "#ffd980",
            "#d7ff80",
            "#ff8880",
        ];
        const colors_display = userData.cosmetics.embedcolors
            .map((color) => {
                return `\`${color}\``;
            })
            .join(", ");

        await removeItem(interaction.user.id, itemData.item, 1);
        await UserModel.findOneAndUpdate(
            { userId: interaction.user.id },
            userData
        );
        await addActiveItem(interaction.user.id, "watermelon", 7889238, colors);

        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username}'s ${itemData.name}`)
            .setColor(await fetchEmbedColor(interaction))
            .setThumbnail(itemData.imageUrl)
            .setDescription(
                `You used \`${1}\` ${itemData.icon} \`${
                    itemData.item
                }\`\n\nYou redeemed the colours below:\n${colors_display}`
            )
            .setFooter({
                text: `${(1).toLocaleString()}x ${itemData.item}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        return interaction.reply({ embeds: [embed] });
    }

    static async prestigekey(interaction, itemData) {
        await removeItem(interaction.user.id, itemData.item, 1);
        await addActiveItem(interaction.user.id, "prestigekey", 43200, null);

        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username}'s ${itemData.name}`)
            .setColor(await fetchEmbedColor(interaction))
            .setThumbnail(itemData.imageUrl)
            .setDescription(
                `You used \`${1}\` ${itemData.icon} \`${
                    itemData.item
                }\`\n\nYou gained \`+ 150%\` multiplier for 12 hours!`
            )
            .setFooter({
                text: `${(1).toLocaleString()}x ${itemData.item}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        return interaction.reply({ embeds: [embed] });
    }

    static async pillofxenon(
        interaction,
        client,
        economyData,
        inventoryData,
        itemData
    ) {
        const fetch_statsData = await fetchStatsData(interaction.user.id);
        const statsData = fetch_statsData.data;
        await removeItem(interaction.user.id, itemData.item, 1);
        if (Math.floor(Math.random() * 5) !== 1) {
            const pill_multi = Math.floor(Math.random() * 21) + 5;
            await addActiveItem(
                interaction.user.id,
                "pillofxenon",
                1800,
                pill_multi
            );

            const embed = new MessageEmbed()
                .setTitle(`${interaction.user.username}'s ${itemData.name}`)
                .setColor(await fetchEmbedColor(interaction))
                .setThumbnail(itemData.imageUrl)
                .setDescription(
                    `You used \`${1}\` ${itemData.icon} \`${
                        itemData.item
                    }\`\n\nYou survived and felt reallllyyyy goooddd...\nYou gained \`+ ${pill_multi}%\` multiplier for 30 minutes!`
                )
                .setFooter({
                    text: `${(1).toLocaleString()}x ${itemData.item}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            return interaction.reply({ embeds: [embed] });
        } else {
            const embed = new MessageEmbed()
                .setTitle(`${interaction.user.username}'s ${itemData.name}`)
                .setColor(await fetchEmbedColor(interaction))
                .setThumbnail(itemData.imageUrl)
                .setDescription(
                    `You used \`${1}\` ${itemData.icon} \`${
                        itemData.item
                    }\`\n\nYou got realy high that even the doctors couldn't save you, so you died! Shame, why are you doing drugs?`
                )
                .setFooter({
                    text: `${(1).toLocaleString()}x ${itemData.item}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            await death_handler(
                client,
                interaction.user.id,
                economyData,
                inventoryData,
                statsData,
                "pillofxenon"
            );
            return interaction.reply({ embeds: [embed] });
        }
    }
}

module.exports = Useitem;
