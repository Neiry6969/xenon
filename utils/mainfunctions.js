const { EmbedBuilder, DataResolver } = require("discord.js");
const fs = require("fs");

const { fetchEmbedColor } = require("./cosmeticsfunctions");
const {
    fetchEconomyData,
    fetchUserData,
    fetchStatsData,
} = require("./currencyfunctions");
const jsoncooldowns = require("../cooldowns.json");
const interactionproccesses = require("../interactionproccesses.json");
const AlertModel = require("../models/alertSchema");
const UserModel = require("../models/userSchema");

class Mainfunctions {
    static async setCooldown(
        interaction,
        commandname,
        cooldowntime,
        economyData
    ) {
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

        let cooldown = cooldowntime;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            economyData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_ms = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_ms;
        jsoncooldowns[interaction.user.id][commandname] = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    }

    static async resetInteractionproccesses() {
        fs.writeFile(
            "./interactionproccesses.json",
            JSON.stringify({}),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    }

    static async setProcessingLock(userId, status) {
        if (!interactionproccesses[userId]) {
            interactionproccesses[userId] = {};
        }

        interactionproccesses[userId]["proccessingcoins"] = status;
        interactionproccesses[userId]["interaction"] = status;
        fs.writeFile(
            "./interactionproccesses.json",
            JSON.stringify(interactionproccesses),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    }

    static async checkProcessingLock(userId) {
        if (!interactionproccesses[userId]) {
            return;
        }

        if (
            interactionproccesses[userId].interaction === true ||
            interactionproccesses[userId].proccessingcoins === true
        ) {
            return true;
        }
    }

    static async setFightingLock(userId, status) {
        interactionproccesses[userId]["fighting"] = status;

        fs.writeFile(
            "./interactionproccesses.json",
            JSON.stringify(interactionproccesses),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    }

    static async checkFightingLock(userId) {
        if (
            !interactionproccesses[userId] ||
            !interactionproccesses[userId]["fighting"]
        ) {
            return;
        }

        if (interactionproccesses[userId]["fighting"] === true) {
            return true;
        }
    }

    static async checkCooldown(interaction, userId, command, commandname) {
        const fetch_economyData = await fetchEconomyData(interaction.user.id);
        const economyData = fetch_economyData.data;

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

        function premiumcooldowncalc(defaultcooldown) {
            if (defaultcooldown <= 5 && defaultcooldown > 4) {
                return defaultcooldown - 3;
            } else if (defaultcooldown <= 15) {
                return defaultcooldown - 5;
            } else if (defaultcooldown <= 120) {
                return defaultcooldown - 10;
            } else {
                return defaultcooldown;
            }
        }

        if (!jsoncooldowns.hasOwnProperty(userId)) {
            jsoncooldowns[userId] = {};
        }
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        let readytimestamp = jsoncooldowns[userId][commandname];

        if (!readytimestamp) {
            readytimestamp = 0;
        }

        const timeleft = new Date(readytimestamp);
        let check =
            timeleft - Date.now() >= timeleft || timeleft - Date.now() <= 0;

        if (!check) {
            const timeleft_human = time_split(
                Math.floor((timeleft - Date.now()) / 1000)
            );
            const cooldownembed = new EmbedBuilder()
                .setTitle("You are on cooldown")
                .setColor(await fetchEmbedColor(interaction));

            if (
                interaction.guild.id === "852261411136733195" ||
                interaction.guild.id === "978479705906892830" ||
                economyData.premium.rank >= 1
            ) {
                cooldownembed
                    .setColor("#fff5e3")
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
                            value: `\`${time_split(command.cooldown)}\``,
                            inline: true,
                        }
                    );
            } else {
                cooldownembed
                    .setDescription(
                        `\`${
                            command.cdmsg || "Chillax bro!"
                        }\`\nYou have **DEFAULT** cooldown\nTry the command again in **${timeleft_human}**`
                    )
                    .addFields(
                        {
                            name: `**Default Cooldown**`,
                            value: `\`${time_split(command.cooldown)}\``,
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

            return true;
        }
        return false;
    }

    static async checkAlert(interaction) {
        const alertDatas = await AlertModel.find({});
        let hasunread = false;

        alertDatas.forEach((alert) => {
            if (!alert.usersRead.includes(interaction.user.id)) {
                return (hasunread = true);
            }
        });

        if (hasunread === true) {
            return interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor(await fetchEmbedColor(interaction))
                        .setDescription(
                            `${interaction.user}, you have an unread alert! To check the alert, run \`/alert\``
                        ),
                ],
                ephemeral: true,
            });
        }
    }

    static async setEventCooldown(userId, cooldownname, cooldownduration) {
        const fetch_userData = await fetchUserData(userId);
        const userData = fetch_userData.data;
        const cooldownendtimestamp = Date.now() + cooldownduration * 1000;
        userData.eventcooldowns[cooldownname] = cooldownendtimestamp;
        await UserModel.findOneAndUpdate({ userId: userData.userId }, userData);
    }

    static async checkEventCooldown(userId, cooldownname) {
        const fetch_userData = await fetchUserData(userId);
        const userData = fetch_userData.data;
        const cooldownleft = userData.eventcooldowns[cooldownname] - Date.now();
        const coodown_object = {
            status: false,
            rawcooldown: userData.eventcooldowns[cooldownname],
            cooldownleft: cooldownleft,
        };

        if (userData.eventcooldowns[cooldownname]) {
            if (Date.now() < userData.eventcooldowns[cooldownname]) {
                coodown_object.status = true;
            }
        }

        return coodown_object;
    }

    static async checknewaccount(userId) {
        const fetch_economyData = await fetchEconomyData(userId);
        const fetch_statsData = await fetchStatsData(userId);
        const economyData = fetch_economyData.data;
        const statsData = fetch_statsData.data;
        const createdtimestamp = new Date(economyData.createdAt);
        const readytimestamp = createdtimestamp.getTime() + 1209600000;
        let newaccount = false;

        if (Date.now() < readytimestamp || statsData.commands.all < 2000) {
            newaccount = true;
        }

        const newacount_object = {
            rawboolean: newaccount,
            commandsleft: 2000 - statsData.commands.all,
            timeleft: readytimestamp - Date.now(),
            readytimestamp: readytimestamp,
            commandsleft_display: `${statsData.commands.all.toLocaleString()}/2,000`,
        };

        return newacount_object;
    }
}

module.exports = Mainfunctions;
