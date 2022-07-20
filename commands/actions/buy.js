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
        .setName("buy")
        .setDescription("Buy an item from the Xenon shop.")
        .addStringOption((oi) => {
            return oi
                .setName("item")
                .setDescription(
                    "Specify the item you want to buy from the Xenon shop."
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
        let endinteraction = false;
        const allItems = itemData;

        const options = {
            item: interaction.options.getString("item"),
            amount: interaction.options.getString("amount"),
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
        jsoncooldowns[interaction.user.id].buy = timpstamp;
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

        let buyamount = options.amount?.toLowerCase();

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

        if (item.price === "unable to be bought") {
            errorembed.setDescription(
                `This item is unable to be bought since it is not sold in the Xenon shop.\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\``
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (buyamount === "max" || buyamount === "all") {
            if (userData.wallet < item.value) {
                errorembed.setDescription(
                    `You need at least \`❀ ${item.value}\` in your wallet to buy a ${item.icon} \`${item.item}\``
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                buyamount = Math.floor(userData.wallet / item.value);
            }
        } else if (!buyamount) {
            buyamount = 1;
        } else if (
            letternumbers.find((val) => val.letter === buyamount.slice(-1))
        ) {
            if (parseInt(buyamount.slice(0, -1))) {
                const number = parseFloat(buyamount.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === buyamount.slice(-1)
                ).number;
                buyamount = number * numbermulti;
            } else {
                buyamount = null;
            }
        } else {
            buyamount = parseInt(buyamount);
        }

        buyamount = parseInt(buyamount);

        const totalprice = item.value * buyamount;

        if (!buyamount || buyamount < 0) {
            errorembed.setDescription(
                "You can only buy a whole number of items."
            );

            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        } else if (buyamount === 0) {
            errorembed.setDescription(
                "So you want to buy nothing, why bother?"
            );
            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        } else if (userData.wallet < totalprice) {
            errorembed.setDescription(
                `You don't have enough coins in your wallet to buy that many of that item.\n\n**Item:** ${
                    item.icon
                } \`${
                    item.item
                }\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Purchase Cost:** \`❀ ${totalprice.toLocaleString()}\`\n**Current Wallet:** \`❀ ${userData.wallet.toLocaleString()}\``
            );

            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        }

        if (totalprice >= 100000) {
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
            const hasItem = Object.keys(inventoryData.inventory).includes(
                item.item
            );
            if (!hasItem) {
                inventoryData.inventory[item.item] = buyamount;
            } else {
                inventoryData.inventory[item.item] =
                    inventoryData.inventory[item.item] + buyamount;
            }
            userData.wallet = userData.wallet - totalprice;

            await economyModel.findOneAndUpdate(params, userData);
            await inventoryModel.findOneAndUpdate(params, inventoryData);

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
                title: `Confirm purchase`,
                description: `<@${
                    interaction.user.id
                }>, are you sure you want to buy ${item.icon} \`${
                    item.item
                }\` x\`${buyamount.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (\`❀ ${item.price.toLocaleString()}\` for each)`,
                timestamp: new Date(),
            };
            await interaction.reply({
                embeds: [embed],
                components: [row],
            });
            const buy_msg = await interaction.fetchReply();
            const collector = buy_msg.createMessageComponentCollector({
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

                    const amountowned = inventoryData.inventory[item.item];
                    const embed = {
                        color: "#A8FE97",
                        title: `Purchase Receipt`,
                        description: `**Item:** ${item.icon} \`${
                            item.item
                        }\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Bought For:** \`❀ ${totalprice.toLocaleString()}\`\n**Each Bought For:** \`❀ ${item.price.toLocaleString()}\`\n**Now You Have** \`${amountowned.toLocaleString()}\``,
                        timestamp: new Date(),
                    };

                    confirm.setDisabled().setStyle("SUCCESS");

                    cancel.setDisabled().setStyle("SECONDARY");

                    return buy_msg.edit({
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
                        inventoryData.inventory[item.item] - buyamount;
                    userData.wallet = userData.wallet + totalprice;
                    await inventoryModel.findOneAndUpdate(
                        params,
                        inventoryData
                    );
                    await economyModel.findOneAndUpdate(params, userData);
                    const embed = {
                        color: "#FF0000",
                        title: `Purchase cancelled`,
                        description: `<@${
                            interaction.user.id
                        }>, confirm that want to buy the following:\n**Item:** ${
                            item.icon
                        } \`${
                            item.item
                        }\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (\`❀ ${item.price.toLocaleString()}\` for each)\nI guess not. Come back later if you change your mind.`,
                        timestamp: new Date(),
                    };

                    confirm.setDisabled().setStyle("SECONDARY");

                    cancel.setDisabled();

                    return buy_msg.edit({
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
                        inventoryData.inventory[item.item] - buyamount;
                    userData.wallet = userData.wallet + totalprice;

                    await inventoryModel.findOneAndUpdate(
                        params,
                        inventoryData
                    );
                    await economyModel.findOneAndUpdate(params, userData);

                    const embed = {
                        color: "#FF0000",
                        title: `Purchase timeout`,
                        description: `<@${
                            interaction.user.id
                        }>, confirm that want to buy the following:\n**Item:** ${
                            item.icon
                        } \`${
                            item.item
                        }\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` \nI guess not. Come back later if you change your mind.`,
                        timestamp: new Date(),
                    };

                    confirm.setDisabled().setStyle("SECONDARY");

                    cancel.setDisabled().setStyle("SECONDARY");

                    return buy_msg.edit({
                        embeds: [embed],
                        components: [row],
                    });
                }
            });
        } else {
            const hasItem = Object.keys(inventoryData.inventory).includes(
                item.item
            );
            if (!hasItem) {
                inventoryData.inventory[item.item] = buyamount;
            } else {
                inventoryData.inventory[item.item] =
                    inventoryData.inventory[item.item] + buyamount;
            }
            userData.wallet = userData.wallet - totalprice;

            await inventoryModel.findOneAndUpdate(params, inventoryData);
            await economyModel.findOneAndUpdate(params, userData);

            const embed = {
                color: "#A8FE97",
                title: `Purchase Receipt`,
                description: `**Item:** ${item.icon} \`${
                    item.item
                }\`\n**Quantity:** \`${buyamount.toLocaleString()}\`\n**Bought For:** \`❀ ${totalprice.toLocaleString()}\`\n**Each Bought For:** \`❀ ${item.price.toLocaleString()}\`\n**Now You Have:** \`${inventoryData.inventory[
                    item.item
                ].toLocaleString()}\``,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        }
    },
};
