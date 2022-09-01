const {
    MessageEmbed,
    MessageSelectMenu,
    MessageActionRow,
    MessageButton,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addItem,
    fetchUserData,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const {
    setCooldown,
    setProcessingLock,
    checkEventCooldown,
} = require("../../utils/mainfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("prestige")
        .setDescription("Prestige to reset and gain prestige rewards."),
    cooldown: 5,
    async execute(interaction, client, theme) {
        let endinteraction;
        let error_message;
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;
        const prestigecooldown = await checkEventCooldown(
            interaction.user.id,
            "prestige"
        );
        const prestige_requirements = {
            bankcoins: false,
            itemworth: false,
            level: false,
            nocooldown: false,
        };
        const prestige_bankcoins = 1000000 * (economyData.prestige + 1);
        const prestige_itemworth = 2500000 * (economyData.prestige + 1);
        const prestige_level = 150 * (economyData.prestige + 1);

        if (economyData.bank.coins >= prestige_bankcoins) {
            prestige_requirements.bankcoins = true;
        }

        if (inventory_fetch.networth >= prestige_itemworth) {
            prestige_requirements.itemworth = true;
        }

        if (economyData.level >= prestige_level) {
            prestige_requirements.level = true;
        }

        if (prestigecooldown.status !== true) {
            prestige_requirements.nocooldown = true;
        }

        const prestige_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Prestige`)
            .setDescription(
                `${
                    prestige_requirements.bankcoins === true
                        ? `<:box_tick_green:1010681417656696902> Bank Coins: \`❀ ${economyData.bank.coins.toLocaleString()} / ${prestige_bankcoins.toLocaleString()}\``
                        : `<:box_cross_red:1010681410610278431> **Bank Coins: \`❀ ${economyData.bank.coins.toLocaleString()} / ${prestige_bankcoins.toLocaleString()}\`**`
                }\n${
                    prestige_requirements.itemworth === true
                        ? `<:box_tick_green:1010681417656696902> Item Net Worth: \`❀ ${inventory_fetch.networth.toLocaleString()} / ${prestige_itemworth.toLocaleString()}\``
                        : `<:box_cross_red:1010681410610278431> **Item Net Worth: \`❀ ${inventory_fetch.networth.toLocaleString()} / ${prestige_itemworth.toLocaleString()}\`**`
                }\n${
                    prestige_requirements.level === true
                        ? `<:box_tick_green:1010681417656696902> Level: \`${economyData.level.toLocaleString()} / ${prestige_level.toLocaleString()}\``
                        : `<:box_cross_red:1010681410610278431> **Level: \`${economyData.level.toLocaleString()} / ${prestige_level.toLocaleString()}\`**`
                }\n${
                    prestige_requirements.nocooldown === true
                        ? `<:box_tick_green:1010681417656696902> No Prestige Cooldown`
                        : `<:box_cross_red:1010681410610278431> **Ready: <t:${Math.floor(
                              prestigecooldown.rawcooldown
                          )}:R>**`
                }`
            );

        interaction.reply({ embeds: [prestige_embed] });
    },
};
