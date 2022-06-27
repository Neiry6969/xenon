const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const allItems = require("../../data/all_items");

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

const lowest = ["worm", "rat", "rock"];
const lowmid = ["snail", "lizard", "chestofwooden"];
const highmid = ["scorpion"];
const high = ["statue", "bronzecrown"];

function dig() {
    const number = Math.floor(Math.random() * 10000);
    if (number <= 5000) {
        return `You weren't able to dig anything, just bad luck.`;
    } else if (number <= 8000 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if (number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if (number <= 9990 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if (number > 9990) {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dig")
        .setDescription("Dig for treasures."),
    cooldown: 35,
    cdmsg: "You are too tired to be digging so much.",
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData
    ) {
        const params = {
            userId: interaction.user.id,
        };
        const shovel = allItems.find(
            (val) => val.item.toLowerCase() === "shovel"
        );
        const result = dig();
        if (
            !inventoryData.inventory[shovel.item] ||
            inventoryData.inventory[shovel.item] === 0 ||
            !userData
        ) {
            const embed = {
                color: "RANDOM",
                title: `Dig Error ${shovel.icon}`,
                description: `You need atleast \`1\` ${shovel.item} ${shovel.icon} to go digging. Use this command again when you have one.`,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        } else {
            if (result === `You weren't able to dig anything, just bad luck.`) {
                const embed = {
                    color: "RANDOM",
                    title: `${interaction.user.username} went for a dig ${shovel.icon}`,
                    description: result,
                    timestamp: new Date(),
                };

                interaction.reply({ embeds: [embed] });
            } else {
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === result
                );
                const hasItem = Object.keys(inventoryData.inventory).includes(
                    item.item
                );
                if (!hasItem) {
                    inventoryData.inventory[item.item] = 1;
                } else {
                    inventoryData.inventory[item.item] =
                        inventoryData.inventory[item.item] + 1;
                }

                const expbankspace_amount =
                    Math.floor(Math.random() * 1000) + 100;
                const experiencepoints_amount = Math.floor(
                    expbankspace_amount / 100
                );
                userData.bank.expbankspace =
                    userData.bank.expbankspace + expbankspace_amount;
                userData.experiencepoints =
                    userData.experiencepoints + experiencepoints_amount;
                userData.bank.expbankspace =
                    userData.bank.expbankspace + Math.floor(Math.random() * 69);
                await inventoryModel.findOneAndUpdate(params, inventoryData);
                await economyModel.findOneAndUpdate(params, userData);

                const embed = {
                    color: "RANDOM",
                    title: `${interaction.user.username} went for a dig ${shovel.icon}`,
                    description: `You pulled something out of the ground! You got a \`${item.item}\` ${item.icon}`,
                    timestamp: new Date(),
                };

                interaction.reply({ embeds: [embed] });
            }
            let cooldown = 35;
            if (
                interaction.guild.id === "852261411136733195" ||
                interaction.guild.id === "978479705906892830" ||
                userData.premium.rank >= 1
            ) {
                cooldown = premiumcooldowncalc(cooldown);
            }
            const cooldown_amount = cooldown * 1000;
            const timpstamp = Date.now() + cooldown_amount;
            jsoncooldowns[interaction.user.id].dig = timpstamp;
            fs.writeFile(
                "./cooldowns.json",
                JSON.stringify(jsoncooldowns),
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        }
    },
};
