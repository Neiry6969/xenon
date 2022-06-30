const inventoryModel = require("../../models/inventorySchema");
const dropModel = require("../../models/dropSchema");
const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");

const jsoncooldowns = require("../../cooldowns.json");
const interactionproccesses = require("../../interactionproccesses.json");
const fs = require("fs");
const {
    MessageEmbed,
    MessageSelectMenu,
    MessageActionRow,
    MessageButton,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
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
        .setName("drops")
        .setDescription("Limited drop items."),
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
        jsoncooldowns[interaction.user.id].drop = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
        const errorembed = new MessageEmbed().setColor("#FF5C5C");

        let drops = await dropModel.find({});

        if (drops.length === 0) {
            errorembed.setDescription("There are no drops currently.");
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        const mappedData = drops
            .map((v) => {
                const amountleft = v.maxdrop - v.amountbought;
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === v.item
                );
                return `${item.icon} **${item.name}**\nID: \`${
                    item.item
                }\`\nAmount Left: \`${amountleft.toLocaleString()}/${v.maxdrop.toLocaleString()}\`\nMax Per User: \`${v.maxperuser.toLocaleString()}\``;
            })
            .join("\n\n");

        const mappedDropOptions = drops.map((v) => {
            const item = allItems.find(
                (val) => val.item.toLowerCase() === v.item
            );
            return {
                label: item.name,
                value: item.item,
                emoji: item.icon,
            };
        });

        let endinteractionbutton = new MessageButton()
            .setCustomId("endinteraction")
            .setLabel("End Interaction")
            .setStyle("SECONDARY");

        let dropmenu = new MessageSelectMenu()
            .setCustomId("dropmenu")
            .setMinValues(0)
            .setMaxValues(1)
            // .setDisabled(true)
            .addOptions(mappedDropOptions);

        let row = new MessageActionRow().addComponents(dropmenu);
        let row2 = new MessageActionRow().addComponents(endinteractionbutton);

        const drops_embed = new MessageEmbed()
            .setColor("RANDOM")
            .setDescription(mappedData);

        await interaction.reply({
            embeds: [drops_embed],
            components: [row, row2],
        });

        const drop_msg = await interaction.fetchReply();

        interactionproccesses[interaction.user.id] = {
            interaction: true,
            proccessingcoins: true,
        };
        fs.writeFile(
            "./interactionproccesses.json",
            JSON.stringify(interactionproccesses),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        const collector = await drop_msg.createMessageComponentCollector({
            idle: 30 * 1000,
        });

        collector.on("collect", async (i) => {
            if (i.user.id != interaction.user.id) {
                return i.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            i.deferUpdate();

            if (i.customId === "endinteraction") {
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
                };
                fs.writeFile(
                    "./interactionproccesses.json",
                    JSON.stringify(interactionproccesses),
                    (err) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                );
                drop_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                drop_msg.components[1].components.forEach((c) => {
                    c.setDisabled();
                });

                return drop_msg.edit({
                    components: drop_msg.components,
                });
            } else if (i.customId === "dropmenu") {
          
                const selecteddrop = i.values[0];
                const dropinfo = await dropModel.findOne({
                    item: selecteddrop,
                });

                const dropitem = allItems.find(
                    (val) => val.item.toLowerCase() === dropinfo.item
                );

                const amountleft = dropinfo.maxdrop - dropinfo.amountbought;
                const dropinfo_map = `${dropitem.icon} **${
                    dropitem.name
                }**\nID: \`${
                    dropitem.item
                }\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${dropinfo.maxperuser.toLocaleString()}\``;

                let userbought = dropinfo.usersbuyobject[interaction.user.id]
                
                if(!dropinfo.usersbuyobject[interaction.user.id]) {
                    userbought = 0
                    dropinfo.usersbuyobject[interaction.user.id] = 0
                    
                    await dropModel.findOneAndUpdate({ item: selecteddrop }, dropinfo)
                }
                let buydropbutton = new MessageButton()
                    .setCustomId("buydropbutton")
                    .setLabel("Buy Drop")
                    .setEmoji(dropitem.icon)
                    .setStyle("PRIMARY");

                row.setComponents(buydropbutton);

                drops_embed.setDescription(dropinfo_map);
                await drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
                
                
            }
        });

        collector.on("end", (collected) => {
            interactionproccesses[interaction.user.id] = {
                interaction: false,
                proccessingcoins: false,
            };
            fs.writeFile(
                "./interactionproccesses.json",
                JSON.stringify(interactionproccesses),
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
            drop_msg.components[0].components.forEach((c) => {
                c.setDisabled();
            });
            drop_msg.components[1].components.forEach((c) => {
                c.setDisabled();
            });
            drop_msg.edit({
                components: drop_msg.components,
            });
        });
    },
};
