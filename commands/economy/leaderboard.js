const {
    Collection,
    ActionRowBuilder,
    SelectMenuBuilder,
    EmbedBuilder,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addItem,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { setCooldown, setProcessingLock } = require("../../utils/mainfunctions");

function rankingicons(rank) {
    if (rank === 1) {
        return "<:rank_gold:1010208515677237388>";
    } else if (rank === 2) {
        return "<:rank_silver:1010208521037545482>";
    } else if (rank === 3) {
        return "<:rank_bronze:1010208526758596709>";
    } else {
        return "<:rank_unranked:1010208532316037130>";
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Check the server's currency leaderboard."),
    cooldown: 15,
    async execute(interaction, client, theme) {
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;
        const collection = new Collection();
        const collection0 = new Collection();
        const collection1 = new Collection();
        const embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setTitle(`${interaction.guild.name} Currency Leaderboard`)
            .setDescription(
                `**Loading**, fetching cached users. This might take a while... <a:loading:987196796549861376>`
            )
            .setTimestamp();
        await interaction.reply({
            embeds: [embed],
        });
        const leaderboard_msg = await interaction.fetchReply();
        await Promise.all(
            interaction.guild.members.cache.map(async (member) => {
                const id = member.id;
                const userInventory = await fetchInventoryData(id);
                const itemsworth = userInventory.networth;

                return itemsworth > 10000 && member.user.bot === false
                    ? collection1.set(id, {
                          id,
                          itemsworth,
                      })
                    : null;
            })
        );
        await Promise.all(
            interaction.guild.members.cache.map(async (member) => {
                const id = member.id;
                const userInventory = await fetchInventoryData(id);
                const userEconomy = await fetchEconomyData(id);
                const networth = userInventory.networth + userEconomy.networth;
                return networth > 10000 && member.user.bot === false
                    ? collection0.set(id, {
                          id,
                          networth,
                      })
                    : null;
            })
        );
        await Promise.all(
            interaction.guild.members.cache.map(async (member) => {
                const id = member.id;
                const userEconomy = await fetchEconomyData(id);
                const netbalance = userEconomy.networth;
                return netbalance > 10000 && member.user.bot === false
                    ? collection.set(id, {
                          id,
                          netbalance,
                      })
                    : null;
            })
        );
        let data = collection
            .sort((a, b) => b.netbalance - a.netbalance)
            .first(10);
        let leaderboard = data
            .map((v, i) => {
                return `${rankingicons(
                    i + 1
                )} \`❀ ${v.netbalance?.toLocaleString()}\` ${
                    client.users.cache.get(v.id).tag
                }`;
            })
            .join("\n");
        let leaderboardmenu = new SelectMenuBuilder()
            .setCustomId("leaderboardmenu")
            .setMinValues(0)
            .setMaxValues(1)
            .addOptions([
                {
                    label: "Net Balance",
                    value: "netbalance",
                    default: true,
                },
                {
                    label: "Net Worth",
                    value: "networth",
                },
                {
                    label: "Inventory Worth",
                    value: "inventoryworth",
                },
            ]);
        let row = new ActionRowBuilder().addComponents(leaderboardmenu);
        embed
            .setColor(theme.embed.color)
            .setTitle(`${interaction.guild.name}`)
            .setDescription(
                `Leaderboard: **\`Net Balance\`**\n\n${
                    leaderboard
                        ? leaderboard
                        : "There is no leaderboard. This can also be because members have not been cached."
                }`
            );
        await leaderboard_msg.edit({ embeds: [embed], components: [row] });
        const collector = await leaderboard_msg.createMessageComponentCollector(
            {
                idle: 30 * 1000,
            }
        );
        collector.on("collect", async (i) => {
            if (i.user.id != interaction.user.id) {
                return i.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }
            i.deferUpdate();
            if (i.customId === "leaderboardmenu") {
                if (i.values[0] === "networth") {
                    data = collection0
                        .sort((a, b) => b.networth - a.networth)
                        .first(10);
                    leaderboard = data
                        .map((v, i) => {
                            return `${rankingicons(
                                i + 1
                            )} \`❀ ${v.networth?.toLocaleString()}\` ${
                                client.users.cache.get(v.id).tag
                            }`;
                        })
                        .join("\n");
                    embed
                        .setTitle(`${interaction.guild.name}`)
                        .setDescription(
                            `Leaderboard: **\`Net Worth\`**\n\n${
                                leaderboard
                                    ? leaderboard
                                    : "There is no leaderboard. This can also be because members have not been cached."
                            }`
                        )
                        .setColor(theme.embed.color);
                    leaderboardmenu = new SelectMenuBuilder()
                        .setCustomId("leaderboardmenu")
                        .setMinValues(0)
                        .setMaxValues(1)
                        .addOptions([
                            {
                                label: "Net Balance",
                                value: "netbalance",
                            },
                            {
                                label: "Net Worth",
                                value: "networth",
                                default: true,
                            },
                            {
                                label: "Inventory Worth",
                                value: "inventoryworth",
                            },
                        ]);
                    row = new ActionRowBuilder().addComponents(leaderboardmenu);
                    leaderboard_msg.edit({
                        embeds: [embed],
                        components: [row],
                    });
                } else if (i.values[0] === "inventoryworth") {
                    data = collection1
                        .sort((a, b) => b.itemsworth - a.itemsworth)
                        .first(10);
                    leaderboard = data
                        .map((v, i) => {
                            return `${rankingicons(
                                i + 1
                            )} \`❀ ${v.itemsworth?.toLocaleString()}\` ${
                                client.users.cache.get(v.id).tag
                            }`;
                        })
                        .join("\n");
                    embed
                        .setTitle(`${interaction.guild.name}`)
                        .setDescription(
                            `Leaderboard: **\`Net Inventory Worth\`**\n\n${
                                leaderboard
                                    ? leaderboard
                                    : "There is no leaderboard. This can also be because members have not been cached."
                            }`
                        )
                        .setColor(theme.embed.color);
                    leaderboardmenu = new SelectMenuBuilder()
                        .setCustomId("leaderboardmenu")
                        .setMinValues(0)
                        .setMaxValues(1)
                        .addOptions([
                            {
                                label: "Net Balance",
                                value: "netbalance",
                            },
                            {
                                label: "Net Worth",
                                value: "networth",
                            },
                            {
                                label: "Inventory Worth",
                                value: "inventoryworth",
                                default: true,
                            },
                        ]);
                    row = new ActionRowBuilder().addComponents(leaderboardmenu);
                    leaderboard_msg.edit({
                        embeds: [embed],
                        components: [row],
                    });
                } else if (i.values[0] === "netbalance") {
                    data = collection
                        .sort((a, b) => b.netbalance - a.netbalance)
                        .first(10);
                    leaderboard = data
                        .map((v, i) => {
                            return `${rankingicons(
                                i + 1
                            )} \`❀ ${v.netbalance?.toLocaleString()}\` ${
                                client.users.cache.get(v.id).tag
                            }`;
                        })
                        .join("\n");
                    embed
                        .setColor(theme.embed.color)
                        .setTitle(`${interaction.guild.name}`)
                        .setDescription(
                            `Leaderboard: **\`Net Balance\`**\n\n${
                                leaderboard
                                    ? leaderboard
                                    : "There is no rich people in this server rip. This can also be because members have not been cached."
                            }`
                        );
                    leaderboardmenu = new SelectMenuBuilder()
                        .setCustomId("leaderboardmenu")
                        .setMinValues(0)
                        .setMaxValues(1)
                        .addOptions([
                            {
                                label: "Net Balance",
                                value: "netbalance",
                                default: true,
                            },
                            {
                                label: "Net Worth",
                                value: "networth",
                            },
                            {
                                label: "Inventory Worth",
                                value: "inventoryworth",
                            },
                        ]);
                    row = new ActionRowBuilder().addComponents(leaderboardmenu);
                    leaderboard_msg.edit({
                        embeds: [embed],
                        components: [row],
                    });
                }
            }
        });
        collector.on("end", (collected) => {
            leaderboardmenu.setDisabled();
            leaderboard_msg.edit({
                embeds: [embed],
                components: [row],
            });
        });
        return setCooldown(interaction, "leaderboard", 15, economyData);
    },
};
