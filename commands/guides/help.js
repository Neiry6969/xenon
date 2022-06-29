const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help for every avaliable command in Xenon bot.")
        .addStringOption((option) =>
            option
                .setName("command")
                .setDescription("Which command do you want to view.")
        ),
    cooldown: 0,
    async execute(interaction, client) {
        const options = {
            commands: interaction.options.getString("command"),
        };

        const option = options.guide?.toLowerCase();

        const commandFolders = fs.readdirSync("./commands");

        const allcommands = [];
        for (folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`commands/${folder}`)
                .filter((file) => file.endsWith(".js"));

            for (const file of commandFiles) {
                if (file === "help") {
                    return;
                } else {
                    const command = require(`../${folder}/${file}`);
                    const commandinfo = {
                        command: command.data.name,
                        cooldown: command.cooldown,
                        description_short: command.data.description,
                        category: folder,
                    };
                    allcommands.push(commandinfo);
                }
            }
        }
        const helpList = allcommands.map((value) => {
            cmd_str = `<:greyrightarrow:991773636979609681>**${value.command}**\nCategory: \`${value.category}\`\n<:subtopic:971147593998532628>${value.description_short}`;
            return cmd_str;
        });

        const help = Object.values(helpList).filter(Boolean);
        const helplength = help.length;
        const itemsperpage = 5;

        let lastpage;
        if (helplength % itemsperpage > 0) {
            lastpage = Math.floor(helplength / itemsperpage) + 1;
        } else {
            lastpage = helplength / itemsperpage;
        }

        let page = 1;
        let display_start = (page - 1) * itemsperpage;
        let display_end = page * itemsperpage;

        if (lastpage === 1) {
            let pagebutton = new MessageButton()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();

            let leftbutton = new MessageButton()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightbutton = new MessageButton()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY");

            let row = new MessageActionRow().addComponents(
                leftbutton,
                pagebutton,
                rightbutton
            );

            embed = {
                color: "#AF97FE",
                title: `Xenon Help`,
                thumbnail: {
                    url: client.user.displayAvatarURL(),
                },
                description: `${helpList
                    .slice(display_start, display_end)
                    .join("\n\n")}`,
                footer: {
                    text: `/help`,
                },
            };

            interaction.reply({ embeds: [embed], components: [row] });
        } else {
            let pagebutton = new MessageButton()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();

            let leftbutton = new MessageButton()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightbutton = new MessageButton()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY");

            let row = new MessageActionRow().addComponents(
                leftbutton,
                pagebutton,
                rightbutton
            );

            embed = {
                color: "#AF97FE",
                title: `Xenon Help`,
                thumbnail: {
                    url: client.user.displayAvatarURL(),
                },
                description: `${helpList
                    .slice(display_start, display_end)
                    .join("\n\n")}`,
                footer: {
                    text: `/help`,
                },
            };

            await interaction.reply({
                embeds: [embed],
                components: [row],
            });

            const help_msg = await interaction.fetchReply();

            const collector = help_msg.createMessageComponentCollector({
                time: 20 * 1000,
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

                        embed = {
                            color: "#AF97FE",
                            title: `Xenon Help`,
                            thumbnail: {
                                url: client.user.displayAvatarURL(),
                            },
                            description: `${helpList
                                .slice(display_start, display_end)
                                .join("\n\n")}`,
                            footer: {
                                text: `/help`,
                            },
                        };

                        await help_msg.edit({
                            embeds: [embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);

                        embed = {
                            color: "#AF97FE",
                            title: `Xenon Help`,
                            thumbnail: {
                                url: client.user.displayAvatarURL(),
                            },
                            description: `${helpList
                                .slice(display_start, display_end)
                                .join("\n\n")}`,
                            footer: {
                                text: `/help`,
                            },
                        };

                        await help_msg.edit({
                            embeds: [embed],
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

                        embed = {
                            color: "#AF97FE",
                            title: `Xenon Help`,
                            thumbnail: {
                                url: client.user.displayAvatarURL(),
                            },
                            description: `${helpList
                                .slice(display_start, display_end)
                                .join("\n\n")}`,
                            footer: {
                                text: `/help`,
                            },
                        };

                        await help_msg.edit({
                            embeds: [embed],
                            components: [row],
                        });
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);

                        embed = {
                            color: "#AF97FE",
                            title: `Xenon Help`,
                            thumbnail: {
                                url: client.user.displayAvatarURL(),
                            },
                            description: `${helpList
                                .slice(display_start, display_end)
                                .join("\n\n")}`,
                            footer: {
                                text: `/help`,
                            },
                        };

                        await help_msg.edit({
                            embeds: [embed],
                            components: [row],
                        });
                    }
                }
            });

            collector.on("end", (collected) => {
                help_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                help_msg.edit({
                    components: help_msg.components,
                });
            });
        }
    },
};
