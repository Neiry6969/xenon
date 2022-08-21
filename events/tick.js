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

let LotteryCounter = 0;

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
                        `The money was directly put into your wallet.\n\n**Grand Prize:**\nCoins: \`❀ ${lottery_prize.coins.toLocaleString()}\`\nItems: \`${1}\` ${
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
                        }\`\n**Total Entries:** \`${lottery_entriesTotal.toLocaleString()}\`\n\n**__Winner__**\nUser: <@${
                            winningentry.userId
                        }>\nId: \`${winningentry.userId}\``
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
