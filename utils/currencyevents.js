const { EmbedBuilder } = require("discord.js");

const {
    fetchEconomyData,
    fetchStatsData,
    fetchSettingsData,
    fetchUserData,
    fetchInventoryData,
} = require("./currencyfunctions");
const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");
const TipsModel = require("../models/tipsSchema");
const { dmuser } = require("./discordfunctions");
const {
    ri_watermelon,
    ri_prestigekey,
    ri_pillofxenon,
} = require("./itemremove");
const { fetchItemData } = require("./itemfunctions");
const { checkEventCooldown, setEventCooldown } = require("./mainfunctions");
const { es_fastestclick } = require("./minigamefunctions");

class Currencyevents {
    static async death_handler(
        client,
        userId,
        economyData,
        inventoryData,
        statsData,
        reason
    ) {
        statsData.deaths += 1;
        const lostcoins = economyData.wallet;
        const dmdeathembed = new EmbedBuilder().setColor("#FFA500");
        let hasLife;

        if (inventoryData.inventory !== {}) {
            hasLife = Object.keys(inventoryData.inventory).includes(
                "lifesaver"
            );
        }

        if (economyData.deaths <= 1) {
            dmdeathembed
                .setColor("#edfaf1")
                .setTitle(
                    `You were spared from death! <:lifesaver:978754575098085426>`
                )
                .setDescription(
                    `Since this is the first time you've almost died, Xenon decided to protect you from dying, but next time you really will die.\n**To prevent death, buy a lifesaver from the Xenon shop (\`/shop\`)**\n\nDeath: \`${reason}\`\nAvoided Coin Loss: \`❀ ${lostcoins.toLocaleString()}\``
                );
        } else if (!hasLife || inventoryData.inventory["lifesaver"] <= 0) {
            economyData.wallet = 0;
            dmdeathembed
                .setTitle(`You died, rip. <:ghost:978412292012146688>`)
                .setDescription(
                    `You didn't have any items to save you from this death. You lost your whole wallet.\n\nDeath: \`${reason}\`\nCoins Lost: \`❀ ${lostcoins.toLocaleString()}\``
                );
        } else {
            inventoryData.inventory["lifesaver"] -= 1;
            dmdeathembed
                .setColor("#edfaf1")
                .setTitle(
                    `You were saved from death's grasps because of a lifesaver! <:lifesaver:978754575098085426>`
                )
                .setDescription(
                    `Since you had a <:lifesaver:978754575098085426> \`lifesaver\` in your inventory, death was scared and ran away, but after the <:lifesaver:978754575098085426> \`lifesaver\` disappeared. Whew, close save!\n\nDeath: \`${reason}\`\nAvoided Coin Loss: \`❀ ${lostcoins.toLocaleString()}\`\nLifes Left: <:lifesaver:978754575098085426> \`${inventoryData.inventory[
                        "lifesaver"
                    ].toLocaleString()}\``
                );
        }

        await InventoryModel.findOneAndUpdate(
            { userId: userId },
            inventoryData
        );
        await StatsModel.findOneAndUpdate({ userId: userId }, statsData);

        await dmuser(client, userId, dmdeathembed);
    }

