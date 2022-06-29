const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const letternumbers = require("../../reference/letternumber");
const interactionproccesses = require("../../interactionproccesses.json");

const jsoncooldowns = require("../../cooldowns.json");
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
        .setName("share")
        .setDescription("Share coins with another user.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("Specify the user you want to gift to.")
                .setRequired(true);
        })
        .addStringOption((oi) => {
            return oi
                .setName("amount")

                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                )
                .setRequired(true);
        }),
    cooldown: 10,
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData
    ) {
        const options = {
            user: interaction.options.getUser("user"),
            amount: interaction.options.getString("amount"),
        };

        const target = options.user;
        let amount = options.amount?.toLowerCase();
        const errorembed = new MessageEmbed().setColor("#FF5C5C");

        const params = {
            userId: interaction.user.id,
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
        jsoncooldowns[interaction.user.id].share = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
        if (target.id === interaction.user.id) {
            errorembed.setDescription(
                `You can't share coins with yourself!\n${expectedsyntax}`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (userData.wallet <= 0) {
            if (userData.bank.coins <= 0) {
                errorembed.setDescription(
                    `You got no coins in your wallet or your bank to share, your broke :c.`
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                errorembed.setDescription(
                    `You got no coins in your wallet to share, maybe withdraw some?`
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            }
        }

        if (amount === "max" || amount === "all") {
            amount = userData.wallet;
        } else if (amount === "half") {
            amount = Math.floor(userData.wallet / 2);
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

        if (amount === 0) {
            errorembed.setDescription(
                "So you want to share nothing, pretend you did that in your mind"
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (!amount || amount < 0 || amount % 1 != 0) {
            errorembed.setDescription("Share amount must be a whole number.");
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (amount > userData.wallet) {
            if (amount < userData.bank.coins + userData.wallet) {
                errorembed.setDescription(
                    `You don't have that amount of coins to give from your wallet, maybe withdraw some?`
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                errorembed.setDescription(
                    `You don't have that amount of coins to give from your wallet or your bank.`
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            }
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

        const embed = {
            color: "RANDOM",
            author: {
                name: `_____________`,
                icon_url: `${interaction.user.displayAvatarURL()}`,
            },
            title: `Confirm action`,
            description: `<@${
                interaction.user.id
            }>, do you want to share \`❀ ${amount.toLocaleString()}\` to <@${
                target.id
            }>?`,
            timestamp: new Date(),
        };
        await interaction.reply({
            embeds: [embed],
            components: [row],
        });

        const share_msg = await interaction.fetchReply();

        const collector = share_msg.createMessageComponentCollector({
            time: 20 * 1000,
        });

        const target_profileData = await economyModel.findOne({
            userId: target.id,
        });
        let target_profileData_coins;
        if (!target_profileData) {
            profile = await economyModel.create({
                userId: target.id,
                wallet: amount,
            });
            profile.save();
            target_profileData_coins = amount;
        } else {
            await economyModel.findOneAndUpdate(
                { userId: target.id },
                {
                    $inc: {
                        wallet: amount,
                    },
                },
                {
                    upsert: true,
                }
            );
            target_profileData_coins = target_profileData.wallet + amount;
        }

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
        userData.interactionproccesses.interaction = true;
        userData.interactionproccesses.proccessingcoins = true;
        userData.wallet = userData.wallet - amount;
        await economyModel.updateOne(params, userData);

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

                await economyModel.updateOne(params, userData);
                const embed = {
                    color: "#00FF00",
                    author: {
                        name: `_____________`,
                        icon_url: `${interaction.user.displayAvatarURL()}`,
                    },
                    title: `Transaction success, here is the receipt`,
                    description: `<@${
                        interaction.user.id
                    }> shared \`❀ ${amount.toLocaleString()}\` to <@${
                        target.id
                    }>`,
                    fields: [
                        {
                            name: `${interaction.user.username}`,
                            value: `**New Wallet:** \`❀ ${(
                                userData.wallet - amount
                            ).toLocaleString()}\``,
                            inline: true,
                        },
                        {
                            name: `${target.username}`,
                            value: `**New Wallet:** \`❀ ${target_profileData_coins.toLocaleString()}\``,
                        },
                    ],
                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SUCCESS");

                cancel.setDisabled().setStyle("SECONDARY");

                share_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
            } else if (button.customId === "cancel") {
                await economyModel.findOneAndUpdate(
                    { userId: target.id },
                    {
                        $inc: {
                            wallet: -amount,
                        },
                    },
                    {
                        upsert: true,
                    }
                );
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
                userData.wallet = userData.wallet + amount;
                await economyModel.updateOne(params, userData);

                const embed = {
                    color: "#FF0000",
                    author: {
                        name: `_____________`,
                        icon_url: `${interaction.user.displayAvatarURL()}`,
                    },
                    title: `Action cancelled`,
                    description: `<@${
                        interaction.user.id
                    }>, do you want to share \`❀ ${amount.toLocaleString()}\` to <@${
                        target.id
                    }>?\nI guess not...`,
                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled();

                share_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
            }
        });

        collector.on("end", async (collected) => {
            if (collected.size > 0) {
            } else {
                await economyModel.findOneAndUpdate(
                    { userId: target.id },
                    {
                        $inc: {
                            wallet: -amount,
                        },
                    },
                    {
                        upsert: true,
                    }
                );
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
                userData.wallet = userData.wallet + amount;
                await economyModel.updateOne(params, userData);
                const embed = {
                    color: "#FF0000",
                    author: {
                        name: `_____________`,
                        icon_url: `${interaction.user.displayAvatarURL()}`,
                    },
                    title: `Action timeout`,
                    description: `<@${
                        interaction.user.id
                    }>, do you want to share \`❀ ${amount.toLocaleString()}\` to <@${
                        target.id
                    }>?\nI guess not...`,
                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled().setStyle("SECONDARY");

                share_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
            }
        });
    },
};
