const { SlashCommandBuilder } = require("@discordjs/builders");
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
        .setName("ping")
        .setDescription("Check the bot's latency status."),
    cooldown: 10,
    async execute(interaction, client, userData) {
        const embed = {
            color: `#2f3136`,
            title: `${client.user.username}'s Bot Latency`,
            description: `Here are the bot's latencies...`,
            author: {
                name: `${client.user.username}`,
                icon_url: `${client.user.displayAvatarURL()}`,
            },
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/Sqq8x0LOEM7_G8spfygf8QrW_vcMdIwNODmHH1LCzzQ/https/i.gifer.com/UUG2.gif?width=390&height=427",
            },
            fields: [
                {
                    name: "Ping Latency",
                    value: `<:moon:962410227104383006> \`${
                        Date.now() - interaction.createdTimestamp
                    }\`ms`,
                    inline: true,
                },
                {
                    name: "API Latency",
                    value: `<:moon:962410227104383006> \`${Math.round(
                        client.ws.ping
                    )}\`ms`,
                    inline: true,
                },
            ],
            timestamp: new Date(),
        };

        interaction.reply({ embeds: [embed] });
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
        jsoncooldowns[interaction.user.id].ping = timpstamp;
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
