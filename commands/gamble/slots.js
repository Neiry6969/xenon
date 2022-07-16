const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const letternumbers = require("../../reference/letternumber");

const jsoncooldowns = require("../../cooldowns.json");
const fs = require("fs");
function premiumcooldowncalc(defaultcooldown) {
    if (defaultcooldown <= 5 && defaultcooldown > 2) {
        return defaultcooldown - 2;
    } else if (defaultcooldown <= 15) {
        return defaultcooldown - 5;
    } else if (defaultcooldown <= 120) {
        return defaultcooldown - 10;
    } else {
        return defaultcooldown;
    }
}

const winningicons = [
    "<:excalibur:966537260034043974>",
    "<:creatorscrown:965024171463688323>",
    "<a:finecrown:968688780615766047>",
    "<a:finetrophy:968660247977803787>",
    "<a:finemedal:968654431484796979>",
    "<a:finecoin:968650301546586193>",
];

const multiplieramount_2 = [
    {
        icon: "<a:finecoin:968650301546586193>",
        multi: 1,
    },
    {
        icon: "<a:finemedal:968654431484796979>",
        multi: 1,
    },
    {
        icon: "<a:finetrophy:968660247977803787>",
        multi: 1.2,
    },
    {
        icon: "<a:finecrown:968688780615766047>",
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
        icon: "<a:finecoin:968650301546586193>",
        multi: 4,
    },
    {
        icon: "<a:finemedal:968654431484796979>",
        multi: 8,
    },
    {
        icon: "<a:finetrophy:968660247977803787>",
        multi: 12,
    },
    {
        icon: "<a:finecrown:968688780615766047>",
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
        "<a:finecrown:968688780615766047>",
        "<a:finetrophy:968660247977803787>",
        "<a:finemedal:968654431484796979>",
        "<a:finecoin:968650301546586193>",
        "<a:fionaskitten:994306306557104240>",
        "<:donut:965343121133162616>",
        "<a:finecoin:968650301546586193>",
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
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData
    ) {
        const options = {
            amount: interaction.options.getString("amount"),
        };

        let maxwallet = 25000000;
        const errorembed = new MessageEmbed().setColor("#FF5C5C");
        if (inventoryData.inventory["finecrown"] >= 1) {
            maxwallet = 500000000;
        }
        let slotsamount = options.amount?.toLowerCase();
        const maxslotsamount = 500000;

        if (userData.wallet >= maxwallet) {
            errorembed.setDescription(
                `You are too rich to use the slots machine.\n**Cap:** \`❀ ${maxwallet.toLocaleString()}\`\n**Wallet:** \`❀ ${userData.wallet.toLocaleString()}\``
            );

            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (userData.wallet < 5000) {
            if (userData.bank.coins >= 5000) {
                errorembed.setDescription(
                    `You need at least ❀ \`5,000\` to use the slots machine, maybe withdraw some?`
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                errorembed.setDescription(
                    `You need at least ❀ \`5,000\` to use the slots machine.`
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            }
        }

        if (slotsamount === "max" || slotsamount === "all") {
            if (userData.wallet > maxslotsamount) {
                slotsamount = maxslotsamount;
            } else {
                slotsamount = userData.wallet;
            }
        } else if (slotsamount === "half") {
            slotsamount = Math.floor(userData.wallet / 2);
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

        if (slotsamount > userData.wallet) {
            errorembed.setDescription(
                `You don't have that many coins to slots.\n**Wallet:** \`❀ ${userData.wallet.toLocaleString()}\``
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (!slotsamount || slotsamount < 0) {
            errorembed.setDescription(
                `You can only slots a whole number of coins, don't try to break me smh.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (slotsamount < 5000) {
            errorembed.setDescription(
                `You need to bet atleast at least ❀ \`5,000\` with the slots machine.`
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (slotsamount > maxslotsamount) {
            errorembed.setDescription(
                `You aren't able to slots that many coins\n**Max Amount:** \`❀ ${maxslotsamount.toLocaleString()}\``
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        const slot1_num = Math.floor(Math.random() * 100 * 100);
        const slot2_num = Math.floor(Math.random() * 100 * 100);
        const slot3_num = Math.floor(Math.random() * 100 * 100);
        const slots1 = slot(slot1_num);
        const slots2 = slot(slot2_num);
        const slots3 = slot(slot3_num);
        const resultslots = [slots1, slots2, slots3];

        let cooldown = 10;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].slots = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        const embed = {
            color: "#000000",
            title: `${interaction.user.username}'s slots machine`,
            description: `**[>${resultslots.join(" ")}<]**`,
            footer: {
                text: "Xenon Slots",
            },
        };

        await interaction.reply({ embeds: [embed] });
        const msg = await interaction.fetchReply();

        let multiplier;
        const majorityelement = majorityElement(resultslots);
        const majorityelementcount = countElements(
            majorityElement,
            resultslots
        );

        if (majorityelement === false) {
            const response = await economyModel.findOneAndUpdate(
                {
                    userId: interaction.user.id,
                },
                {
                    $inc: {
                        wallet: -slotsamount,
                    },
                },
                {
                    upsert: true,
                }
            );

            const lostamount = userData.wallet - slotsamount;

            const embed = {
                color: "#ff4c4c",
                title: `${interaction.user.username}'s losing slots machine`,
                description: `**[>${resultslots.join(
                    " "
                )}<]**\n\n**You lost:** \`❀ ${slotsamount.toLocaleString()}\`\n**Wallet:** \`❀ ${lostamount.toLocaleString()}\``,
                footer: {
                    text: "Xenon Slots",
                },
            };

            msg.edit({ embeds: [embed] });
        } else if (!winningicons.includes(majorityelement)) {
            const response = await economyModel.findOneAndUpdate(
                {
                    userId: interaction.user.id,
                },
                {
                    $inc: {
                        wallet: -slotsamount,
                    },
                },
                {
                    upsert: true,
                }
            );

            const lostamount = userData.wallet - slotsamount;

            const embed = {
                color: "#ff4c4c",
                title: `${interaction.user.username}'s losing slots machine`,
                description: `**[>${resultslots.join(
                    " "
                )}<]**\n\n**You lost:** \`❀ ${slotsamount.toLocaleString()}\`\n**Wallet:** \`❀ ${lostamount.toLocaleString()}\``,
                footer: {
                    text: "Xenon Slots",
                },
            };

            msg.edit({ embeds: [embed] });
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

            const winamount = Math.floor(multiplier * slotsamount);
            const wallet = userData.wallet + winamount;

            const response = await economyModel.findOneAndUpdate(
                {
                    userId: interaction.user.id,
                },
                {
                    $inc: {
                        wallet: winamount,
                    },
                },
                {
                    upsert: true,
                }
            );

            const embed = {
                color: "#b7ffa1",
                title: `${interaction.user.username}'s winning slots machine`,
                description: `**[>${resultslots.join(
                    " "
                )}<]**\n\n**Multiplier:** \`x${multiplier.toLocaleString()}\`\n**You Won:** \`❀ ${winamount.toLocaleString()}\`\n**Wallet:** \`❀ ${wallet.toLocaleString()}\``,
                footer: {
                    text: "Xenon Slots",
                },
            };

            msg.edit({ embeds: [embed] });
        }
    },
};
