const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    fetchStatsData,
} = require("../../utils/currencyfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const { fetchMultipliers } = require("../../utils/userfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("multipliers")
        .setDescription(
            "Check what multipliers you have for gambling coin win increase."
        ),
    cooldown: 3,
    async execute(interaction, client, theme) {
        const multipliers_fetch = await fetchMultipliers(interaction.user.id);
        const multipliers_map = multipliers_fetch.data
            .map((multiplier) => {
                return {
                    multiplier: multiplier.multiplier,
                    display: `\`+ ${multiplier.multiplier}%\` ➜ ${multiplier.description}`,
                };
            })
            .sort(function (a, b) {
                return b.multiplier - a.multiplier;
            });

        const multipliers_display = multipliers_map.map((multiplier) => {
            return multiplier.display;
        });

        const multipliers = multipliers_fetch.data;
        const itemsperpage = 8;

        let lastpage;
        if (multipliers.length % itemsperpage > 0) {
            lastpage = Math.floor(multipliers.length / itemsperpage) + 1;
        } else {
            lastpage = multipliers.length / itemsperpage;
        }

        let page = 1;
        let display_start = (page - 1) * itemsperpage;
        let display_end = page * itemsperpage;

        const multipliers_embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Multipliers`)
            .setFooter({
                text: `Max Multiplier: ${multipliers_fetch.maxmultiplier}%`,
            });

        if (lastpage === 1) {
            let pagebutton = new ButtonBuilder()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();
            let leftfarbutton = new ButtonBuilder()
                .setCustomId("leftfar")
                .setLabel("<<")
                .setStyle("PRIMARY")
                .setDisabled();

            let leftbutton = new ButtonBuilder()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightfarbutton = new ButtonBuilder()
                .setCustomId("rightfar")
                .setLabel(">>")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightbutton = new ButtonBuilder()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY")
                .setDisabled();

            let row = new ActionRowBuilder().addComponents(
                leftfarbutton,
                leftbutton,
                pagebutton,
                rightbutton,
                rightfarbutton
            );
            multipliers_embed.setDescription(
                `Total Multiplier: \`${
                    multipliers_fetch.multiplier
                }%\`\n${multipliers_display
                    .slice(display_start, display_end)
                    .join("\n")}`
            );

            return interaction.reply({
                embeds: [multipliers_embed],
                components: [row],
            });
        } else {
            let pagebutton = new ButtonBuilder()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();
            let leftfarbutton = new ButtonBuilder()
                .setCustomId("leftfar")
                .setLabel("<<")
                .setStyle("PRIMARY")
                .setDisabled();

            let leftbutton = new ButtonBuilder()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightfarbutton = new ButtonBuilder()
                .setCustomId("rightfar")
                .setLabel(">>")
                .setStyle("PRIMARY");

            let rightbutton = new ButtonBuilder()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY");

            let row = new ActionRowBuilder().addComponents(
                leftfarbutton,
                leftbutton,
                pagebutton,
                rightbutton,
                rightfarbutton
            );

            multipliers_embed.setDescription(
                `Total Multiplier: \`${
                    multipliers_fetch.multiplier
                }%\`\n\n${multipliers_display
                    .slice(display_start, display_end)
                    .join("\n")}`
            );

            interaction.reply({
                embeds: [multipliers_embed],
                components: [row],
            });

            const multipliers_msg = await interaction.fetchReply();

            const collector = multipliers_msg.createMessageComponentCollector({
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
                        leftfarbutton.setDisabled(false);
                        rightbutton.setDisabled();
                        rightfarbutton.setDisabled();

                        multipliers_embed.setDescription(
                            `Total Multiplier: \`${
                                multipliers_fetch.multiplier
                            }%\`\n\n${multipliers_display
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );

                        await multipliers_msg.edit({
                            embeds: [multipliers_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);

                        multipliers_embed.setDescription(
                            `Total Multiplier: \`${
                                multipliers_fetch.multiplier
                            }%\`\n\n${multipliers_display
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );
                        await multipliers_msg.edit({
                            embeds: [multipliers_embed],
                            components: [row],
                        });
                    }
                } else if (button.customId === "rightfar") {
                    page = lastpage;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    if (page === lastpage) {
                        leftbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightbutton.setDisabled();
                        rightfarbutton.setDisabled();

                        multipliers_embed.setDescription(
                            `Total Multiplier: \`${
                                multipliers_fetch.multiplier
                            }%\`\n\n${multipliers_display
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );

                        await multipliers_msg.edit({
                            embeds: [multipliers_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);

                        multipliers_embed.setDescription(
                            `Total Multiplier: \`${
                                multipliers_fetch.multiplier
                            }%\`\n\n${multipliers_display
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );
                        await multipliers_msg.edit({
                            embeds: [multipliers_embed],
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
                        rightfarbutton.setDisabled(false);
                        leftbutton.setDisabled();
                        leftfarbutton.setDisabled();

                        multipliers_embed.setDescription(
                            `Total Multiplier: \`${
                                multipliers_fetch.multiplier
                            }%\`\n\n${multipliers_display
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );
                        await multipliers_msg.edit({
                            embeds: [multipliers_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);

                        multipliers_embed.setDescription(
                            `Total Multiplier: \`${
                                multipliers_fetch.multiplier
                            }%\`\n\n${multipliers_display
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );

                        await multipliers_msg.edit({
                            embeds: [multipliers_embed],
                            components: [row],
                        });
                    }
                } else if (button.customId === "leftfar") {
                    page = 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    if (page === 1) {
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftbutton.setDisabled();
                        leftfarbutton.setDisabled();

                        multipliers_embed.setDescription(
                            `Total Multiplier: \`${
                                multipliers_fetch.multiplier
                            }%\`\n\n${multipliers_display
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );

                        await multipliers_msg.edit({
                            embeds: [multipliers_embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);

                        multipliers_embed.setDescription(
                            `Total Multiplier: \`${
                                multipliers_fetch.multiplier
                            }%\`\n\n${multipliers_display
                                .slice(display_start, display_end)
                                .join("\n")}`
                        );

                        await multipliers_msg.edit({
                            embeds: [multipliers_embed],
                            components: [row],
                        });
                    }
                }
            });

            collector.on("end", (collected) => {
                multipliers_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                multipliers_msg.edit({
                    components: multipliers_msg.components,
                });
            });
        }

        console.log(multipliers_display);
    },
};
