const {
    EmbedBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ButtonBuilder,
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
    setEventCooldown,
} = require("../../utils/mainfunctions");
const EconomyModel = require("../../models/economySchema");
const InventoryModel = require("../../models/inventorySchema");
const UserModel = require("../../models/userSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("prestige")
        .setDescription("Prestige to reset and gain prestige rewards."),
    cooldown: 5,
    async execute(interaction, client, theme) {
        let endinteraction;
        const allItems = await fetchAllitemsData();
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const userData_fetch = await fetchUserData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;
        const userData = userData_fetch.data;
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
        const prestige_bankcoins = 25000000 * (economyData.prestige + 1);
        const prestige_itemworth = 75000000 * (economyData.prestige + 1);
        const prestige_level = 200 * (economyData.prestige + 1);

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

        const prestigerewards = ["prestigekey", "prestigecrate"];
        const prestigerewards_display = prestigerewards
            .map((reward) => {
                const itemData = allItems.find(
                    (val) => val.item.toLowerCase() === reward
                );
                return `\`>\` \`${1}x\` ${itemData.icon} ${itemData.item}`;
            })
            .join("\n");

        const prestige_embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Prestige`)
            .setDescription(
                `**Prestige \`${
                    economyData.prestige + 1
                }\` Requirements:**\n\n${
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
                        ? `<:box_tick_green:1010681417656696902> \`No prestige cooldown\``
                        : `<:box_cross_red:1010681410610278431> **Prestige Cooldown Ready: <t:${Math.floor(
                              prestigecooldown.rawcooldown / 1000
                          )}:R>**`
                }`
            );

        const endinteraction_button = new ButtonBuilder()
            .setCustomId("endinteraction")
            .setStyle("SECONDARY")
            .setLabel(`End Interaction`);
        const prestige_button = new ButtonBuilder()
            .setCustomId("prestigebutton")
            .setEmoji(`<:prestigekey:1014977553695526954>`)
            .setStyle("SECONDARY")
            .setLabel(`Prestige`)
            .setDisabled();
        const prestige_row = new ActionRowBuilder().setComponents(
            prestige_button
        );

        if (
            prestige_requirements.bankcoins === true &&
            prestige_requirements.itemworth === true &&
            prestige_requirements.level === true &&
            prestige_requirements.nocooldown === true
        ) {
            prestige_button.setDisabled(false).setStyle("PRIMARY");
            prestige_row.addComponents(endinteraction_button);
        }
        interaction.reply({
            embeds: [prestige_embed],
            components: [prestige_row],
        });

        if (
            prestige_requirements.bankcoins === true &&
            prestige_requirements.itemworth === true &&
            prestige_requirements.level === true &&
            prestige_requirements.nocooldown === true
        ) {
            const prestige_msg = await interaction.fetchReply();
            const collector = prestige_msg.createMessageComponentCollector({
                time: 20 * 1000,
            });

            setProcessingLock(interaction.user.id, true);
            collector.on("collect", async (button) => {
                if (button.user.id != interaction.user.id) {
                    return button.reply({
                        content: "This is not for you.",
                        ephemeral: true,
                    });
                }

                button.deferUpdate();

                if (button.customId === "endinteraction") {
                    collector.stop();
                } else if (button.customId === "prestigebutton") {
                    endinteraction = true;
                    prestige_embed
                        .setDescription(
                            `**Prestige Successful**\n\`${
                                economyData.prestige
                            } ➜ ${
                                economyData.prestige + 1
                            }\`\n\nRewards:\n${prestigerewards_display}`
                        )
                        .setColor(`95ff87`);

                    endinteraction_button.setDisabled();
                    prestige_button.setDisabled().setStyle("SUCCESS");

                    prestige_msg.edit({
                        embeds: [prestige_embed],
                        components: [prestige_row],
                    });

                    inventoryData.inventory = {
                        prestigecrate: 1,
                        prestigekey: 1,
                    };
                    economyData.wallet = 0;
                    economyData.bank.coins = 0;
                    economyData.bank.expbankspace = 0;
                    economyData.experiencepoints = 0;
                    economyData.level = 0;
                    economyData.prestige += 1;
                    userData.activeitems = {};
                    userData.cosmetics = { embedcolors: [] };
                    await EconomyModel.findOneAndUpdate(
                        { userId: economyData.userId },
                        economyData
                    );
                    await InventoryModel.findOneAndUpdate(
                        { userId: inventoryData.userId },
                        inventoryData
                    );
                    await UserModel.findOneAndUpdate(
                        { userId: userData.userId },
                        userData
                    );
                    await setEventCooldown(
                        interaction.user.id,
                        "prestige",
                        86400
                    );
                    setProcessingLock(interaction.user.id, false);
                    collector.stop();
                }
            });

            collector.on("end", async (collected) => {
                setProcessingLock(interaction.user.id, false);
                if (endinteraction === true) {
                } else {
                    prestige_button.setDisabled();
                    endinteraction_button.setDisabled();

                    return prestige_msg.edit({
                        embeds: [prestige_embed],
                        components: [prestige_row],
                    });
                }
            });

            return setCooldown(interaction, "prestige", 5, economyData);
        }
    },
};
