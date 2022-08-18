const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");
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
        .setName("invite")
        .setDescription("Invite the bot to your server."),

    cooldown: 5,
    async execute(interaction, client, userData) {
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel("Click To Invite")
                .setStyle("LINK")
                .setURL(
                    "https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot%20applications.commands"
                )
                .setDisabled(false)
        );

        const embed = {
            color: `#2f3136`,
            title: `Invite ${client.user.username} To Your Server!`,
            description: `Click the button below to invite the bot.
            Here is extra url: [\`https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot%20applications.commands\`](https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot%20applications.commands)`,
            author: {
                name: `${client.user.username}`,
                icon_url: `${client.user.displayAvatarURL()}`,
            },
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/Sqq8x0LOEM7_G8spfygf8QrW_vcMdIwNODmHH1LCzzQ/https/i.gifer.com/UUG2.gif?width=390&height=427",
            },
            timestamp: new Date(),
        };

        interaction.reply({
            ephemeral: true,
            embeds: [embed],
            components: [row],
        });
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
        jsoncooldowns[interaction.user.id].invite = timpstamp;
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
