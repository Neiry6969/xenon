const {
    Collection,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const lotteryModel = require("../../models/lotterySchema");
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

function rankingicons(rank) {
    if (rank === 1) {
        return "<:goldencrown:974761077269233664>";
    } else if (rank === 2) {
        return "<:silvercrown:974760964702490634>";
    } else if (rank === 3) {
        return "<:bronzecrown:974755534345490443>";
    } else {
        return "<a:fineribbon:968642962831589427>";
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lottery")
        .setDescription("Buy tickets to enter the hourly lottery.")
        .addStringOption((oi) => {
            return oi
                .setName("amount")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                );
        }),
    cooldown: 15,
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

        const lotteryticket_cost = 10000;
        const options = {
            amount: interaction.options.getString("amount"),
        };

        let cooldown = 25;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].lottery = timpstamp;
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

        let amount = options.amount?.toLowerCase();

        const errorembed = new MessageEmbed().setColor("#FF5C5C");

        if (amount === "max" || amount === "all") {
            if (userData.wallet < lotteryticket_cost) {
                errorembed.setDescription(
                    `You need at least \`❀ ${lotteryticket_cost.toLocaleString()}\` in your wallet to buy a lottery ticket`
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                amount = Math.floor(userData.wallet / lotteryticket_cost);
                if(amount > 1000) {
                    amount = 1000
                }
            }
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

        const totalprice = amount * lotteryticket_cost;

        if (!amount || amount < 0) {
            errorembed.setDescription(
                "You can only buy a whole number of lottery tickets."
            );

            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        } else if (amount === 0) {
            errorembed.setDescription("So you want to buy none, why bother?");
            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        } else if (userData.wallet < totalprice) {
            errorembed.setDescription(
                `You don't have enough coins in your wallet to buy that many of lottery tickets.\n\n**Quantity:** \`${amount.toLocaleString()}\`\n**Purchase Cost:** \`❀ ${totalprice.toLocaleString()}\`\n**Current Wallet:** \`❀ ${userData.wallet.toLocaleString()}\``
            );

            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        } else if (amount > 1000) {
            errorembed.setDescription(
                `You can't buy more than \`1,000\` **lottery tickets** in one go, bruh.`
            );

            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
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
            title: `Confirm purchase`,
            description: `<@${
                interaction.user.id
            }>, are you sure you want to buy **lottery tickets**\n\n**Quantity:** \`${amount.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (\`❀ ${lotteryticket_cost.toLocaleString()}\` for each)`,
            timestamp: new Date(),
        };
        await interaction.reply({
            embeds: [embed],
            components: [row],
        });
        const buylotteryticket_msg = await interaction.fetchReply();
        const collector = buylotteryticket_msg.createMessageComponentCollector({
            time: 20 * 1000,
        });
        userData.wallet = userData.wallet - totalprice;
        await economyModel.findOneAndUpdate(params, userData);
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
                const lotteryData = await lotteryModel.findOne({
                    lotteryId: "Tasdw8932ik",
                });

                

                const embed = {
                    color: "#A8FE97",
                    title: `Purchase Receipt`,
                    description: `You bought \`${amount.toLocaleString()}x\` **lottery tickets** for \`❀ ${totalprice.toLocaleString()}\` (\`❀ ${lotteryticket_cost.toLocaleString()}\` for each)`,
                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SUCCESS");

                cancel.setDisabled().setStyle("SECONDARY");

                buylotteryticket_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
                
                for (let i = 0; i < amount; i++) {
                    lotteryData.entrees.push(interaction.user.id);
                }

                return await lotteryModel.findOneAndUpdate(
                    {
                        lotteryId: "Tasdw8932ik",
                    },
                    lotteryData
                );
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
                userData.wallet = userData.wallet + totalprice;
                await economyModel.findOneAndUpdate(params, userData);
                const embed = {
                    color: "#FF0000",
                    title: `Purchase cancelled`,
                    description: `<@${
                        interaction.user.id
                    }>, are you sure you want to buy **lottery tickets**\n\n**Quantity:** \`${amount.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (\`❀ ${lotteryticket_cost.toLocaleString()}\` for each)\n\nI guess not, hook me up when you want to.`,
                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled();

                return buylotteryticket_msg.edit({
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

                userData.wallet = userData.wallet + totalprice;
                await economyModel.findOneAndUpdate(params, userData);

                const embed = {
                    color: "#FF0000",
                    title: `Purchase timeout`,
                    description: `<@${
                        interaction.user.id
                    }>, are you sure you want to buy **lottery tickets**\n\n**Quantity:** \`${amount.toLocaleString()}\`\n**Total Price:** \`❀ ${totalprice.toLocaleString()}\` (\`❀ ${lotteryticket_cost.toLocaleString()}\` for each)\n\nI guess not, hook me up when you want to.`,
                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled().setStyle("SECONDARY");

                return buylotteryticket_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
            }
        });
    },
};
