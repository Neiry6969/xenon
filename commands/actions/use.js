const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");

const { bankmessage, preniumcard, lootbox } = require("../../utils/useitem");
const letternumbers = require("../../reference/letternumber");

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
        .setName("use")
        .setDescription("Use a usable item.")
        .addStringOption((oi) => {
            return oi
                .setName("item")
                .setDescription("Specify an item you want to use.")
                .setRequired(true);
        })
        .addStringOption((oi) => {
            return oi
                .setName("quantity")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                );
        }),
    cdmsg: `Bruh chillax! The items aren't going anywhere.`,
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
        const allItems = itemData;

        const options = {
            item: interaction.options.getString("item"),
            amount: interaction.options.getString("quantity"),
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
        let useamount = options.amount?.toLowerCase();

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

        if (!inventoryData.inventory[item.item]) {
            errorembed.setDescription(
                `You don't own any of this item, how are you gonna use it?\n\nItem: ${item.icon} \`${item.item}\``
            );
            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        } else if (useamount === "max" || useamount === "all") {
            if (inventoryData.inventory[item.item] <= 0) {
                errorembed.setDescription(
                    `You don't own any of this item, how are you gonna use it?\n\nItem: ${item.icon} \`${item.item}\``
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                useamount = inventoryData.inventory[item.item];
            }
        } else if (!useamount) {
            useamount = 1;
        } else if (
            letternumbers.find((val) => val.letter === useamount.slice(-1))
        ) {
            if (parseInt(useamount.slice(0, -1))) {
                const number = parseFloat(useamount.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === useamount.slice(-1)
                ).number;
                useamount = number * numbermulti;
            } else {
                useamount = null;
            }
        } else {
            useamount = parseInt(useamount);
        }

        useamount = parseInt(useamount);

        if (!useamount || useamount < 0) {
            errorembed.setDescription(
                "You can only use a whole number of an item."
            );

            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        } else if (useamount === 0) {
            errorembed.setDescription(
                "So you want to use nothing, why bother?"
            );
            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        } else if (inventoryData.inventory[item.item] < useamount) {
            errorembed.setDescription(
                `You don't have enough coins in your wallet to buy that many of that item.\n\nItem: ${
                    item.icon
                } \`${
                    item.item
                }\`\nQuantity: \`${useamount.toLocaleString()}\`\n**You Have:** \`${inventoryData.inventory[
                    item.item
                ].toLocaleString()}\``
            );

            return interaction.reply({
                embeds: [errorembed],
                ephemeral: true,
            });
        }

        if (item.item === "bankmessage") {
            return bankmessage(
                interaction,
                userData,
                inventoryData,
                item,
                useamount
            );
        } else if (item.item === "premiumcard") {
            return preniumcard(interaction, userData, inventoryData, item);
        } else if (item.type === "lootbox") {
            return lootbox(interaction, inventoryData, item, useamount);
        }

        errorembed.setDescription(
            `That item isn't usable sorry not sorry.\n\nItem: ${item.icon} \`${item.item}\``
        );

        return interaction.reply({
            embeds: [errorembed],
            ephemeral: true,
        });
    },
};
