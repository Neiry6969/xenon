const {
    Client,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Message,
    TextChannel,
    Collection,
} = require("discord.js");

const LotteryModel = require("../models/lotterySchema");
const EconomyModel = require("../models/economySchema");

let LotteryCounter = 0;

module.exports = {
    name: "tick",
    once: false,
    async execute(client) {
        let nowTimestamp = new Date();
        LotteryCounter++;

        if (LotteryCounter === 3600) {
            LotteryCounter = 0;
            const lotteryData = await LotteryModel.findOne({
                lotteryId: "Tasdw8932ik",
            });

            if (lotteryData.entrees.length > 0) {
                const entrees_count = lotteryData.entrees.length;
                const entress_winningno = Math.floor(
                    Math.random() * entrees_count
                );
                const winner_id = lotteryData.entrees[entress_winningno];

                const lottery_perticket = 10000;
                const lottery_prize = lottery_perticket * entrees_count;

                const winnerEconomyData = await EconomyModel.findOne({
                    userId: winner_id,
                });

                winnerEconomyData.wallet =
                    winnerEconomyData.wallet + lottery_prize;

                await EconomyModel.findOneAndUpdate(
                    {
                        userId: winner_id,
                    },
                    winnerEconomyData
                );

                dmembed = new MessageEmbed()
                    .setTitle(`You won the lottery!`)
                    .setColor("#7aff8c")
                    .setDescription(
                        `The money was directly put into your wallet.\n**Grand Prize:** \`❀ ${lottery_prize.toLocaleString()}\``
                    );
                announceembed = new MessageEmbed()
                    .setColor("#fffb7a")
                    .setTitle("Hourly Lottery Winner")
                    .setDescription(
                        `**Grand Prize:** \`❀ ${lottery_prize.toLocaleString()}\`\n**Entrees:** \`${entrees_count.toLocaleString()}\`\n\n**__Winner__**\nUser: <@${winner_id}>\nId: \`${winner_id}\``
                    );

                client.users.fetch(winner_id, false).then((user) => {
                    user.send({ embeds: [dmembed] });
                });
                client.channels.cache
                    .get("999430498420011090")
                    .send({ embeds: [announceembed] });

                lotteryData.entrees = [];
                await LotteryModel.findOneAndUpdate(
                    {
                        lotteryId: "Tasdw8932ik",
                    },
                    lotteryData
                );
            }
        }

        setTimeout(() => {
            client.emit("tick");
            nowTimestamp = new Date();
        }, 1000);
    },
};
