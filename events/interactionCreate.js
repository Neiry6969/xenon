const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const userModel = require("../models/userSchema");
const statsModel = require("../models/statsSchema");
const guildModel = require("../models/guildSchema");
const itemModel = require("../models/itemSchema");

const { Collection, MessageEmbed } = require("discord.js");
const fs = require("fs");

const interactionproccesses = require("../interactionproccesses.json");
const jsoncoodowns = require("../cooldowns.json");

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

const cooldowns = new Map();

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

function time_split(time) {
    if (time < 60) {
        return `${time}s`;
    } else if (time >= 60 && time < 3600) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}m ${seconds}s`;
    } else if (time >= 3600 && time < 86400) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor((time % 3600) % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (time >= 86400) {
        const days = Math.floor(time / 86400);
        const hours = Math.floor((time % 86400) / 3600);
        const minutes = Math.floor(((time % 86400) % 3600) / 60);
        const seconds = Math.floor(((time % 86400) % 3600) % 60);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
        return `${time}s`;
    }
}

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        const errorembed = new MessageEmbed().setColor("#FF5C5C");

        if (!interaction.isCommand()) return;

        const commandname = interaction.commandName;
        const command = client.commands.get(commandname);

        if (!command) return;
        const user = interaction.user;
        const userID = user.id;
        let userData;
        try {
            userData = await economyModel.findOne({ userId: userID });
            if (!userData) {
                let user = await economyModel.create({
                    userId: userID,
                });

                user.save();

                userData = user;
            }
        } catch (error) {
            console.log(error);
        }

        let guildData;
        try {
            guildData = await guildModel.findOne({
                guildId: interaction.guild.id,
            });
            if (!guildData) {
                let guild = await guildModel.create({
                    guildId: interaction.guild.id,
                });

                guild.save();

                guildData = guild;
            }
        } catch (error) {
            console.log(error);
        }

        let profileData;
        try {
            profileData = await userModel.findOne({ userId: userID });
            if (!profileData) {
                let user = await userModel.create({
                    userId: userID,
                });

                user.save();

                profileData = user;
            }
        } catch (error) {
            console.log(error);
        }

        let statsData;
        try {
            statsData = await statsModel.findOne({ userId: userID });
            if (!statsData) {
                let user = await statsModel.create({
                    userId: userID,
                });

                user.save();

                statsData = user;
            }
        } catch (error) {
            console.log(error);
        }

        let inventoryData;
        try {
            inventoryData = await inventoryModel.findOne({ userId: userID });
            if (!inventoryData) {
                let inv = await inventoryModel.create({
                    userId: userID,
                });

                inv.save();

                inventoryData = inv;
            }
        } catch (error) {
            console.log(error);
        }

        const itemData = await itemModel.find({});

        if (!interactionproccesses[userID]?.interaction) {
            interactionproccesses[userID] = {
                interaction: false,
                proccessingcoins: false,
            };
        }

        if (
            interactionproccesses[userID].interaction === true ||
            interactionproccesses[userID].proccessingcoins === true
        ) {
            errorembed.setDescription(`You have an ongoing command.`);
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }
        if (
            profileData.moderation.blacklist.status === true ||
            profileData.moderation.ban.status === true
        ) {
            errorembed.setDescription(
                `You are a blacklisted user, you cannot use commands untill you are unblacklisted.\nIf you believe this is a mistake please go here: [https://discord.gg/B5vjnwakdk](https://discord.gg/B5vjnwakdk)`
            );

            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        if (guildData.disabledcmds[commandname] === true) {
            const disabledcmdembed = new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `<a:cross:987458395823018044> **This command has been disabled in** \`${interaction.guild.name}\`\nGuild ID: \`${interaction.guild.id}\`\nCommand: \`${commandname}\``
                );
            return interaction.reply({
                embeds: [disabledcmdembed],
                ephemeral: true,
            });
        }

        async function backgroundupdates() {
            const params = {
                userId: user.id,
            };

            statsData.commands = statsData.commands + 1;

            const hasCommand = Object.keys(statsData.commandsObject).includes(
                commandname
            );
            if (!hasCommand) {
                statsData.commandsObject[commandname] = 1;
            } else {
                statsData.commandsObject[commandname] =
                    statsData.commandsObject[commandname] + 1;
            }

            const experiencepoints = userData.experiencepoints;
            const experiencefull = calcexpfull(userData.level);
            if (experiencepoints >= experiencefull) {
                userData.level = userData.level + 1;
                userData.experiencepoints = experiencepoints - experiencefull;
            }

            await statsModel.findOneAndUpdate(params, statsData);
            await economyModel.findOneAndUpdate(params, userData);
        }

        async function executecmd() {
            try {
                backgroundupdates();
                if (!jsoncoodowns.hasOwnProperty(userID)) {
                    jsoncoodowns[userID] = {};
                }
                fs.writeFile(
                    "./cooldowns.json",
                    JSON.stringify(jsoncoodowns),
                    (err) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                );

                let readytimestamp = jsoncoodowns[userID][commandname];

                if (!readytimestamp) {
                    readytimestamp = 0;
                }

                const timeleft = new Date(readytimestamp);
                let check =
                    timeleft - Date.now() >= timeleft ||
                    timeleft - Date.now() <= 0;

                if (!check) {
                    const timeleft_human = time_split(
                        Math.floor((timeleft - Date.now()) / 1000)
                    );
                    const cooldownembed = new MessageEmbed().setTitle(
                        "You are on cooldown"
                    );

                    if (
                        interaction.guild.id === "852261411136733195" ||
                        interaction.guild.id === "978479705906892830" ||
                        userData.premium.rank >= 1
                    ) {
                        cooldownembed
                            .setColor("#FFC000")
                            .setDescription(
                                `\`${
                                    command.cdmsg || "Chillax bro!"
                                }\`\nYou have **PREMIUM** cooldown\nTry the command again in **${timeleft_human}**`
                            )
                            .addFields(
                                {
                                    name: `**Premium Cooldown**`,
                                    value: `\`${time_split(
                                        premiumcooldowncalc(command.cooldown)
                                    )}\``,
                                    inline: true,
                                },
                                {
                                    name: `Default Cooldown`,
                                    value: `\`${time_split(
                                        command.cooldown
                                    )}\``,
                                    inline: true,
                                }
                            );
                    } else {
                        cooldownembed
                            .setColor("#000000")
                            .setDescription(
                                `\`${
                                    command.cdmsg || "Chillax bro!"
                                }\`\nYou have **DEFAULT** cooldown\nTry the command again in **${timeleft_human}**`
                            )
                            .addFields(
                                {
                                    name: `**Default Cooldown**`,
                                    value: `\`${time_split(
                                        command.cooldown
                                    )}\``,
                                    inline: true,
                                },
                                {
                                    name: `Premium Cooldown`,
                                    value: `\`${time_split(
                                        premiumcooldowncalc(command.cooldown)
                                    )}\``,
                                    inline: true,
                                }
                            );
                    }

                    interaction.reply({
                        embeds: [cooldownembed],
                        ephemeral: true,
                    });
                } else {
                    try {
                        await command.execute(
                            interaction,
                            client,
                            userData,
                            inventoryData,
                            statsData,
                            profileData,
                            itemData
                        );
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({
                            content:
                                "There was an error while executing this command!",
                            ephemeral: true,
                        });
                    }
                }
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            }
        }

        executecmd();
    },
};
