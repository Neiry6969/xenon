const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const fs = require("fs");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");

const letternumbers = require("../../reference/letternumber");
const interactionproccesses = require("../../interactionproccesses.json");

const jsoncooldowns = require("../../cooldowns.json");
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
                .setName("amount")

                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                );
        }),
    cooldown: 10,
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData,
        itemData
    ) {
        let endinteraction = false;
        const allItems = itemData;
        const options = {
            user: interaction.options.getUser("user"),
            item: interaction.options.getString("item"),
            amount: interaction.options.getString("amount"),
        };

        const target = options.user;
        const getitem = options.item?.toLowerCase();
        let amount = options.amount?.toLowerCase();
        const errorembed = new MessageEmbed().setColor("#FF5C5C");

        const params = {
            userId: interaction.user.id,
        };

        if (target.id === interaction.user.id) {
            errorembed.setDescription(
                `You can't gift items to yourself you already have it. Well thats depressing.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (!inventoryData) {
            errorembed.setDescription("You got nothing to gift.");
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (getitem.length < 3) {
            errorembed.setDescription(
                `\`${getitem}\` is not even an existing item.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (getitem.length > 250) {
            errorembed.setDescription(
                `Couldn't find that item because you typed passed the limit of 250 characters.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }
        const itemssearch = allItems.filter((value) => {
            return value.item.includes(getitem);
        });

        const item = itemssearch[0];

        if (item === undefined) {
            errorembed.setDescription(`\`${getitem}\` is not existent item.`);

            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (amount === "max" || amount === "all") {
            amount = inventoryData.inventory[item.item];
        } else if (amount === "half") {
            amount = Math.floor(inventoryData.inventory[item.item] / 2);
        } else if (!amount) {
            amount = 1;
        } else if (
            letternumbers.find((val) => val.letter === amount.slice(-1))
        ) {
            if (parseInt(amount.slice(0, -1))) {
                const number = parseFloat(amount.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === amount.slice(-1)
                ).number;
                amount = number * numbermulti;
            } else {
                amount = null;
            }
        } else {
            amount = parseInt(amount);
        }

        amount = parseInt(amount);

        if (amount === 0) {
            errorembed.setDescription(
                `Ok so you want to gift nothing, pretend you did that in your mind.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (!amount || amount < 0 || amount % 1 != 0) {
            errorembed.setDescription(
                "You can only gift a whole number of an item."
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (amount > inventoryData.inventory[item.item]) {
            errorembed.setDescription(
                `You don't have that amount of that item to share. You have: \`${inventoryData.inventory[
                    item.item
                ]?.toLocaleString()}\` ${item.icon} \`${item.item}\``
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (
            !inventoryData.inventory[item.item] ||
            inventoryData.inventory[item.item] === 0
        ) {
            errorembed(
                `You have \`0\` ${item.icon} \`${item.item}\`, so how are you going to gift that?`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }
        const params_target = {
            userId: target.id,
        };

        inventoryModel.findOne(params_target, async (err, data) => {
            if (data) {
                const hasItem = Object.keys(data.inventory).includes(item.item);
                if (!hasItem) {
                    data.inventory[item.item] = amount;
                } else {
                    data.inventory[item.item] =
                        data.inventory[item.item] + amount;
                }
                await inventoryModel.findOneAndUpdate(params_target, data);
                inventoryData.inventory[item.item] =
                    inventoryData.inventory[item.item] - amount;
                await inventoryModel.findOneAndUpdate(params, inventoryData);
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

                let confirm = new MessageButton()
                    .setCustomId("confirm")
                    .setLabel("Confirm")
                    .setStyle("PRIMARY");

                let cancel = new MessageButton()
                    .setCustomId("cancel")
                    .setLabel("Cancel")
                    .setStyle("DANGER");

                let row = new MessageActionRow().addComponents(confirm, cancel);

                const embed = {
                    color: "RANDOM",
                    author: {
                        name: `_____________`,
                        icon_url: `${interaction.user.displayAvatarURL()}`,
                    },
                    title: `Confirm action`,
                    description: `<@${
                        interaction.user.id
                    }>, do you want to gift \`${amount.toLocaleString()}\` ${
                        item.icon
                    } **${item.item}** to <@${target.id}>?`,
                    timestamp: new Date(),
                };
                await interaction.reply({
                    embeds: [embed],
                    components: [row],
                });

                const gift_msg = await interaction.fetchReply();

                const collector = gift_msg.createMessageComponentCollector({
                    time: 20 * 1000,
                });

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
                            color: "#A8FE97",
                            title: `Gift Successful`,
                            description: `<@${interaction.user.id}> gifted items to <@${target.id}>, here are the details:`,
                            fields: [
                                {
                                    name: "Item",
                                    value: `${item.icon} \`${item.item}\``,
                                    inline: true,
                                },
                                {
                                    name: "Quantity",
                                    value: `\`${amount.toLocaleString()}\``,
                                    inline: true,
                                },
                            ],
                            timestamp: new Date(),
                        };

                        confirm.setDisabled().setStyle("SUCCESS");

                        cancel.setDisabled().setStyle("SECONDARY");

                        gift_msg.edit({
                            embeds: [embed],
                            components: [row],
                        });
                    } else if (button.customId === "cancel") {
                        endinteraction = true;
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
                            inventoryData.inventory[item.item] + amount;
                        await inventoryModel.findOneAndUpdate(
                            params,
                            inventoryData
                        );

                        const params_target = {
                            userId: target.id,
                        };

                        inventoryModel.findOne(
                            params_target,
                            async (err, data) => {
                                data.inventory[item.item] =
                                    data.inventory[item.item] - amount;
                                await inventoryModel.findOneAndUpdate(
                                    params_target,
                                    data
                                );
                            }
                        );

                        const embed = {
                            color: "#FF0000",
                            author: {
                                name: `_____________`,
                                icon_url: `${interaction.user.displayAvatarURL()}`,
                            },
                            title: `Action cancelled`,
                            description: `<@${
                                interaction.user.id
                            }>, do you want to gift \`${amount.toLocaleString()}\` ${
                                item.icon
                            } **${item.item}** to <@${
                                target.id
                            }>?\nI guess not...`,
                            timestamp: new Date(),
                        };

                        confirm.setDisabled().setStyle("SECONDARY");

                        cancel.setDisabled();

                        gift_msg.edit({
                            embeds: [embed],
                            components: [row],
                        });
                    }
                });

                collector.on("end", async (collected) => {
                    if (endinteraction === true) {
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
                            inventoryData.inventory[item.item] + amount;
                        await inventoryModel.findOneAndUpdate(
                            params,
                            inventoryData
                        );

                        const params_target = {
                            userId: target.id,
                        };

                        inventoryModel.findOne(
                            params_target,
                            async (err, data) => {
                                data.inventory[item.item] =
                                    data.inventory[item.item] - amount;
                                await inventoryModel.findOneAndUpdate(
                                    params_target,
                                    data
                                );
                            }
                        );

                        const embed = {
                            color: "#FF0000",
                            author: {
                                name: `_____________`,
                                icon_url: `${interaction.user.displayAvatarURL()}`,
                            },
                            title: `Action timeout`,
                            description: `<@${
                                interaction.user.id
                            }>, do you want to gift \`${amount.toLocaleString()}\` ${
                                item.icon
                            } **${item.item}** to <@${
                                target.id
                            }>?\nI guess not...`,
                            timestamp: new Date(),
                        };

                        confirm.setDisabled().setStyle("SECONDARY");

                        cancel.setDisabled().setStyle("SECONDARY");

                        gift_msg.edit({
                            embeds: [embed],
                            components: [row],
                        });
                    }
                });
            } else {
                await inventoryModel.create({
                    userId: target.id,
                });
                newuser = true;
                return interaction.reply(
                    "That account has just been created after this command, item has not been sent. You can try this command again after.\n`after your cooldown`"
                );
            }
        });

        let cooldown = 10;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].gift = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    },
};
