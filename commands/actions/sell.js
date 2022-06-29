const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const fs = require("fs");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const allItems = require("../../data/all_items");
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
        .setName("sell")
        .setDescription("Sell items to the dealer at the Xenon shop.")
        .addStringOption((oi) => {
            return oi
                .setName("item")
                .setDescription(
                    "Specify the item you want to sell to the dealer."
                )
                .setRequired(true);
        })
        .addStringOption((oi) => {
            return oi
                .setName("amount")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                );
        }),
    cdmsg: "You already bought something earlier why are you buying things so fast?",
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
        const allItems = itemData;
        const options = {
            item: interaction.options.getString("item"),
            amount: interaction.options.getString("amount"),
        };

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
        jsoncooldowns[interaction.user.id].sell = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        const params = {
            userId: interaction.user.id,
        };
        const getItem = options.item?.toLowerCase();

        let sellamount = options.amount?.toLowerCase();

        const errorembed = new MessageEmbed().setColor("#FF5C5C");

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

        if (item.sell === "unable to be sold") {
            errorembed.setDescription(
                `This item is unable to be sold since it is a collectable.\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\``
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (sellamount === "max" || sellamount === "all") {
            if (
                inventoryData.inventory[item.item] === 0 ||
                !inventoryData.inventory[item.item]
            ) {
                errorembed.setDescription(
                    `You don't own any of this item, how are you going to sell it?`
                );

                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                sellamount = inventoryData.inventory[item.item];
            }
        } else if (!sellamount) {
            sellamount = 1;
        } else if (
            letternumbers.find((val) => val.letter === sellamount.slice(-1))
        ) {
            if (parseInt(sellamount.slice(0, -1))) {
                const number = parseFloat(sellamount.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === sellamount.slice(-1)
                ).number;
                sellamount = number * numbermulti;
            } else {
                sellamount = null;
            }
        } else {
            sellamount = parseInt(sellamount);
        }

        sellamount = parseInt(sellamount);
        if (
            !inventoryData.inventory[item.item] ||
            inventoryData.inventory[item.item] <= 0
        ) {
            errorembed.setDescription("You don't any of this item to sell.");
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (!sellamount || sellamount < 0) {
            errorembed.setDescription(
                "You can only sell a whole number of items."
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (sellamount === 0) {
            errorembed.setDescription(
                "So you want to sell nothing, why bother?"
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (inventoryData.inventory[item.item] < sellamount) {
            errorembed.setDescription(
                `You don't have enough of that item to sell that much.\n\n**Item:** ${
                    item.icon
                } \`${item.item}\`\n**Quantity Owned:** \`${data.inventory[
                    item.item
                ].toLocaleString()}\``
            );

            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        const saleprice = sellamount * item.sell;

        if (saleprice >= 10000) {
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
                inventoryData.inventory[item.item] - sellamount;
            userData.wallet = userData.wallet + saleprice;
            userData.interactionproccesses.interaction = true;
            userData.interactionproccesses.proccessingcoins = true;

            await inventoryModel.findOneAndUpdate(params, inventoryData);
            await economyModel.findOneAndUpdate(params, userData);

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
                title: `Confirm transaction`,
                description: `<@${
                    interaction.user.id
                }>, are you sure you want to sell ${item.icon} \`${
                    item.item
                }\` x\`${sellamount.toLocaleString()}\`\n**Sale Price:** \`❀ ${saleprice.toLocaleString()}\` (\`❀ ${item.sell.toLocaleString()}\` for each)`,
                timestamp: new Date(),
            };
            await interaction.reply({
                embeds: [embed],
                components: [row],
            });
            const sell_msg = await interaction.fetchReply();
            const collector = sell_msg.createMessageComponentCollector({
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
                    userData.interactionproccesses.interaction = false;
                    userData.interactionproccesses.proccessingcoins = false;
                    userData.bank.expbankspace =
                        userData.bank.expbankspace +
                        Math.floor(Math.random() * 69);
                    await economyModel.findOneAndUpdate(params, userData);

                    const embed = {
                        color: "#00FF00",
                        title: `Sell Receipt`,
                        description: `**Item:** ${item.icon} \`${
                            item.item
                        }\`\n**Quantity:** \`${sellamount.toLocaleString()}\`\n**Sold For:** \`❀ ${saleprice.toLocaleString()}\`\n**Each Sold For:** \`❀ ${item.sell.toLocaleString()}\`\n**Now You Have:** \`${inventoryData.inventory[
                            item.item
                        ].toLocaleString()}\``,
                    };

                    confirm.setDisabled().setStyle("SUCCESS");

                    cancel.setDisabled().setStyle("SECONDARY");

                    return sell_msg.edit({
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
                        inventoryData.inventory[item.item] + sellamount;
                    userData.wallet = userData.wallet - saleprice;
                    userData.interactionproccesses.interaction = false;
                    userData.interactionproccesses.proccessingcoins = false;

                    await economyModel.findOneAndUpdate(params, userData);

                    const embed = {
                        color: "#FF0000",
                        title: `Sell cancelled`,
                        description: `<@${
                            interaction.user.id
                        }>, confirm that want to sell the following:\n**Item:** ${
                            item.icon
                        } \`${
                            item.item
                        }\`\n**Quantity:** \`${sellamount.toLocaleString()}\`\n**Sale Price:** \`❀ ${saleprice.toLocaleString()}\` (\`❀ ${item.sell.toLocaleString()}\` for each)\nI guess not. Come back later if you change your mind.`,
                        timestamp: new Date(),
                    };

                    confirm.setDisabled().setStyle("SECONDARY");

                    cancel.setDisabled();

                    return sell_msg.edit({
                        embeds: [embed],
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
                        inventoryData.inventory[item.item] + sellamount;
                    userData.wallet = userData.wallet - saleprice;
                    userData.interactionproccesses.interaction = false;
                    userData.interactionproccesses.proccessingcoins = false;

                    await inventoryModel.findOneAndUpdate(
                        params,
                        inventoryData
                    );
                    await economyModel.findOneAndUpdate(params, userData);

                    const embed = {
                        color: "#FF0000",
                        title: `Sell timeout`,
                        description: `<@${
                            interaction.user.id
                        }>, confirm that want to sell the following:\n**Item:** ${
                            item.icon
                        } \`${
                            item.item
                        }\`\n**Quantity:** \`${sellamount.toLocaleString()}\`\n**Sale Price:** \`❀ ${saleprice.toLocaleString()}\` (\`❀ ${item.sell.toLocaleString()}\` for each)\nI guess not. Come back later if you change your mind.`,
                        timestamp: new Date(),
                    };

                    confirm.setDisabled().setStyle("SECONDARY");

                    cancel.setDisabled().setStyle("SECONDARY");

                    return sell_msg.edit({
                        embeds: [embed],
                        components: [row],
                    });
                }
            });
        } else {
            inventoryData.inventory[item.item] =
                inventoryData.inventory[item.item] - sellamount;
            userData.wallet = userData.wallet + saleprice;
            await inventoryModel.findOneAndUpdate(params, inventoryData);
            await economyModel.findOneAndUpdate(params, userData);

            const embed = {
                color: "#00FF00",
                title: `Sell Receipt`,
                description: `**Item:** ${item.icon} \`${
                    item.item
                }\`\n**Quantity:** \`${sellamount.toLocaleString()}\`\n**Sold For:** \`❀ ${saleprice.toLocaleString()}\`\n**Each Sold For:** \`❀ ${item.sell.toLocaleString()}\`\n**Now You Have:** \`${inventoryData.inventory[
                    item.item
                ].toLocaleString()}\``,
            };
            return interaction.reply({ embeds: [embed] });
        }
    },
};
