const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const beg_data = require("../../data/beg_data");

const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

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

function randomizer(precent) {
    const randomnum = Math.floor(Math.random() * 10000);

    if (randomnum < precent) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("beg")
        .setDescription("Beg random strangers for coins."),
    cooldown: 45,
    cdmsg: `There is no one you can beg to right now, making money by begging isn't this easy!`,
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
        const searchidexrandom = Math.floor(Math.random() * beg_data.length);
        const beginteraction = beg_data[searchidexrandom];
        const resultsuccess = randomizer(beginteraction.successrate);
        const resultdeath = randomizer(beginteraction.deathrate);

        const params = {
            userId: interaction.user.id,
        };

        const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle(beginteraction.title);

        if (resultsuccess === true) {
            const maxcoins = beginteraction.maxcoins - beginteraction.mincoins;
            const mincoins = beginteraction.mincoins;
            const coins = Math.floor(Math.random() * maxcoins) + mincoins;
            const beg_result = beginteraction.description.replace(
                "COINS",
                coins.toLocaleString()
            );

            userData.wallet = userData.wallet + coins;

            if (beginteraction.items) {
                const ifgetitems = randomizer(beginteraction.itemsprecent);
                embed.setDescription(beg_result);
                if (ifgetitems === true) {
                    const itemnum = Math.floor(
                        Math.random() * beginteraction.items.length
                    );
                    const resultitem = allItems.find(
                        ({ item }) => item === beginteraction.items[itemnum]
                    );
                    const beg_resultitem =
                        beginteraction.itemdescription.replace(
                            "ITEM",
                            `${resultitem.icon} \`${resultitem.item}\``
                        );
                    embed.setDescription(`${beg_result}\n${beg_resultitem}`);

                    const hasItem = Object.keys(
                        inventoryData.inventory
                    ).includes(resultitem.item);
                    if (!hasItem) {
                        inventoryData.inventory[resultitem.item] = 1;
                    } else {
                        inventoryData.inventory[resultitem.item] =
                            inventoryData.inventory[resultitem.item] + 1;
                    }
                }
            }
        } else if (resultdeath === true) {
            userData.deaths = userData.deaths + 1;
            const lostcoins = userData.wallet;
            const dmdeathembed = new MessageEmbed().setColor("#FFA500");

            embed
                .setDescription(beginteraction.deathdescription)
                .setColor("RED");

            const hasLife = Object.keys(inventoryData.inventory).includes(
                "lifesaver"
            );
            if (!hasLife || inventoryData.inventory["lifesaver"] <= 0) {
                userData.wallet = userData.wallet - userData.wallet;
                dmdeathembed
                    .setTitle(`You died, rip. <:ghost:978412292012146688>`)
                    .setDescription(
                        `You didn't have any items to save you from this death. You lost your whole wallet.\n\nDeath: \`begging\`\nCoins Lost: \`❀ ${lostcoins.toLocaleString()}\``
                    );
            } else {
                inventoryData.inventory["lifesaver"] =
                    inventoryData.inventory["lifesaver"] - 1;
                dmdeathembed
                    .setColor("#edfaf1")
                    .setTitle(
                        `You were saved from death's grasps because of a lifesaver!`
                    )
                    .setDescription(
                        `Since you had a <:lifesaver:978754575098085426> \`lifesaver\` in your inventory, death was scared and ran away, but after the <:lifesaver:978754575098085426> \`lifesaver\` disappeared. Whew, close shave!\n\nDeath: \`begging\`\nAvoided Coin Loss: \`❀ ${lostcoins.toLocaleString()}\`\nLifes Left: <:lifesaver:978754575098085426> \`${inventoryData.inventory[
                            "lifesaver"
                        ].toLocaleString()}\``
                    );
            }

            client.users.fetch(interaction.user.id, false).then((user) => {
                user.send({ embeds: [dmdeathembed] });
            });
        } else {
            embed.setDescription(beginteraction.faildescription);
        }

        userData.bank.expbankspace =
            userData.bank.expbankspace + Math.floor(Math.random() * 69);
        userData.experiencepoints =
            userData.experiencepoints + Math.floor(Math.random() * 69);
        await economyModel.findOneAndUpdate(params, userData);
        await inventoryModel.findOneAndUpdate(params, inventoryData);

        interaction.reply({ embeds: [embed] });
        let cooldown = 45;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].beg = timpstamp;
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
