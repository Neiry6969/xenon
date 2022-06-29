const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");

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

const lowest = ["shrimp", "crab", "fish"];
const lowmid = ["lobster", "squid"];
const highmid = ["whale", "dolphin", "shark"];
const high = ["losttrident"];

function fish() {
    const number = Math.floor(Math.random() * 10000);
    if (number <= 6000) {
        return `You weren't able to catch anything.`;
    } else if (number <= 8000 && number > 6000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if (number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if (number <= 9999 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if (number > 9999) {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fish")
        .setDescription("Go fishing for fishies."),
    cooldown: 35,
    cdmsg: "Theres no fish in these waters right now!",
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
        const params = {
            userId: interaction.user.id,
        };
        const fishingrod = allItems.find(
            (val) => val.item.toLowerCase() === "fishingrod"
        );

        const result = fish();
        if (
            !inventoryData.inventory[fishingrod.item] ||
            inventoryData.inventory[fishingrod.item] === 0 ||
            !userData
        ) {
            const embed = {
                color: "RANDOM",
                title: `Fishing Error ${fishingrod.icon}`,
                description: `You need atleast \`1\` ${fishingrod.item} ${fishingrod.icon} to go fishing. Use this command again when you have one.`,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        } else {
            if (result === `You weren't able to catch anything.`) {
                const embed = {
                    color: "RANDOM",
                    title: `${interaction.user.username} went for a fish ${fishingrod.icon}`,
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
                    title: `${interaction.user.username} went for a fish ${fishingrod.icon}`,
                    description: `You were able to catch something! You got a \`${item.item}\` ${item.icon}`,
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
            jsoncooldowns[interaction.user.id].fish = timpstamp;
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
