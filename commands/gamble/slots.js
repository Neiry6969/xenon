const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addexperiencepoints,
} = require("../../utils/currencyfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const letternumbers = require("../../reference/letternumber");

const winningicons = [
    "<:excalibur:966537260034043974>",
    "<:creatorscrown:965024171463688323>",
    "<:finecrown:1014267762941632723>",
    "<:finetrophy:1014260401174761492>",
    "<:finemedal:1014260725016953012>",
    "<a:finecoin:1014272776737128469>",
];

const multiplieramount_2 = [
    {
        icon: "<a:finecoin:1014272776737128469>",
        multi: 1,
    },
    {
        icon: "<:finemedal:1014260725016953012>",
        multi: 1,
    },
    {
        icon: "<:finetrophy:1014260401174761492>",
        multi: 1.2,
    },
    {
        icon: "<:finecrown:1014267762941632723>",
        multi: 1.5,
    },
    {
        icon: "<:creatorscrown:965024171463688323>",
        multi: 2,
    },
    {
        icon: "<:excalibur:966537260034043974>",
        multi: 3,
    },
];

const multiplieramount_3 = [
    {
        icon: "<a:finecoin:1014272776737128469>",
        multi: 4,
    },
    {
        icon: "<:finemedal:1014260725016953012>",
        multi: 8,
    },
    {
        icon: "<:finetrophy:1014260401174761492>",
        multi: 12,
    },
    {
        icon: "<:finecrown:1014267762941632723>",
        multi: 15,
    },
    {
        icon: "<:creatorscrown:965024171463688323>",
        multi: 75,
    },
    {
        icon: "<:excalibur:966537260034043974>",
        multi: 250,
    },
];

function majorityElement(arr = []) {
    const threshold = Math.floor(arr.length / 2);
    const map = {};
    for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        map[value] = map[value] + 1 || 1;
        if (map[value] > threshold) return value;
    }
    return false;
}
function countElements(num, arr) {
    const counts = {};

    for (num of arr) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    return counts;
}

