const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

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
    data: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("Vote rewards you can get from voting every 12 hours."),
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
        jsoncooldowns[interaction.user.id].vote = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
            
        const nowtimestamp = Date.now()

        const topggvoterewards_coins = 50000;
        const topggvoterewards_items = [{ item: "chestofcommon", quantity: 5 }, { item: "bankmessage", quantity: 5 }];
        const topgglastvotedtimestamp = userData.eventcooldowns.vote_topgg
        const topggvotetimestampready = topgglastvotedtimestamp + 43200000
        
       

        const voterewards_items_map = topggvoterewards_items.map((element) => {
            const item = allItems.find(
                (val) => val.item.toLowerCase() === element.item
            );

            return `\` > \` ${item.icon} \`${
                item.item
            }\` \`x${element.quantity.toLocaleString()}\``;
        }).join("\n");

        const topggbutton = new MessageButton()
            .setLabel("top.gg")
            .setStyle("LINK")
            .setEmoji("<:topgg:995813492424716399>")
            .setURL("https://top.gg/bot/847528987831304192")
            .setDisabled(false);
        
        if(topgglastvotedtimestamp > nowtimestamp) {
            const timeleft = topgglastvotedtimestamp - nowtimestamp;
            const formattime = time_split(timeleft)
            topggbutton
                .setLabel(formattime)
                .setDisabled()

        }

        const row = new MessageActionRow().addComponents(topggbutton);

        const votembed = new MessageEmbed()
            .setTitle("Voting Rewards For Xenon")
            .setDescription(
                `[**top.gg** <:topgg:995813492424716399>](https://top.gg/bot/847528987831304192)\n\` > \` \`❀ ${topggvoterewards_coins.toLocaleString()}\`\n${voterewards_items_map}`
            );

        return interaction.reply({ embeds: [votembed], components: [row] });
    },
};
