const { MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Check a user's inventory.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("Specify a user's inventory you want to see");
        }),
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

        const options = {
            user: interaction.options.getUser("user"),
        };

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
        jsoncooldowns[interaction.user.id].inventory = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
        let target = options.user;

        if (target) {
            const emptyembed = {
                description:
                    "`This user has nothing in their inventory move along.`",
            };
            inventoryModel.findOne({ userId: target.id }, async (err, data) => {
                if (!data) {
                    return interaction.reply({ embeds: [emptyembed] });
                }

                const mappedData = Object.keys(data.inventory)
                    .sort()
                    .map((key) => {
                        if (data.inventory[key] === 0) {
                            return;
                        } else {
                            const item = allItems.find(
                                (val) => val.item.toLowerCase() === key
                            );
                            return `${
                                item.icon
                            } \`${key}\` ── \`${data.inventory[
                                key
                            ].toLocaleString()}\``;
                        }
                    })
                    .filter(Boolean);

                if (mappedData.length === 0) {
                    return interaction.reply({ embeds: [emptyembed] });
                } else {
                    const inventory = Object.values(data.inventory).filter(
                        Boolean
                    );
                    const invlength = inventory.length;
                    const itemsperpage = 16;

                    let lastpage;
                    if (invlength % itemsperpage > 0) {
                        lastpage = Math.floor(invlength / itemsperpage) + 1;
                    } else {
                        lastpage = invlength / itemsperpage;
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
                        let leftfarbutton = new MessageButton()
                            .setCustomId("leftfar")
                            .setLabel("<<")
                            .setStyle("PRIMARY")
                            .setDisabled();

                        let leftbutton = new MessageButton()
                            .setCustomId("left")
                            .setLabel("<")
                            .setStyle("PRIMARY")
                            .setDisabled();

                        let rightfarbutton = new MessageButton()
                            .setCustomId("rightfar")
                            .setLabel(">>")
                            .setStyle("PRIMARY")
                            .setDisabled();

                        let rightbutton = new MessageButton()
                            .setCustomId("right")
                            .setLabel(">")
                            .setStyle("PRIMARY")
                            .setDisabled();

                        let row = new MessageActionRow().addComponents(
                            leftfarbutton,
                            leftbutton,
                            pagebutton,
                            rightbutton,
                            rightfarbutton
                        );

                        embed = {
                            color: "RANDOM",
                            title: `Inventory`,
                            author: {
                                name: `${target.username}#${target.discriminator}`,
                                icon_url: `${target.displayAvatarURL()}`,
                            },
                            description: `${mappedData
                                .slice(display_start, display_end)
                                .join("\n")}`,

                            footer: {
                                text: `/inventory`,
                            },
                        };

                        return interaction.reply({
                            embeds: [embed],
                            components: [row],
                        });
                    } else {
                        let pagebutton = new MessageButton()
                            .setCustomId("page")
                            .setLabel(`${page}/${lastpage}`)
                            .setStyle("SECONDARY")
                            .setDisabled();
                        let leftfarbutton = new MessageButton()
                            .setCustomId("leftfar")
                            .setLabel("<<")
                            .setStyle("PRIMARY")
                            .setDisabled();

                        let leftbutton = new MessageButton()
                            .setCustomId("left")
                            .setLabel("<")
                            .setStyle("PRIMARY")
                            .setDisabled();

                        let rightfarbutton = new MessageButton()
                            .setCustomId("rightfar")
                            .setLabel(">>")
                            .setStyle("PRIMARY");

                        let rightbutton = new MessageButton()
                            .setCustomId("right")
                            .setLabel(">")
                            .setStyle("PRIMARY");

                        let row = new MessageActionRow().addComponents(
                            leftfarbutton,
                            leftbutton,
                            pagebutton,
                            rightbutton,
                            rightfarbutton
                        );

                        embed = {
                            color: "RANDOM",
                            title: `Inventory`,
                            author: {
                                name: `${target.username}#${target.discriminator}`,
                                icon_url: `${target.displayAvatarURL()}`,
                            },
                            description: `${mappedData
                                .slice(display_start, display_end)
                                .join("\n")}`,

                            footer: {
                                text: `/inventory`,
                            },
                        };

                        await interaction.reply({
                            embeds: [embed],
                            components: [row],
                        });

                        const inv_msg = await interaction.fetchReply();

                        const collector =
                            inv_msg.createMessageComponentCollector({
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
                                    leftfarbutton.setDisabled(false);
                                    rightbutton.setDisabled();
                                    rightfarbutton.setDisabled();

                                    embed = {
                                        color: "RANDOM",
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData
                                            .slice(display_start, display_end)
                                            .join("\n")}`,

                                        footer: {
                                            text: `/inventory`,
                                        },
                                    };

                                    inv_msg.edit({
                                        embeds: [embed],
                                        components: [row],
                                    });
                                } else {
                                    leftbutton.setDisabled(false);
                                    rightbutton.setDisabled(false);
                                    leftfarbutton.setDisabled(false);
                                    rightfarbutton.setDisabled(false);

                                    embed = {
                                        color: "RANDOM",
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData
                                            .slice(display_start, display_end)
                                            .join("\n")}`,

                                        footer: {
                                            text: `/inventory`,
                                        },
                                    };

                                    inv_msg.edit({
                                        embeds: [embed],
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

                                    embed = {
                                        color: "RANDOM",
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData
                                            .slice(display_start, display_end)
                                            .join("\n")}`,

                                        footer: {
                                            text: `/inventory`,
                                        },
                                    };

                                    inv_msg.edit({
                                        embeds: [embed],
                                        components: [row],
                                    });
                                } else {
                                    leftbutton.setDisabled(false);
                                    rightbutton.setDisabled(false);
                                    leftfarbutton.setDisabled(false);
                                    rightfarbutton.setDisabled(false);

                                    embed = {
                                        color: "RANDOM",
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData
                                            .slice(display_start, display_end)
                                            .join("\n")}`,

                                        footer: {
                                            text: `/inventory`,
                                        },
                                    };

                                    inv_msg.edit({
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
                                    leftbutton.setDisabled();
                                    leftfarbutton.setDisabled();
                                    rightbutton.setDisabled(false);
                                    rightfarbutton.setDisabled(false);

                                    embed = {
                                        color: "RANDOM",
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData
                                            .slice(display_start, display_end)
                                            .join("\n")}`,

                                        footer: {
                                            text: `/inventory`,
                                        },
                                    };

                                    inv_msg.edit({
                                        embeds: [embed],
                                        components: [row],
                                    });
                                } else {
                                    leftbutton.setDisabled(false);
                                    rightbutton.setDisabled(false);
                                    leftfarbutton.setDisabled(false);
                                    rightfarbutton.setDisabled(false);
                                    embed = {
                                        color: "RANDOM",
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData
                                            .slice(display_start, display_end)
                                            .join("\n")}`,

                                        footer: {
                                            text: `/inventory`,
                                        },
                                    };

                                    inv_msg.edit({
                                        embeds: [embed],
                                        components: [row],
                                    });
                                }
                            } else if (button.customId === "leftfar") {
                                page = 1;
                                display_start = (page - 1) * itemsperpage;
                                display_end = page * itemsperpage;
                                pagebutton.setLabel(`${page}/${lastpage}`);

                                if (page === 1) {
                                    leftbutton.setDisabled();
                                    leftfarbutton.setDisabled();
                                    rightbutton.setDisabled(false);
                                    rightfarbutton.setDisabled(false);

                                    embed = {
                                        color: "RANDOM",
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData
                                            .slice(display_start, display_end)
                                            .join("\n")}`,

                                        footer: {
                                            text: `/inventory`,
                                        },
                                    };

                                    inv_msg.edit({
                                        embeds: [embed],
                                        components: [row],
                                    });
                                } else {
                                    leftbutton.setDisabled(false);
                                    rightbutton.setDisabled(false);
                                    leftfarbutton.setDisabled(false);
                                    rightfarbutton.setDisabled(false);
                                    embed = {
                                        color: "RANDOM",
                                        title: `Inventory`,
                                        author: {
                                            name: `${target.username}#${target.discriminator}`,
                                            icon_url: `${target.displayAvatarURL()}`,
                                        },
                                        description: `${mappedData
                                            .slice(display_start, display_end)
                                            .join("\n")}`,

                                        footer: {
                                            text: `/inventory`,
                                        },
                                    };

                                    inv_msg.edit({
                                        embeds: [embed],
                                        components: [row],
                                    });
                                }
                            }
                        });

                        collector.on("end", (collected) => {
                            inv_msg.components[0].components.forEach((c) => {
                                c.setDisabled();
                            });
                            inv_msg.edit({
                                components: inv_msg.components,
                            });
                        });
                    }
                }
            });
        } else {
            const emptyembed = {
                description: "`You got nothing in your inventory.`",
            };

            if (!inventoryData.inventory)
                return interaction.reply({ embeds: [emptyembed] });

            const mappedData = Object.keys(inventoryData.inventory)
                .sort()
                .map((key) => {
                    if (inventoryData.inventory[key] === 0) {
                        return;
                    } else {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === key
                        );
                        return `${
                            item.icon
                        } \`${key}\` ── \`${inventoryData.inventory[
                            key
                        ].toLocaleString()}\``;
                    }
                })
                .filter(Boolean);

            if (mappedData.length === 0) {
                return interaction.reply({ embeds: [emptyembed] });
            } else {
                const inventory = Object.values(inventoryData.inventory).filter(
                    Boolean
                );
                const invlength = inventory.length;
                const itemsperpage = 16;

                let lastpage;
                if (invlength % itemsperpage > 0) {
                    lastpage = Math.floor(invlength / itemsperpage) + 1;
                } else {
                    lastpage = invlength / itemsperpage;
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
                    let leftfarbutton = new MessageButton()
                        .setCustomId("leftfar")
                        .setLabel("<<")
                        .setStyle("PRIMARY")
                        .setDisabled();

                    let leftbutton = new MessageButton()
                        .setCustomId("left")
                        .setLabel("<")
                        .setStyle("PRIMARY")
                        .setDisabled();

                    let rightfarbutton = new MessageButton()
                        .setCustomId("rightfar")
                        .setLabel(">>")
                        .setStyle("PRIMARY")
                        .setDisabled();

                    let rightbutton = new MessageButton()
                        .setCustomId("right")
                        .setLabel(">")
                        .setStyle("PRIMARY")
                        .setDisabled();

                    let row = new MessageActionRow().addComponents(
                        leftfarbutton,
                        leftbutton,
                        pagebutton,
                        rightbutton,
                        rightfarbutton
                    );

                    embed = {
                        color: "RANDOM",
                        title: `Inventory`,
                        author: {
                            name: `${interaction.user.username}#${interaction.user.discriminator}`,
                            icon_url: `${interaction.user.displayAvatarURL()}`,
                        },
                        description: `${mappedData
                            .slice(display_start, display_end)
                            .join("\n")}`,

                        footer: {
                            text: `/inventory`,
                        },
                    };

                    return interaction.reply({
                        embeds: [embed],
                        components: [row],
                    });
                } else {
                    let pagebutton = new MessageButton()
                        .setCustomId("page")
                        .setLabel(`${page}/${lastpage}`)
                        .setStyle("SECONDARY")
                        .setDisabled();
                    let leftfarbutton = new MessageButton()
                        .setCustomId("leftfar")
                        .setLabel("<<")
                        .setStyle("PRIMARY")
                        .setDisabled();

                    let leftbutton = new MessageButton()
                        .setCustomId("left")
                        .setLabel("<")
                        .setStyle("PRIMARY")
                        .setDisabled();

                    let rightfarbutton = new MessageButton()
                        .setCustomId("rightfar")
                        .setLabel(">>")
                        .setStyle("PRIMARY");

                    let rightbutton = new MessageButton()
                        .setCustomId("right")
                        .setLabel(">")
                        .setStyle("PRIMARY");

                    let row = new MessageActionRow().addComponents(
                        leftfarbutton,
                        leftbutton,
                        pagebutton,
                        rightbutton,
                        rightfarbutton
                    );

                    embed = {
                        color: "RANDOM",
                        title: `Inventory`,
                        author: {
                            name: `${interaction.user.username}#${interaction.user.discriminator}`,
                            icon_url: `${interaction.user.displayAvatarURL()}`,
                        },
                        description: `${mappedData
                            .slice(display_start, display_end)
                            .join("\n")}`,

                        footer: {
                            text: `/inventory`,
                        },
                    };

                    await interaction.reply({
                        embeds: [embed],
                        components: [row],
                    });

                    const inv_msg = await interaction.fetchReply();

                    const collector = inv_msg.createMessageComponentCollector({
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
                                leftfarbutton.setDisabled(false);
                                rightbutton.setDisabled();
                                rightfarbutton.setDisabled();

                                embed = {
                                    color: "RANDOM",
                                    title: `Inventory`,
                                    author: {
                                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData
                                        .slice(display_start, display_end)
                                        .join("\n")}`,

                                    footer: {
                                        text: `/inventory`,
                                    },
                                };

                                await inv_msg.edit({
                                    embeds: [embed],
                                    components: [row],
                                });
                            } else {
                                leftbutton.setDisabled(false);
                                rightbutton.setDisabled(false);
                                rightfarbutton.setDisabled(false);
                                leftfarbutton.setDisabled(false);

                                embed = {
                                    color: "RANDOM",
                                    title: `Inventory`,
                                    author: {
                                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData
                                        .slice(display_start, display_end)
                                        .join("\n")}`,

                                    footer: {
                                        text: `/inventory`,
                                    },
                                };

                                await inv_msg.edit({
                                    embeds: [embed],
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

                                embed = {
                                    color: "RANDOM",
                                    title: `Inventory`,
                                    author: {
                                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData
                                        .slice(display_start, display_end)
                                        .join("\n")}`,

                                    footer: {
                                        text: `/inventory`,
                                    },
                                };

                                await inv_msg.edit({
                                    embeds: [embed],
                                    components: [row],
                                });
                            } else {
                                leftbutton.setDisabled(false);
                                rightbutton.setDisabled(false);
                                rightfarbutton.setDisabled(false);
                                leftfarbutton.setDisabled(false);

                                embed = {
                                    color: "RANDOM",
                                    title: `Inventory`,
                                    author: {
                                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData
                                        .slice(display_start, display_end)
                                        .join("\n")}`,

                                    footer: {
                                        text: `/inventory`,
                                    },
                                };

                                await inv_msg.edit({
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
                                rightfarbutton.setDisabled(false);
                                leftbutton.setDisabled();
                                leftfarbutton.setDisabled();

                                embed = {
                                    color: "RANDOM",
                                    title: `Inventory`,
                                    author: {
                                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData
                                        .slice(display_start, display_end)
                                        .join("\n")}`,

                                    footer: {
                                        text: `/inventory`,
                                    },
                                };

                                await inv_msg.edit({
                                    embeds: [embed],
                                    components: [row],
                                });
                            } else {
                                leftbutton.setDisabled(false);
                                rightbutton.setDisabled(false);
                                rightfarbutton.setDisabled(false);
                                leftfarbutton.setDisabled(false);

                                embed = {
                                    color: "RANDOM",
                                    title: `Inventory`,
                                    author: {
                                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData
                                        .slice(display_start, display_end)
                                        .join("\n")}`,

                                    footer: {
                                        text: `/inventory`,
                                    },
                                };

                                await inv_msg.edit({
                                    embeds: [embed],
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

                                embed = {
                                    color: "RANDOM",
                                    title: `Inventory`,
                                    author: {
                                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData
                                        .slice(display_start, display_end)
                                        .join("\n")}`,

                                    footer: {
                                        text: `/inventory`,
                                    },
                                };

                                await inv_msg.edit({
                                    embeds: [embed],
                                    components: [row],
                                });
                            } else {
                                leftbutton.setDisabled(false);
                                rightbutton.setDisabled(false);
                                rightfarbutton.setDisabled(false);
                                leftfarbutton.setDisabled(false);

                                embed = {
                                    color: "RANDOM",
                                    title: `Inventory`,
                                    author: {
                                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    description: `${mappedData
                                        .slice(display_start, display_end)
                                        .join("\n")}`,

                                    footer: {
                                        text: `/inventory`,
                                    },
                                };

                                await inv_msg.edit({
                                    embeds: [embed],
                                    components: [row],
                                });
                            }
                        }
                    });

                    collector.on("end", (collected) => {
                        inv_msg.components[0].components.forEach((c) => {
                            c.setDisabled();
                        });
                        inv_msg.edit({
                            components: inv_msg.components,
                        });
                    });
                }
            }
        }
    },
};
