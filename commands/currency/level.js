const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const statsModel = require("../../models/statsSchema");
const userModel = require("../../models/userSchema");

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

        let cooldown = 5;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].profile = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        const target = options.user;

        if (target) {
            const target_id = target.id;
            let targetData;
            try {
                targetData = await economyModel.findOne({ userId: target_id });

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
                    targetprofileData = await userModel.findOne({
                        userId: target.id,
                    });
                    if (!targetprofileData) {
                        let targetuser = await userModel.create({
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
                    targetstatsData = await statsModel.findOne({
                        userId: target.id,
                    });
                    if (!targetstatsData) {
                        let targetuser = await statsModel.create({
                            userId: target.id,
                        });

                        targetstatsData = targetuser;

                        targetuser.save();
                    }
                } catch (error) {
                    console.log(error);
                }

                const embed = new MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle("Profile")
                    .setAuthor({
                        name: `${target.username}#${target.discriminator}`,
                        iconURL: target.displayAvatarURL(),
                    });

                if (!targetData) {
                    const targetdata = await economyModel.create({
                        userId: target.id,
                    });

                    targetdata.save();

                    embed.setDescription(`**Prestige:** \`0\``).addFields(
                        {
                            name: "Level",
                            value: `Level: \`0\`\nExperience: \`0 | ${calcexpfull(
                                0
                            ).toLocaleString()}\`\n${bardisplay(0)}`,
                            inline: true,
                        },
                        {
                            name: "Balance",
                            value: `Wallet: \`❀ 0\`\nBank: \`❀ 0\`\nBankspace: \`1000\`\nBankmessage Space: \`0\`\nTotal Balance: \`❀ 0\``,
                            inline: true,
                        },
                        {
                            name: "Inv",
                            value: `Unique Items: \`0\`\nTotal Items: \`0\`\nItems Worth: \`❀ 0\``,
                        },
                        {
                            name: "Other (MISC)",
                            value: `Daily Streak: <a:Lssl:806961744885973062>\`0\`\nCommands Issued: \`0\`\nDeaths: <:ghost:978412292012146688> \`0\``,
                        }
                    );
                } else {
                    const total_balance =
                        targetData.wallet + targetData.bank.coins;
                    const bankspace =
                        targetData.bank.bankspace +
                        targetData.bank.expbankspace +
                        targetData.bank.otherbankspace;
                    let itemsworth = 0;
                    let items = 0;
                    let uniqueitems = 0;

                    if (!targetinvData.inventory) {
                        itemsworth = 0;
                        items = 0;
                        uniqueitems = 0;
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
                                uniqueitems = uniqueitems + 1;
                                items = items + targetinvData.inventory[key];
                            }
                        });
                    }
                    let badges_map;
                    embed
                        .setDescription(
                            `${
                                targetData.premium.rank > 0
                                    ? `**Prenium:** <:premiumcard:970846275975118958> \`rank ${targetData.premium.rank}\`\n`
                                    : ""
                            }${
                                badges_map ? `**Badges:**  ${badges_map}\n` : ""
                            }**Prestige:** \`${targetData.prestige.toLocaleString()}\``
                        )
                        .addFields(
                            {
                                name: "Level",
                                value: `Level: \`${targetData.level.toLocaleString()}\`\nExperience: \`${targetData.experiencepoints.toLocaleString()} | ${calcexpfull(
                                    targetData.level
                                ).toLocaleString()}\`\n${bardisplay(
                                    parseInt(
                                        (targetData.experiencepoints /
                                            calcexpfull(targetData.level)) *
                                            100
                                    )
                                )}`,
                                inline: true,
                            },
                            {
                                name: "Balance",
                                value: `Wallet: \`❀ ${targetData.wallet.toLocaleString()}\`\nBank: \`❀ ${targetData.bank.coins.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nBankmessage Space: \`${targetData.bank.bankmessagespace.toLocaleString()}\`\nTotal Balance: \`❀ ${total_balance.toLocaleString()}\``,
                                inline: true,
                            },
                            {
                                name: "Inv",
                                value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: \`❀ ${itemsworth.toLocaleString()}\``,
                            },
                            {
                                name: "Other (MISC)",
                                value: `Daily Streak: <a:Lssl:806961744885973062> \`${targetData.streaks.daily.strk.toLocaleString()}\`\nCommands Issued: \`${targetstatsData.commands.toLocaleString()}\`\nDeaths: <:ghost:978412292012146688> \`${targetData.deaths.toLocaleString()}\`\nCreated At: <t:${new Date(
                                    targetData.createdAt / 1000
                                ).getTime()}:D>`,
                            }
                        );
                }

                return interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.log(error);
            }
        } else {
            const premiumrank = userData.premium.rank;
            const bankspace =
                userData.bank.bankspace +
                userData.bank.expbankspace +
                userData.bank.otherbankspace;
            const walletcoins = userData.wallet;
            const bankcoins = userData.bank.coins;
            const bankmessagespace = userData.bank.bankmessagespace;
            const total_balance = walletcoins + bankcoins;

            let itemsworth = 0;
            let items = 0;
            let uniqueitems = 0;

            if (inventoryData.inventory) {
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
                        uniqueitems = uniqueitems + 1;
                        items = items + inventoryData.inventory[key];
                    }
                });
            }

            const embed = {
                color: "RANDOM",
                title: `${interaction.user.username}'s Profile`,
                author: {
                    name: `_____________`,
                    icon_url: `${interaction.user.displayAvatarURL()}`,
                },
                description: `${
                    premiumrank > 0
                        ? `**Prenium:** <:premiumcard:970846275975118958> \`rank ${premiumrank}\`\n`
                        : ""
                }**Badges:**\n**Prestige:** \`${userData.prestige.toLocaleString()}\``,
                fields: [
                    {
                        name: "Level",
                        value: `Level: \`${userData.level.toLocaleString()}\`\nExperience: \`${userData.experiencepoints.toLocaleString()} | ${calcexpfull(
                            userData.level
                        ).toLocaleString()}\`\n${bardisplay(
                            parseInt(
                                (userData.experiencepoints /
                                    calcexpfull(userData.level)) *
                                    100
                            )
                        )}`,
                        inline: true,
                    },
                    {
                        name: "Balance",
                        value: `Wallet: \`❀ ${walletcoins.toLocaleString()}\`\nBank: \`❀ ${bankcoins.toLocaleString()}\`\nBankspace: \`${bankspace.toLocaleString()}\`\nBankmessage Space: \`${bankmessagespace.toLocaleString()}\`\nTotal Balance: \`❀ ${total_balance.toLocaleString()}\``,
                        inline: true,
                    },
                    {
                        name: "Inventory",
                        value: `Unique Items: \`${uniqueitems.toLocaleString()}\`\nTotal Items: \`${items.toLocaleString()}\`\nItems Worth: \`❀ ${itemsworth.toLocaleString()}\``,
                    },
                    {
                        name: "Other (MISC)",
                        value: `Daily Streak: <:streakflame:978108608254459954> \`${userData.streaks.daily.strk.toLocaleString()}\`\nCommands Issued: \`${statsData.commands.toLocaleString()}\`\nDeaths: <:ghost:978412292012146688> \`${userData.deaths.toLocaleString()}\`\nCreated At: <t:${new Date(
                            userData.createdAt / 1000
                        ).getTime()}:D>`,
                    },
                ],
                timestamp: new Date(),
            };
            return interaction.reply({ embeds: [embed] });
        }
    },
};
