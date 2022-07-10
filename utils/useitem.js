const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const fs = require("fs");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const ItemModel = require("../models/itemSchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");

const interactionproccesses = require("../interactionproccesses.json");

class Currency {
    static async bankmessage(
        interaction,
        userBalance,
        userInventory,
        useItem,
        useAmount
    ) {
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
            userBalance.bank.bankspace +
            userBalance.bank.expbankspace +
            userBalance.bank.otherbankspace;
        const averageexpansion = Math.floor(expandedspace / useamount);

        const confirmembed = new MessageEmbed()
            .setColor("YELLOW")
            .setDescription(
                `Are you sure you want to use \`${useamount.toLocaleString()}x\` ${
                    item.icon
                } \`${item.item}\``
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

        interactionproccesses[interaction.user.id] = {
            interaction: true,
            proccessingcoins: true,
        };
        fs.writeFile(
            "./interactionproccesses.json",
            JSON.stringify(interactionproccesses),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        userBalance.bank.bankspace = userBalance.bank.bankspace + expandedspace;
        userBalance.bank.bankmessagespace =
            userBalance.bank.bankmessagespace + expandedspace;
        userInventory.inventory[item.item] =
            userInventory.inventory[item.item] - useamount;
        await EconomyModel.findOneAndUpdate(params, userBalance);
        await InventoryModel.findOneAndUpdate(params, userInventory);

        collector.on("collect", async (button) => {
            if (button.user.id != interaction.user.id) {
                return button.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            button.deferUpdate();

            if (button.customId === "confirm") {
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
                };
                fs.writeFile(
                    "./interactionproccesses.json",
                    JSON.stringify(interactionproccesses),
                    (err) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                );

                const embed = {
                    color: "RANDOM",
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

                return use_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
            } else if (button.customId === "cancel") {
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
                };
                fs.writeFile(
                    "./interactionproccesses.json",
                    JSON.stringify(interactionproccesses),
                    (err) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                );

                userBalance.bank.bankspace =
                    userBalance.bank.bankspace - expandedspace;
                userBalance.bank.bankmessagespace =
                    userBalance.bank.bankmessagespace - expandedspace;
                userInventory.inventory[item.item] =
                    userInventory.inventory[item.item] + useamount;
                await EconomyModel.findOneAndUpdate(params, userBalance);
                await InventoryModel.findOneAndUpdate(params, userInventory);

                confirmembed
                    .setColor("#fc0352")
                    .setDescription(
                        `Are you sure you want to use \`${useamount.toLocaleString()}x\` ${
                            item.icon
                        } \`${item.item}\`\n\nI guess not.`
                    );

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled();

                return use_msg.edit({
                    embeds: [confirmembed],
                    components: [row],
                });
            }
        });

        collector.on("end", async (collected) => {
            if (collected.size > 0) {
            } else {
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
                };
                fs.writeFile(
                    "./interactionproccesses.json",
                    JSON.stringify(interactionproccesses),
                    (err) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                );
                userBalance.bank.bankspace =
                    userBalance.bank.bankspace - expandedspace;
                userBalance.bank.bankmessagespace =
                    userBalance.bank.bankmessagespace - expandedspace;
                userInventory.inventory[item.item] =
                    userInventory.inventory[item.item] + useamount;
                await EconomyModel.findOneAndUpdate(params, userBalance);
                await InventoryModel.findOneAndUpdate(params, userInventory);

                confirmembed
                    .setColor("#fc0352")
                    .setDescription(
                        `Are you sure you want to use \`${useamount.toLocaleString()}x\` ${
                            item.icon
                        } \`${item.item}\`\n\nI guess not.`
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

    static async preniumcard(interaction, userBalance, userInventory, useItem) {
        const params = {
            userId: interaction.user.id,
        };

        const errorembed = new MessageEmbed().setColor("#fc0352");

        const item = useItem;
        const useamount = 1;
        const userData = userBalance;
        const inventoryData = userInventory;

        if (userData.premium >= 1) {
            errorembed.setDescription(
                `You can't use a ${item.icon} \`${item.item}\`, since you are already a premium.`
            );
            message.reply({ embeds: [errorembed], ephemeral: true });
        }

        const confirmembed = new MessageEmbed()
            .setColor("YELLOW")
            .setDescription(
                `Are you sure you want to use \`${useamount.toLocaleString()}x\` ${
                    item.icon
                } \`${item.item}\``
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

        interactionproccesses[interaction.user.id] = {
            interaction: true,
            proccessingcoins: true,
        };
        fs.writeFile(
            "./interactionproccesses.json",
            JSON.stringify(interactionproccesses),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        inventoryData.inventory[item.item] =
            inventoryData.inventory[item.item] - 1;
        userData.premium.rank = userData.premium.rank + 1;

        await EconomyModel.findOneAndUpdate(params, userData);
        await InventoryModel.findOneAndUpdate(params, inventoryData);

        collector.on("collect", async (button) => {
            if (button.user.id != interaction.user.id) {
                return button.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            button.deferUpdate();

            if (button.customId === "confirm") {
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
                };
                fs.writeFile(
                    "./interactionproccesses.json",
                    JSON.stringify(interactionproccesses),
                    (err) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                );

                const embed = {
                    color: "RANDOM",
                    thumbnail: {
                        url: item.imageUrl,
                    },
                    description: `You used \`1x\` ${item.icon} \`${item.item}\` and became a \`rank 1\` prenium forever.\n**This is irreversible.**`,

                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SUCCESS");

                cancel.setDisabled().setStyle("SECONDARY");

                return use_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
            } else if (button.customId === "cancel") {
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
                };
                fs.writeFile(
                    "./interactionproccesses.json",
                    JSON.stringify(interactionproccesses),
                    (err) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                );

                inventoryData.inventory[item.item] =
                    inventoryData.inventory[item.item] + 1;
                userData.premium.rank = userData.premium.rank - 1;

                await EconomyModel.findOneAndUpdate(params, userData);
                await InventoryModel.findOneAndUpdate(params, inventoryData);

                confirmembed
                    .setColor("#fc0352")
                    .setDescription(
                        `Are you sure you want to use \`${useamount.toLocaleString()}x\` ${
                            item.icon
                        } \`${item.item}\`\n\nI guess not.`
                    );

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled();

                return use_msg.edit({
                    embeds: [confirmembed],
                    components: [row],
                });
            }
        });

        collector.on("end", async (collected) => {
            if (collected.size > 0) {
            } else {
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
                };
                fs.writeFile(
                    "./interactionproccesses.json",
                    JSON.stringify(interactionproccesses),
                    (err) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                );

                inventoryData.inventory[item.item] =
                    inventoryData.inventory[item.item] + 1;
                userData.premium.rank = userData.premium.rank - 1;

                await EconomyModel.findOneAndUpdate(params, userData);
                await InventoryModel.findOneAndUpdate(params, inventoryData);

                confirmembed
                    .setColor("#fc0352")
                    .setDescription(
                        `Are you sure you want to use \`${useamount.toLocaleString()}x\` ${
                            item.icon
                        } \`${item.item}\`\n\nI guess not.`
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

    static async lootbox(interaction, userInventory, useItem, useAmount) {
        const allItems = await ItemModel.find({});
        const params = {
            userId: interaction.user.id,
        };

        const inventoryData = userInventory;
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

                return `\`${value.quantity.toLocaleString()}x\` ${
                    lootitem.icon
                } \`${lootitem.item}\``;
            })
            .sort()
            .join("\n");

        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username}'s ${item.name}`)
            .setThumbnail(item.imageUrl)
            .setDescription(resultsmap)
            .setFooter({
                text: `${useamount.toLocaleString()}x ${item.item}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        return interaction.reply({ embeds: [embed] });
    }
}

module.exports = Currency;
