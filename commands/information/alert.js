const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const AlertModel = require("../../models//alertSchema");
const { fetchEconomyData } = require("../../utils/currencyfunctions");
const { setCooldown, setProcessingLock } = require("../../utils/mainfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("alert")
        .setDescription("Check alerts from bot developers."),
    cooldown: 10,
    async execute(interaction, client, theme) {
        const alertDatas = await AlertModel.find({});
        const alertList = [];
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const economyData = economyData_fetch.data;

        const alert_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Alerts from developers`);

        alertDatas.forEach((alert) => {
            if (!alert.usersRead.includes(interaction.user.id)) {
                alertList.push(alert);
                const pullIndex = alertDatas.indexOf(alert);
                alertDatas.splice(pullIndex, 1);
            }
        });

        if (alertDatas.length > 0) {
            alertDatas.forEach((alert) => {
                alertList.push(alert);
            });
        }

        if (alertList.length <= 0) {
            alert_embed.setDescription(`\`currently, there is no alerts\``);
            return interaction.reply({
                embeds: [alert_embed],
                ephemeral: true,
            });
        }

        const alertList_displays = alertList
            .map((alert) => {
                return `Alert Released On: <t:${Math.floor(
                    alert.alertId / 1000
                )}:D> (<t:${Math.floor(alert.alertId / 1000)}:R>)\n\n${
                    alert.description
                }`;
            })
            .filter(Boolean);

        const alerts = Object.values(alertList_displays).filter(Boolean);
        const alertslength = alerts.length;
        const itemsperpage = 1;

        let lastpage;
        if (alertslength % itemsperpage > 0) {
            lastpage = Math.floor(alertslength / itemsperpage) + 1;
        } else {
            lastpage = alertslength / itemsperpage;
        }

        let page = 1;
        let display_start = (page - 1) * itemsperpage;
        let display_end = page * itemsperpage;

        alert_embed.setDescription(
            `${alertList_displays.slice(display_start, display_end)}`
        );

        if (!alertList[page - 1].usersRead.includes(interaction.user.id)) {
            alertList[page - 1].usersRead.push(interaction.user.id);
            await AlertModel.findOneAndUpdate(
                { alertId: alertList[page - 1].alertId },
                alertList[page - 1]
            );
            alert_embed.setFields({
                name: `_ _`,
                value: `<a:tick_green:1010681834222407780> *\`Marked this alert as read\`*`,
            });
        } else {
            alert_embed.setFields({
                name: `_ _`,
                value: `*\`You already read this alert\`*`,
            });
        }

        if (alertList.length > 1) {
            alert_embed.setFooter({
                text: `Click button to navigate through alerts`,
            });
            interaction.reply({
                embeds: [alert_embed],
                components: [
                    new MessageActionRow().setComponents(
                        new MessageButton()
                            .setCustomId("page")
                            .setStyle("SECONDARY")
                            .setDisabled()
                            .setLabel(`${page}/${lastpage}`),
                        new MessageButton()
                            .setCustomId("next")
                            .setStyle("PRIMARY")
                            .setEmoji("<a:heart_right:1009840455799820410>")
                    ),
                    new MessageActionRow().setComponents(
                        new MessageButton()
                            .setCustomId("endinteraction")
                            .setStyle("SECONDARY")
                            .setLabel(`End Interaction`)
                    ),
                ],
            });

            const alert_msg = await interaction.fetchReply();
            const collector = alert_msg.createMessageComponentCollector({
                idle: 20 * 1000,
            });

            setProcessingLock(interaction.user.id, true);
            collector.on("collect", async (button) => {
                if (button.user.id != interaction.user.id) {
                    return button.reply({
                        content: "This is not for you.",
                        ephemeral: true,
                    });
                }

                button.deferUpdate();

                if (button.customId === "endinteraction") {
                    alert_msg.components[0].components.forEach((c) => {
                        c.setDisabled();
                    });
                    alert_msg.components[1].components.forEach((c) => {
                        c.setDisabled();
                    });
                    alert_msg.edit({
                        components: alert_msg.components,
                    });
                    setProcessingLock(interaction.user.id, false);
                } else if (button.customId === "next") {
                    if (page === lastpage) {
                        page = 1;
                    } else {
                        page += 1;
                    }
                    alert_msg.components[0].components[0].setLabel(
                        `${page}/${lastpage}`
                    );
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    alert_embed.setDescription(
                        `${alertList_displays.slice(
                            display_start,
                            display_end
                        )}`
                    );
                    if (
                        !alertList[page - 1].usersRead.includes(
                            interaction.user.id
                        )
                    ) {
                        alertList[page - 1].usersRead.push(interaction.user.id);
                        await AlertModel.findOneAndUpdate(
                            { alertId: alertList[page - 1].alertId },
                            alertList[page - 1]
                        );
                        alert_embed.setFields({
                            name: `_ _`,
                            value: `<a:tick_green:1010681834222407780> *\`Marked this alert as read\`*`,
                        });
                    } else {
                        alert_embed.setFields({
                            name: `_ _`,
                            value: `*\`You already read this alert\`*`,
                        });
                    }

                    await alert_msg.edit({
                        embeds: [alert_embed],
                        components: alert_msg.components,
                    });
                }
            });

            collector.on("end", (collected) => {
                setProcessingLock(interaction.user.id, false);

                alert_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                alert_msg.components[1].components.forEach((c) => {
                    c.setDisabled();
                });
                alert_msg.edit({
                    components: alert_msg.components,
                });
            });
        } else {
            interaction.reply({
                embeds: [alert_embed],
            });
        }
        setCooldown(interaction, "alert", 10, economyData);
    },
};
