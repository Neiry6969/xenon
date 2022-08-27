const {
    Client,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Message,
    TextChannel,
    Collection,
} = require("discord.js");

const {
    addCoins,
    addItem,
    resetLottery,
} = require("../utils/currencyfunctions");
const { fetchItemData } = require("../utils/itemfunctions");
const LotteryModel = require("../models/lotterySchema");
const { setEventCooldown } = require("../utils/mainfunctions");

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
    name: "tick",
    once: false,
    async execute(client) {
        const lotteryData = await LotteryModel.findOne({
            lotteryId: "2022aug19",
        });
        const lottery_entries = lotteryData.entries;
        const lottery_entriesTotal = lotteryData.entriesTotal;

        if (lotteryData.endsAt < Date.now()) {
            const winninglotteryticket = await fetchItemData(
                "winninglotteryticket"
            );
            await resetLottery(lotteryData);
            if (lottery_entries.length > 0 && lottery_entriesTotal > 0) {
                const entries_unique = {};
                lottery_entries.forEach((entry) => {
                    if (!entries_unique[entry.userId]) {
                        entries_unique[entry.userId] =
                            entry.last - entry.first + 1;
                    } else {
                        entries_unique[entry.userId] +=
                            entry.last - entry.first + 1;
                    }
                });

                const entries_unique_map = Object.keys(entries_unique)
                    .map((key) => {
                        return key;
                    })
                    .sort(function (a, b) {
                        return entries_unique[b] - entries_unique[a];
                    });

                const topentries = entries_unique_map.slice(0, 3);
                const topentries_map = topentries
                    .map((entry, index) => {
                        return `${rankingicons(
                            index + 1
                        )} <@${entry}> \`${entries_unique[
                            entry
                        ].toLocaleString()} entries\` (\`❀ ${(
                            entries_unique[entry] *
                            10 *
                            1000
                        ).toLocaleString()}\`)`;
                    })
                    .join("\n");

                let winningentry;
                const winningticket = Math.floor(
                    Math.random() * lottery_entriesTotal + 1
                );
                const find_absolute = lottery_entries.find(
                    (value) =>
                        value.first === winningticket ||
                        value.last === winningticket
                );
                if (find_absolute) {
                    winningentry = find_absolute;
                } else {
                    winningentry = lottery_entries.find(
                        (value) =>
                            value.first <= winningticket &&
                            value.last >= winningticket
                    );
                }
                const lottery_prize = {
                    coins: lottery_entriesTotal * 10000,
                };

                await addItem(
                    winningentry.userId,
                    winninglotteryticket.item,
                    1
                );
                await addCoins(winningentry.userId, lottery_prize.coins);

                winner_fetch = await client.users.fetch(winningentry.userId);
                dm_embed = new MessageEmbed()
                    .setTitle(`You won the lottery! (hourly)`)
                    .setColor("#7aff8c")
                    .setDescription(
                        `The money was directly put into your wallet.\n\n**Users Participated:** \`${Object.keys(
                            entries_unique
                        ).length.toLocaleString()}\`\n**Grand Prize:**\nCoins: \`❀ ${lottery_prize.coins.toLocaleString()}\`\nItems: \`${1}\` ${
                            winninglotteryticket.icon
                        } \`${winninglotteryticket.item}\``
                    );
                announce_embed = new MessageEmbed()
                    .setColor("#fffb7a")
                    .setTitle("Hourly Lottery Winner")
                    .setThumbnail(winner_fetch.displayAvatarURL())
                    .setDescription(
                        `**Grand Prize:**\nCoins: \`❀ ${lottery_prize.coins.toLocaleString()}\`\nItems: \`${1}\` ${
                            winninglotteryticket.icon
                        } \`${
                            winninglotteryticket.item
                        }\`\n**Tickets:** \`${lottery_entriesTotal.toLocaleString()}\`\n**Users Participated:** \`${Object.keys(
                            entries_unique
                        ).length.toLocaleString()}\`\n\n**__Winner__**\nUser: <@${
                            winningentry.userId
                        }>\nId: \`${
                            winningentry.userId
                        }\`\nEntries: \`${entries_unique[
                            winningentry.userId
                        ].toLocaleString()}\` (❀ \`${(
                            entries_unique[winningentry.userId] *
                            10 *
                            1000
                        ).toLocaleString()}\`)\n\n**__Top Spenders__**\n${topentries_map}`
                    );

                winner_fetch.send({
                    embeds: [dm_embed],
                    components: [
                        new MessageActionRow().setComponents(
                            new MessageButton()
                                .setStyle("LINK")
                                .setURL("https://discord.gg/YVnv8Yud5u")
                                .setLabel("Community")
                                .setEmoji(
                                    "<a:winninglotteryticket:1010942366078750730>"
                                )
                        ),
                    ],
                });
                await client.channels.cache.get("999430498420011090").send({
                    content: `<@${winningentry.userId}>`,
                    embeds: [announce_embed],
                });
                await setEventCooldown(winningentry.userId, "lottery", 10800);
            }
        }

        setTimeout(() => {
            client.emit("tick");
            nowTimestamp = new Date();
        }, 1000);
    },
};