    static async backgroundupdates_handler(interaction, client, commandname) {
        function calcexpfull(level) {
            if (level < 50) {
                return level * 10 + 100;
            } else if (level >= 50 && level < 500) {
                return level * 25;
            } else if (level >= 500 && level < 1000) {
                return level * 50;
            } else if (level >= 1000) {
                return level * 100;
            }
        }
        const params = {
            userId: interaction.user.id,
        };

        const fetch_economyData = await fetchEconomyData(interaction.user.id);
        const fetch_statsData = await fetchStatsData(interaction.user.id);
        const fetch_settingsData = await fetchSettingsData(interaction.user.id);
        const fetch_userData = await fetchUserData(interaction.user.id);
        const economyData = fetch_economyData.data;
        const statsData = fetch_statsData.data;
        const settingsData = fetch_settingsData.data;
        const userData = fetch_userData.data;

        const experiencepoints = economyData.experiencepoints;
        const experiencefull = calcexpfull(economyData.level);
        if (experiencepoints >= experiencefull) {
            economyData.level = economyData.level + 1;
            economyData.experiencepoints = experiencepoints - experiencefull;
            if (settingsData.settings.levelupnotifications.status === true) {
                const hasdmed = await dmuser(
                    client,
                    interaction.user.id,
                    new EmbedBuilder()
                        .setColor(`#ffa159`)
                        .setTitle(
                            `Level Up! <a:streakflame:1008505222747922503>`
                        )
                        .setDescription(
                            `Good work ${
                                interaction.user.username
                            }! **You have reached level \`${economyData.level.toLocaleString()}\`!**`
                        )
                );
                if (hasdmed !== true) {
                    interaction.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(`#ffa159`)
                                .setDescription(
                                    `**<@${
                                        interaction.user.id
                                    }> has reached level \`${economyData.level.toLocaleString()}\`**`
                                ),
                        ],
                    });
                }
            }
        }

        if (Object.keys(userData.activeitems).length > 0) {
            Object.keys(userData.activeitems).forEach(async (activeitem) => {
                if (userData.activeitems[activeitem].expirydate <= Date.now()) {
                    if (activeitem === "watermelon") {
                        await ri_watermelon(client, interaction.user.id);
                    } else if (activeitem === "prestigekey") {
                        await ri_prestigekey(client, interaction.user.id);
                    } else if (activeitem === "pillofxenon") {
                        await ri_pillofxenon(client, interaction.user.id);
                    }
                }
            });
        }

        if (commandname === "help" || commandname === "commands") {
            return;
        } else {
            statsData.commands.all = statsData.commands.all + 1;

            const hasCommand = Object.keys(statsData.commands.list).includes(
                commandname
            );
            if (!hasCommand) {
                statsData.commands.list[commandname] = 1;
            } else {
                statsData.commands.list[commandname] =
                    statsData.commands.list[commandname] + 1;
            }
        }

        await StatsModel.findOneAndUpdate(params, statsData);
        await EconomyModel.findOneAndUpdate(params, economyData);
    }

    static async tips_handler(interaction, theme) {
        const fetch_settingsData = await fetchSettingsData(interaction.user.id);
        const tipsData = await TipsModel.find();
        const settingsData = fetch_settingsData.data;

        if (settingsData.settings.tips.status === false) {
            return;
        }
        const random_number = Math.floor(Math.random() * 100);
        if (random_number > 10) {
            return;
        }

        const tipsData_choosen =
            tipsData[Math.floor(Math.random() * tipsData.length)];

        const tip_msg = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setDescription(
                `<a:think_lightup:1013128619004018709> **\`TIP:\`** ${tipsData_choosen.description}`
            )
            .setFooter({
                text: `You can disable tips with the /usersettings command`,
            });

        return interaction.followUp({ embeds: [tip_msg], ephemeral: true });
    }

    static async eventspawn_handler(interaction, theme) {
        let spawnchance = 100;
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const inventoryData = inventoryData_fetch.data;
        if (
            inventoryData.inventory["finemedal"] &&
            inventoryData.inventory["finemedal"] >= 1
        ) {
            spawnchance += 500;
        }

        if (
            Math.floor(Math.random() * 10000) < spawnchance &&
            (await checkEventCooldown(interaction.user.id, "eventspawn"))
                .status !== true
        ) {
            const eventspawns = ["ancientscroll"];
            const choosenspawn =
                eventspawns[Math.floor(Math.random() * eventspawns.length)];
            await setEventCooldown(interaction.user.id, "eventspawn", 2400);

            if (choosenspawn === "ancientscroll") {
                await es_fastestclick(
                    interaction,
                    "Not ordinary paper, huh? It is old paper, ancient paper?",
                    "Ew what is this? Coffee paper? Who wants it cause I definitely don't!",
                    theme.embed.color,
                    "Mine",
                    "<a:ancientscroll:1014746011194904587>",
                    25,
                    "ancientscroll"
                );
            }
        }
    }
}

module.exports = Currencyevents;
