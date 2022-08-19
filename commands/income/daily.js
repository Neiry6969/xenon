const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    fetchStatsData,
    addItem,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { setCooldown, setProcessingLock } = require("../../utils/mainfunctions");
const StatsModel = require("../../models/statsSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Collect your daily rewards every 24 hours."),
    cooldown: 86400,
    cdmsg: "You already collected your daily rewards today.",
    async execute(interaction, client, theme) {
        const dailybaseamount = 100000;
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const statsData_fetch = await fetchStatsData(interaction.user.id);
        const economyData = economyData_fetch.data;
        const inventoryData = inventoryData_fetch.data;
        const statsData = statsData_fetch.data;
        let streak_coins = 0;

        if (!statsData.streaks.daily.lastclaimed) {
            statsData.streaks.daily.lastclaimed = Date.now();
        } else {
            const then = new Date(statsData.streaks.daily.lastclaimed);
            const now = new Date();

            const msBetweenDates = Math.abs(then.getTime() - now.getTime());
            const hoursBetweenDates = msBetweenDates / 1000 / 60 / 60;

            if (hoursBetweenDates > 48) {
                statsData.streaks.daily.strk = 0;
            } else {
                statsData.streaks.daily.strk = statsData.streaks.daily.strk + 1;
                streak_coins = statsData.streaks.daily.strk * 1800;
            }
            statsData.streaks.daily.lastclaimed = Date.now();
        }
        const totalamount = streak_coins + dailybaseamount;
        await addCoins(interaction.user.id, totalamount);
        await StatsModel.findOneAndUpdate(
            { userId: interaction.user.id },
            statsData
        );

        let rewards_display = `> *Rewards have been automatically transfered in your account, wait another 24 hours before claiming your daily reward again.*\n\n<a:heart_right:1009840455799820410> **Streak:** <a:streakflame:1008505222747922503> \`${statsData.streaks.daily.strk.toLocaleString()}\`\n<a:heart_right:1009840455799820410> **Coins:** \`❀ ${totalamount.toLocaleString()}\``;
        let item;
        if (statsData.streaks.daily.strk === 696) {
            item = `chestofgods`;
        } else if (statsData.streaks.daily.strk === 0) {
             item = `kfcchicken`;
        } else if (statsData.streaks.daily.strk % 100 === 0) {
            item = `chestofangelic`;
        } else if (statsData.streaks.daily.strk % 10 === 0) {
            item = `chestofcommon`;
        } else if (statsData.streaks.daily.strk % 50 === 0) {
            item = `chestofjade`;
        } else if (statsData.streaks.daily.strk === 69) {
            item = `sixymedal`;
        }

        if (item) {
            const itemData = await fetchItemData(item);
            await addItem(interaction.user.id, itemData.item, 1);
            rewards_display += `\n<a:heart_right:1009840455799820410> **Items:** ${
                itemData.icon
            } \`${itemData.item}\` \`x${1}\``;
        }

        const daily_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Daily`)
            .setDescription(rewards_display);

        interaction.reply({ embeds: [daily_embed] });
        return setCooldown(interaction, "daily", 86400, economyData);
    },
};
