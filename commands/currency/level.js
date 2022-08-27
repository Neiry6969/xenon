const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    fetchStatsData,
} = require("../../utils/currencyfunctions");
const { setCooldown } = require("../../utils/mainfunctions");

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
function bardisplay(percent) {
    if (percent <= 20) {
        const bar =
            "<:barmidempty:975528569881104385><:barmidempty:975528569881104385><:barmidempty:975528569881104385><:barendempty:975529693640028211>";
        const leftperc = 20 - percent;
        if (leftperc > 15) {
            return "<:barstartempty:975528227214876713>" + bar;
        } else if (leftperc > 10) {
            return "<:barstartlow:975528109900197990>" + bar;
        } else if (leftperc > 5) {
            return "<:barstartmid:975527911522181150>" + bar;
        } else if (leftperc > 0) {
            return "<:barstarthigh:975527916836360294>" + bar;
        } else if (leftperc === 0) {
            return "<:barstartfull:975526638831955968>" + bar;
        }
    } else if (percent <= 40) {
        const bars = "<:barstartfull:975526638831955968>";
        const bare =
            "<:barmidempty:975528569881104385><:barmidempty:975528569881104385><:barendempty:975529693640028211>";
        const leftperc = 40 - percent;
        if (leftperc > 15) {
            return bars + "<:barmidempty:975528569881104385>" + bare;
        } else if (leftperc > 10) {
            return bars + "<:barmidlow:975527412676849674>" + bare;
        } else if (leftperc > 5) {
            return bars + "<:barmidmid:975527288768696400>" + bare;
        } else if (leftperc > 0) {
            return bars + "<:barmidhigh:975526979598180412>" + bare;
        } else if (leftperc === 0) {
            return bars + "<:barmidfull:975526638697734237>" + bare;
        }
    } else if (percent <= 60) {
        const bars =
            "<:barstartfull:975526638831955968><:barmidfull:975526638697734237>";
        const bare =
            "<:barmidempty:975528569881104385><:barendempty:975529693640028211>";
        const leftperc = 60 - percent;
        if (leftperc > 15) {
            return bars + "<:barmidempty:975528569881104385>" + bare;
        } else if (leftperc > 10) {
            return bars + "<:barmidlow:975527412676849674>" + bare;
        } else if (leftperc > 5) {
            return bars + "<:barmidmid:975527288768696400>" + bare;
        } else if (leftperc > 0) {
            return bars + "<:barmidhigh:975526979598180412>" + bare;
        } else if (leftperc === 0) {
            return bars + "<:barmidfull:975526638697734237>" + bare;
        }
    } else if (percent <= 80) {
        const bars =
            "<:barstartfull:975526638831955968><:barmidfull:975526638697734237><:barmidfull:975526638697734237>";
        const bare = "<:barendempty:975529693640028211>";
        const leftperc = 80 - percent;
        if (leftperc > 15) {
            return bars + "<:barmidempty:975528569881104385>" + bare;
        } else if (leftperc > 10) {
            return bars + "<:barmidlow:975527412676849674>" + bare;
        } else if (leftperc > 5) {
            return bars + "<:barmidmid:975527288768696400>" + bare;
        } else if (leftperc > 0) {
            return bars + "<:barmidhigh:975526979598180412>" + bare;
        } else if (leftperc === 0) {
            return bars + "<:barmidfull:975526638697734237>" + bare;
        }
    } else if (percent <= 100) {
        const bar =
            "<:barstartfull:975526638831955968><:barmidfull:975526638697734237><:barmidfull:975526638697734237><:barmidfull:975526638697734237>";
        const leftperc = 100 - percent;
        if (leftperc > 15) {
            return bar + "<:barendempty:975529693640028211>";
        } else if (leftperc > 10) {
            return bar + "<:barendlow:975533190930391060>";
        } else if (leftperc > 5) {
            return bar + "<:barendmid:975533190934585374>";
        } else if (leftperc >= 0) {
            return bar + "<:barendhigh:975533190980730901>";
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Check a user's level stats.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("Specify a user's level stats you want to see");
        }),
    cooldown: 5,
    async execute(interaction, client, theme) {
        const options = {
            user: interaction.options.getUser("user"),
        };

        let user = options.user || interaction.user;

        const level_embed = new MessageEmbed()
            .setTitle("Level")
            .setColor(theme.embed.color);

        const economyData = await fetchEconomyData(user.id);
        const inventoryData = await fetchInventoryData(user.id);
        const statsData = await fetchStatsData(user.id);
        const uniqueitems = inventoryData.uniqueitems;
        const items = inventoryData.items;
        const networth = economyData.networth + inventoryData.networth;
        const expbankspace = economyData.data.bank.expbankspace;
        const otherbankspace = economyData.data.bank.otherbankspace;
        const bankmessagespace = economyData.data.bank.bankmessagespace;
        const premiumrank = economyData.data.premium.rank;
        const badges = economyData.data.premium.rank;
        const level = economyData.data.level;
        const experiencepoints = economyData.data.experiencepoints;
        const walletcoins = economyData.data.wallet;
        const bankcoins = economyData.data.bank.coins;
        const dailystreak = statsData.data.streaks.daily.strk;
        const deaths = statsData.data.deaths;
        const createdat = economyData.data.createdAt;
        const totalcommands = statsData.data.commands.all;

        level_embed
            .setAuthor({
                name: `${user.tag}`,
                iconURL: user.displayAvatarURL(),
            })
            .setDescription(
                `${
                    premiumrank > 0
                        ? `**Premium:** <:premiumcard:970846275975118958> \`rank ${premiumrank}\`\n`
                        : ""
                }${
                    badges.length > 0 ? "**Badges:**\n" : ""
                }\n**Prestige:** \`${economyData.data.prestige.toLocaleString()}\``
            )
            .setFields(
                {
                    name: "Level",
                    value: `Level: \`${level.toLocaleString()}\`\nExperience: \`${experiencepoints.toLocaleString()} | ${calcexpfull(
                        level
                    ).toLocaleString()}\`\n${bardisplay(
                        parseInt((experiencepoints / calcexpfull(level)) * 100)
                    )}`,
                    inline: true,
                },
                {
                    name: "Balance",
                    value: `Wallet: \`❀ ${walletcoins.toLocaleString()}\`\nBank: \`❀ ${bankcoins.toLocaleString()}\`\nNetworth: \`❀ ${economyData.networth.toLocaleString()}\`\nTotal Bankspace: \`${economyData.netbankspace.toLocaleString()}\`\nBankmessage Space: \`${bankmessagespace.toLocaleString()}\`\nExperience Space: \`${expbankspace.toLocaleString()}\`\nOther Space: \`${otherbankspace.toLocaleString()}\``,
                    inline: true,
                },
                {
                    name: "Inventory",
                    value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: \`❀ ${inventoryData.networth.toLocaleString()}\``,
                },
                {
                    name: "Other (MISC)",
                    value: `Daily Streak: <a:streakflame:1008505222747922503> \`${dailystreak.toLocaleString()}\`\nCommands Issued: \`${totalcommands.toLocaleString()}\`\nDeaths: <:ghost:978412292012146688> \`${deaths.toLocaleString()}\`\nCreated At: <t:${new Date(
                        createdat / 1000
                    ).getTime()}:D>`,
                }
            );

        interaction.reply({
            embeds: [level_embed],
            components: [
                new MessageActionRow().setComponents(
                    new MessageButton()
                        .setCustomId(`fetch_activeitems`)
                        .setEmoji("<a:Hamster_Spin:1006783336011808838>")
                        .setLabel("Active Items")
                        .setStyle("PRIMARY")
                ),
            ],
        });
        setCooldown(interaction, "level", 5, economyData.data);
    },
};
