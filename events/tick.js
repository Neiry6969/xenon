const {
    Client,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Message,
    TextChannel,
    Collection,
} = require("discord.js");

const { addCoins } = require("../utils/currencyfunctions");
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
            const hourms = 60 * 60 * 1000;
            const datenexthour =
                Math.floor(new Date(Date.now() + 30 * 60 * 1000) / hourms) *
                hourms;

            if (
                lotteryData.entries.length > 0 &&
                lotteryData.entriesTotal > 0
            ) {
                let winningentry;
                const winningticket = Math.floor(
                    Math.random() * lotteryData.entriesTotal
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
                            value.first < winningticket &&
                            value.last > winningticket
                    );
                }
                const lottery_entriesTotal = lotteryData.entriesTotal;
                const lottery_prize = {
                    coins: lotteryData.entriesTotal * 10000,
                };

                await addCoins(winningentry.userId, lottery_prize.coins);
                lotteryData.entries = [];
                lotteryData.entriesTotal = 0;
                lotteryData.endsAt = datenexthour;
                await LotteryModel.findOneAndUpdate(
                    { lotteryId: lotteryData.lotteryId },
                    lotteryData
                );

                winner_fetch = await client.users.fetch(winningentry.userId);
                dm_embed = new MessageEmbed()
                    .setTitle(`You won the lottery! (hourly)`)
                    .setColor("#7aff8c")
                    .setDescription(
                        `The money was directly put into your wallet.\n**Grand Prize:** \`❀ ${lottery_prize.coins.toLocaleString()}\``
                    );
                announce_embed = new MessageEmbed()
                    .setColor("#fffb7a")
                    .setTitle("Hourly Lottery Winner")
                    .setThumbnail(winner_fetch.displayAvatarURL())
                    .setDescription(
                        `**Grand Prize:** \`❀ ${lottery_prize.coins.toLocaleString()}\`\n**Total Entries:** \`${lottery_entriesTotal.toLocaleString()}\`\n\n**__Winner__**\nUser: <@${
                            winningentry.userId
                        }>\nId: \`${winningentry.userId}\``
                    );

                winner_fetch.send({ embeds: [dm_embed] });
                await client.channels.cache.get("999430498420011090").send({
                    content: `<@${winningentry.userId}>`,
                    embeds: [announce_embed],
                });
            }
        }

        setTimeout(() => {
            client.emit("tick");
            nowTimestamp = new Date();
        }, 1000);
    },
};
