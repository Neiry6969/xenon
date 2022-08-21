const {
    Client,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Message,
    TextChannel,
    Collection,
} = require("discord.js");

const { addCoins, addItem } = require("../utils/currencyfunctions");
const { fetchItemData } = require("../utils/itemfunctions");
const LotteryModel = require("../models/lotterySchema");

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

        if (lotteryData.endsAt < Date.now()) {
            const winninglotteryticket = await fetchItemData(
                "winninglotteryticket"
            );
            const hourms = 60 * 60 * 1000;
            const datenexthour =
                Math.floor(new Date(Date.now() + 60 * 60 * 1000) / hourms) *
                hourms;

            lotteryData.endsAt = datenexthour;

            if (
                lotteryData.entries.length > 0 &&
                lotteryData.entriesTotal > 0
            ) {
                const entries_unique = {};
                lotteryData.entries.forEach((entry) => {
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
                        return `${rankingicons(index + 1)} <@${entry}> \`${
                            entries_unique[entry]
                        } entries\` (\`❀ ${(
                            entries_unique[entry] *
                            10 *
                            1000
                        ).toLocaleString()}\`)`;
                    })
                    .join("\n");

                let winningentry;
                const winningticket = Math.floor(
                    Math.random() * lotteryData.entriesTotal + 1
                );
                const find_absolute = lotteryData.entries.find(
                    (value) =>
                        value.first === winningticket ||
                        value.last === winningticket
                );
                if (find_absolute) {
                    winningentry = find_absolute;
                } else {
                    winningentry = lotteryData.entries.find(
                        (value) =>
                            value.first <= winningticket &&
                            value.last >= winningticket
                    );
                }
                const lottery_entriesTotal = lotteryData.entriesTotal;
                const lottery_prize = {
                    coins: lotteryData.entriesTotal * 10000,
                };

                console;

                await addItem(
                    winningentry.userId,
                    winninglotteryticket.item,
                    1
                );
                await addCoins(winningentry.userId, lottery_prize.coins);
                lotteryData.entries = [];
                lotteryData.entriesTotal = 0;

                winner_fetch = await client.users.fetch(winningentry.userId);
                dm_embed = new MessageEmbed()
                    .setTitle(`You won the lottery! (hourly)`)
                    .setColor("#7aff8c")
                    .setDescription(
                        `The money was directly put into your wallet.\n\n**Users Participated:** \`${Object.keys(
                            entries_unique
                        ).length.toLocaleString()}\`\n**Grand Prize:**\nCoins: \`❀ ${lottery_prize.coins.toLocaleString()}\`\nItems: \`${1}\` ${
                            winninglotteryticket.icon
                        } \`${
                            winninglotteryticket.item
                        }\`\n**Users Participated:** \`${Object.keys(
                            entries_unique
                        ).length.toLocaleString()}\``
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
                        }>\nId: \`${winningentry.userId}\`\nEntries: \`${
                            entries_unique[winningentry.userId]
                        }\` (❀ \`${(
                            entries_unique[winningentry.userId] *
                            10 *
                            1000
                        ).toLocaleString()}\`)\n\n**__Top Spenders__**\n${topentries_map}`
                    );

                winner_fetch.send({ embeds: [dm_embed] });
                await client.channels.cache.get("999430498420011090").send({
                    content: `<@${winningentry.userId}>`,
                    embeds: [announce_embed],
                });
            }
            await LotteryModel.findOneAndUpdate(
                { lotteryId: lotteryData.lotteryId },
                lotteryData
            );
        }

        setTimeout(() => {
            client.emit("tick");
            nowTimestamp = new Date();
        }, 1000);
    },
};