function slot(num) {
    const leftovericons = [
        "<:finecrown:1014267762941632723>",
        "<:finetrophy:1014260401174761492>",
        "<:finemedal:1014260725016953012>",
        "<a:finecoin:1014272776737128469>",
        "<a:fineribbon:1014273403097710722>",
        "<:donut:965343121133162616>",
        "<:lifesaver:978754575098085426>",
    ];
    if (num <= 690) {
        return "<:excalibur:966537260034043974>";
    } else if (num <= 1690) {
        return "<:creatorscrown:965024171463688323>";
    } else {
        const result = Math.floor(Math.random() * leftovericons.length);
        return leftovericons[result];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slots")
        .setDescription("Gamble your coins using the slots machine.")
        .addStringOption((oi) => {
            return oi
                .setName("amount")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                )
                .setRequired(true);
        }),
    cdmsg: "Stop gambling so fast! If this keeps up, I bet you'll be much more poor.",
    cooldown: 10,
    async execute(interaction) {
        const options = {
            amount: interaction.options.getString("amount"),
        };
        let error_message;
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData_fetch = await fetchInventoryData(
            interaction.user.id
        );
        const economyData = economyData_fetch.data;
        const inventoryData = inventoryData_fetch.data;

        const maxslotsamount = 500000;
        let maxwallet = 25000000;
        let slotsamount = options.amount?.toLowerCase();
        if (inventoryData.inventory["finecrown"] >= 1) {
            maxwallet = 500000000;
        }

        if (economyData.wallet >= maxwallet) {
            error_message = `You are too rich to use the slots machine.\n**Cap:** \`❀ ${maxwallet.toLocaleString()}\`\n**Wallet:** \`❀ ${economyData.wallet.toLocaleString()}\``;
            return errorReply(interaction, error_message);
        }

        if (economyData.wallet < 5000) {
            if (economyData.bank.coins >= 5000) {
                error_message = `You need at least ❀ \`5,000\` to use the slots machine, maybe withdraw some?`;
                return errorReply(interaction, error_message);
            } else {
                error_message = `You need at least ❀ \`5,000\` to use the slots machine.`;
                return errorReply(interaction, error_message);
            }
        }

        if (slotsamount === "max" || slotsamount === "all") {
            if (economyData.wallet > maxslotsamount) {
                slotsamount = maxslotsamount;
            } else {
                slotsamount = economyData.wallet;
            }
        } else if (slotsamount === "half") {
            slotsamount = Math.floor(economyData.wallet / 2);
        } else if (
            letternumbers.find((val) => val.letter === slotsamount.slice(-1))
        ) {
            if (parseInt(slotsamount.slice(0, -1))) {
                const number = parseFloat(slotsamount.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === slotsamount.slice(-1)
                ).number;
                slotsamount = number * numbermulti;
            } else {
                slotsamount = null;
            }
        } else {
            slotsamount = parseInt(slotsamount);
        }

        slotsamount = parseInt(slotsamount);

        if (slotsamount > economyData.wallet) {
            error_message = `You don't have that many coins to slots.\n**Wallet:** \`❀ ${economyData.wallet.toLocaleString()}\``;
            return errorReply(interaction, error_message);
        } else if (!slotsamount || slotsamount < 0) {
            error_message = `You can only slots a whole number of coins, don't try to break me smh.`;
            return errorReply(interaction, error_message);
        } else if (slotsamount < 5000) {
            error_message = `You need to bet atleast at least ❀ \`5,000\` with the slots machine.`;
            return errorReply(interaction, error_message);
        } else if (slotsamount > maxslotsamount) {
            error_message = `You aren't able to slots that many coins\n**Max Amount:** \`❀ ${maxslotsamount.toLocaleString()}\``;
            return errorReply(interaction, error_message);
        }

        const slot1_num = Math.floor(Math.random() * 100 * 100);
        const slot2_num = Math.floor(Math.random() * 100 * 100);
        const slot3_num = Math.floor(Math.random() * 100 * 100);
        const slots1 = slot(slot1_num);
        const slots2 = slot(slot2_num);
        const slots3 = slot(slot3_num);
        const resultslots = [slots1, slots2, slots3];

        const slots_embed = new MessageEmbed()
            .setTitle(`Slots Machine`)
            .setDescription(`\` [>\`${resultslots.join(" ")} \`<]\``);

        await interaction.reply({ embeds: [slots_embed] });
        const slots_msg = await interaction.fetchReply();

        let multiplier;
        const majorityelement = majorityElement(resultslots);
        const majorityelementcount = countElements(
            majorityElement,
            resultslots
        );

        if (
            majorityelement === false ||
            !winningicons.includes(majorityelement)
        ) {
            await removeCoins(economyData.userId, slotsamount);

            const newwallet = economyData.wallet - slotsamount;

            slots_embed
                .setColor(`#ff9497`)
                .setAuthor({
                    name: `${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setDescription(
                    `**\`[>\` ${resultslots.join(
                        " "
                    )} \`<]\`**\n\n**You lost:** \`❀ ${slotsamount.toLocaleString()}\``
                )
                .setFooter({
                    text: `New Wallet: ❀ ${newwallet.toLocaleString()}`,
                });

            slots_msg.edit({ embeds: [slots_embed] });
        } else {
            let multiplier;
            if (majorityelementcount[majorityelement] === 3) {
                multiplier = multiplieramount_3.find(
                    (val) => val.icon.toLowerCase() === majorityelement
                ).multi;
            } else if (majorityelementcount[majorityelement] === 2) {
                multiplier = multiplieramount_2.find(
                    (val) => val.icon.toLowerCase() === majorityelement
                ).multi;
            } else {
                multiplier = multiplieramount_2.find(
                    (val) => val.icon.toLowerCase() === majorityelement
                ).multi;
            }

            const winningamount = Math.floor(multiplier * slotsamount);
            const newwallet = economyData.wallet + winningamount;

            await addCoins(economyData.userId, winningamount);
            await addexperiencepoints(interaction.user.id, 1, 30);

            slots_embed
                .setColor(`#95ff87`)
                .setDescription(
                    `**\`[>\` ${resultslots.join(
                        " "
                    )} \`<]\`**\n\n**Multiplier:** \`x${multiplier.toLocaleString()}\`\n**You Won:** \`❀ ${winningamount.toLocaleString()}\``
                )
                .setFooter({
                    text: `New Wallet: ❀ ${newwallet.toLocaleString()}`,
                });

            slots_msg.edit({ embeds: [slots_embed] });
        }
        return setCooldown(interaction, "slots", 10, economyData);
    },
};
