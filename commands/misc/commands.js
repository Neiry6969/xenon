const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    fetchStatsData,
} = require("../../utils/currencyfunctions");
const { setCooldown } = require("../../utils/mainfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("commands")
        .setDescription("Check what commands a user has ran.")
        .addUserOption((oi) => {
            return oi.setName("user").setDescription("Specify a user");
        }),
    cdmsg: `You can't be checking commands so fast, chilldown!`,
    cooldown: 3,
    async execute(interaction, client, theme) {
        const options = {
            user: interaction.options.getUser("user"),
        };

        let user = options.user || interaction.user;

        const commands_embed = new EmbedBuilder()
            .setTitle("Commands")
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${user.tag}`,
                iconURL: user.displayAvatarURL(),
            });

        const economyData = await fetchEconomyData(user.id);
        const statsData = await fetchStatsData(user.id);
        const commandslist = statsData.data.commands.list;

        let commands_map;
        if (!commandslist || Object.keys(commandslist).length <= 0) {
            commands_map = `\`no commands ran\``;
        } else {
            const commands_sort = Object.keys(commandslist)
                .map((key) => {
                    return key;
                })
                .sort(function (a, b) {
                    return commandslist[b] - commandslist[a];
                });
            commands_map = commands_sort.map((key) => {
                return `\`>\` \`${key}\` \`${commandslist[
                    key
                ].toLocaleString()}\``;
            });
        }
        commands_embed.setFooter({
            text: `Total Commands: ${statsData.data.commands.all.toLocaleString()}`,
        });

        const commands = Object.values(commands_map).filter(Boolean);
        const commandslength = commands.length;
        const itemsperpage = 12;

        let lastpage;
        if (commandslength % itemsperpage > 0) {
            lastpage = Math.floor(commandslength / itemsperpage) + 1;
        } else {
            lastpage = commandslength / itemsperpage;
        }

        let page = 1;
        let display_start = (page - 1) * itemsperpage;
        let display_end = page * itemsperpage;

        if (lastpage === 1) {
            let pagebutton = new ButtonBuilder()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();

            let leftbutton = new ButtonBuilder()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightbutton = new ButtonBuilder()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY");

            let row = new ActionRowBuilder().addComponents(
                leftbutton,
                pagebutton,
                rightbutton
            );

            commands_embed.setDescription(`${commands_map.join("\n")}`);

            await interaction.reply({
                embeds: [commands_embed],
                components: [row],
            });
        } else {
            let pagebutton = new ButtonBuilder()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();

            let leftbutton = new ButtonBuilder()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightbutton = new ButtonBuilder()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY");

            let row = new ActionRowBuilder().addComponents(
                leftbutton,
                pagebutton,
                rightbutton
            );

            commands_embed.setDescription(
                `${commands_map.slice(display_start, display_end).join("\n")}`
            );

            await interaction.reply({
                embeds: [commands_embed],
                components: [row],
            });

            const commands_msg = await interaction.fetchReply();

            const collector = commands_msg.createMessageComponentCollector({
                idle: 20 * 1000,
            });

            collector.on("collect", async (button) => {
                if (button.user.id != interaction.user.id) {
                    return button.reply({
                        content: "This is not for you.",
                        ephemeral: true,
                    });
                }

                button.deferUpdate();

                if (button.customId === "right") {
                    page = page + 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    if (page === lastpage) {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled();

                        commands_embed.setDescription(
                            `${commands_map
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );

                        await commands_msg.edit({
                            embeds: [commands_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);

                        commands_embed.setDescription(
                            `${commands_map
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );

                        await commands_msg.edit({
                            embeds: [commands_embed],
                            components: [row],
                        });
                    }
                } else if (button.customId === "left") {
                    page = page - 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    if (page === 1) {
                        rightbutton.setDisabled(false);
                        leftbutton.setDisabled();

                        commands_embed.setDescription(
                            `${commands_map
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );

                        await commands_msg.edit({
                            embeds: [commands_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);

                        commands_embed.setDescription(
                            `${commands_map
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );

                        await commands_msg.edit({
                            embeds: [commands_embed],
                            components: [row],
                        });
                    }
                }
            });

            collector.on("end", (collected) => {
                commands_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                commands_msg.edit({
                    components: commands_msg.components,
                });
            });
        }

        return setCooldown(interaction, "commands", 3, economyData.data);
    },
};
