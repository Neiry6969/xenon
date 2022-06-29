const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check a user's balance.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("Specify a user's balance you want to see");
        }),
    cdmsg: `You can't be checking balance so fast, chilldown!`,
    cooldown: 3,
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData,
        itemData
    ) {
        const allItems = itemData;
        const options = {
            user: interaction.options.getUser("user"),
        };

        const target = options.user;
        let user = options.user;

        const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle(`Balance`)
            .setTimestamp();

        if (target) {
            let targetData;
            try {
                targetData = await economyModel.findOne({ userId: target.id });
                if (!targetData) {
                    let targetuser = await economyModel.create({
                        userId: target.id,
                    });

                    targetData = targetuser;

                    targetuser.save();
                }
            } catch (error) {
                console.log(error);
            }

            let targetinvData;
            try {
                targetinvData = await inventoryModel.findOne({
                    userId: target.id,
                });
                if (!targetinvData) {
                    let targetuser = await inventoryModel.create({
                        userId: target.id,
                    });

                    targetinvData = targetuser;

                    targetuser.save();
                }
            } catch (error) {
                console.log(error);
            }

            let targetprofileData;
            try {
                targetprofileData = await economyModel.findOne({
                    userId: target.id,
                });
                if (!targetprofileData) {
                    let targetuser = await economyModel.create({
                        userId: target.id,
                    });

                    targetprofileData = targetuser;

                    targetuser.save();
                }
            } catch (error) {
                console.log(error);
            }

            let targetstatsData;
            try {
                targetstatsData = await economyModel.findOne({
                    userId: target.id,
                });
                if (!targetstatsData) {
                    let targetuser = await economyModel.create({
                        userId: target.id,
                    });

                    targetstatsData = targetuser;

                    targetuser.save();
                }
            } catch (error) {
                console.log(error);
            }

            const bankspace =
                targetData.bank.bankspace +
                targetData.bank.expbankspace +
                targetData.bank.otherbankspace;
            const bank_percent_filled = (
                (targetData.bank.coins / bankspace) *
                100
            ).toFixed(2);
            let itemsworth = 0;

            if (!targetinvData.inventory) {
                itemsworth = 0;
            } else {
                Object.keys(targetinvData.inventory).forEach((key) => {
                    if (targetinvData.inventory[key] === 0) {
                        return;
                    } else {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === key
                        );

                        itemsworth =
                            itemsworth +
                            item.value * targetinvData.inventory[key];
                    }
                });
            }

            const networth =
                targetData.wallet + targetData.bank.coins + itemsworth;

            embed
                .setDescription(
                    `Wallet: \`❀ ${targetData.wallet.toLocaleString()}\`\nBank: \`❀ ${targetData.bank.coins.toLocaleString()} / ${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``
                )
                .setAuthor({
                    name: `${target.username}#${target.discriminator}`,
                    iconURL: target.displayAvatarURL(),
                })
                .addFields({
                    name: `Net Worth`,
                    value: `\`❀ ${networth.toLocaleString()}\``,
                });
        } else {
            user = interaction.user;
            const bankspace =
                userData.bank.bankspace +
                userData.bank.expbankspace +
                userData.bank.otherbankspace;
            const bank_percent_filled = (
                (userData.bank.coins / bankspace) *
                100
            ).toFixed(2);
            let itemsworth = 0;

            if (!inventoryData.inventory) {
                itemsworth = 0;
            } else {
                Object.keys(inventoryData.inventory).forEach((key) => {
                    if (inventoryData.inventory[key] === 0) {
                        return;
                    } else {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === key
                        );

                        itemsworth =
                            itemsworth +
                            item.value * inventoryData.inventory[key];
                    }
                });
            }

            const networth = userData.wallet + userData.bank.coins + itemsworth;

            embed
                .setDescription(
                    `Wallet: \`❀ ${userData.wallet.toLocaleString()}\`\nBank: \`❀ ${userData.bank.coins.toLocaleString()} / ${bankspace.toLocaleString()}\` \`${bank_percent_filled}%\``
                )
                .setAuthor({
                    name: `${user.username}#${user.discriminator}`,
                    iconURL: user.displayAvatarURL(),
                })
                .addFields({
                    name: `Net Worth`,
                    value: `\`❀ ${networth.toLocaleString()}\``,
                });
        }

        interaction.reply({ embeds: [embed] });

        let cooldown = 3;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].balance = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    },
};
