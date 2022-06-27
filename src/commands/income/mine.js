const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const allItems = require("../../data/all_items");

const jsoncooldowns = require("../../../cooldowns.json");
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

let amount;

const lowest = [
    {
        item: "rock",
        maxamount: 25,
    },
    {
        item: "shardofsteel",
        maxamount: 20,
    },
];
const lowmid = [
    {
        item: "shardofsteel",
        maxamount: 30,
    },
    {
        item: "shardofuranium",
        maxamount: 12,
    },
    {
        item: "shardofcopper",
        maxamount: 18,
    },
];
const highmid = [
    {
        item: "shardofaluminum",
        maxamount: 10,
    },
    {
        item: "shardofgold",
        maxamount: 5,
    },
];
const high = [
    {
        item: "shardofdiamond",
        maxamount: 3,
    },
    {
        item: "enhancedpickaxe",
        maxamount: 1,
    },
];

function mine() {
    const number = Math.floor(Math.random() * 10000);
    if (number <= 5000) {
        return `You weren't able to mine anything, unlucky.`;
    } else if (number <= 8300 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);
        amount = Math.floor(Math.random() * lowest[result].maxamount) + 1;

        return lowest[result].item;
    } else if (number <= 9800 && number > 8300) {
        const result = Math.floor(Math.random() * lowmid.length);
        amount = Math.floor(Math.random() * lowmid[result].maxamount) + 1;

        return lowmid[result].item;
    } else if (number <= 9999 && number > 9800) {
        const result = Math.floor(Math.random() * highmid.length);
        amount = Math.floor(Math.random() * highmid[result].maxamount) + 1;

        return highmid[result].item;
    } else if (number > 9999) {
        const result = Math.floor(Math.random() * high.length);
        amount = Math.floor(Math.random() * high[result].maxamount) + 1;

        return high[result].item;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mine")
        .setDescription("Go mining for exotic materials/substances."),
    cooldown: 120,
    cdmsg: "I am not going let you mine anymore, you need rest!",
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

        const pickaxe = allItems.find(
            (val) => val.item.toLowerCase() === "pickaxe"
        );

        const result = mine();

        if (
            !inventoryData.inventory[pickaxe.item] ||
            inventoryData.inventory[pickaxe.item] === 0 ||
            !userData
        ) {
            const embed = {
                color: "RANDOM",
                title: `Mine Error ${pickaxe.icon}`,
                description: `You need atleast \`1\` ${pickaxe.item} ${pickaxe.icon} to go minning. Use this command again when you have one.`,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        } else {
            if (result === `You weren't able to mine anything, unlucky.`) {
                const embed = {
                    color: "RANDOM",
                    title: `${interaction.user.username} went for a mine ${pickaxe.icon}`,
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
                    inventoryData.inventory[item.item] = amount;
                } else {
                    inventoryData.inventory[item.item] =
                        inventoryData.inventory[item.item] + amount;
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
                    title: `${interaction.user.username} went for a mine ${pickaxe.icon}`,
                    description: `Nice find! You got [\`${amount.toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug) \`${
                        item.item
                    }\` ${item.icon}`,
                    timestamp: new Date(),
                };

                interaction.reply({ embeds: [embed] });
            }
            let cooldown = 120;
            if (
                interaction.guild.id === "852261411136733195" ||
                interaction.guild.id === "978479705906892830" ||
                userData.premium.rank >= 1
            ) {
                cooldown = premiumcooldowncalc(cooldown);
            }
            const cooldown_amount = cooldown * 1000;
            const timpstamp = Date.now() + cooldown_amount;
            jsoncooldowns[interaction.user.id].mine = timpstamp;
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
