const {
    Collection,
    MessageActionRow,
    MessageSelectMenu,
    MessageEmbed,
    MessageButton,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    editusersettings,
    fetchSettingsData,
    fetchEconomyData,
} = require("../../utils/currencyfunctions");
const { setCooldown, setProcessingLock } = require("../../utils/mainfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("usersettings")
        .setDescription("Configure and personalize your experience on xenon."),
    cooldown: 15,
    async execute(interaction, client, theme) {
        let fetch_settingsData = await fetchSettingsData(interaction.user.id);
        let settingsData = fetch_settingsData.data;
        const settings = {
            dmnotifications: {
                title: `Direct Message Notifications`,
                description: `Direct Message to send you notifications.`,
            },
            tips: {
                title: `Tips`,
                description: `Gives tips here and there about bot.`,
            },
            passive: {
                title: `Passive`,
                description: `Enabling this means isolating yourself from other users, they cannot interaction with you in anyway.`,
            },
            votereminders: {
                title: `Vote Reminders`,
                description: `Reminder to vote for the bot.`,
            },
            levelupnotifications: {
                title: `Level Up Notifications`,
                description: `Send a message or dm notification (if enabled) when you level up.`,
            },
            compactmode: {
                title: `Compact Mode`,
                description: `Campact everything.`,
            },
        };
        const settings_keys = Object.keys(settings);
        const settings_embed = new MessageEmbed()
            .setTitle(`User Settings`)
            .setDescription(
                `**${settings[settings_keys[0]].title}**\n${
                    settings[settings_keys[0]].description
                }`
            )
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: `${interaction.user.displayAvatarURL()}`,
            });
        let settings_options = settings_keys.map((key, index) => {
            const option_data = {
                label: settings[key].title,
                description: settings[key].description,
                value: key,
            };
            if (index === 0) {
                option_data.default = true;
            }
            return option_data;
        });
        let components = [];
        let row = new MessageActionRow();
        let row0 = new MessageActionRow();
        let row1 = new MessageActionRow();
        let enablebutton = new MessageButton()
            .setCustomId("enablebutton")
            .setLabel(`Enable`)
            .setStyle("SUCCESS")
            .setDisabled(
                settingsData.settings[settings_keys[0]].status === true
                    ? true
                    : false
            );
        let disablebutton = new MessageButton()
            .setCustomId("disablebutton")
            .setLabel(`Disable`)
            .setStyle("DANGER")
            .setDisabled(
                settingsData.settings[settings_keys[0]].status === true
                    ? false
                    : true
            );
        let settingsmenu = new MessageSelectMenu()
            .setCustomId(`settingsmenu`)
            .setOptions(settings_options);
        row.setComponents(settingsmenu);
        row0.setComponents(enablebutton, disablebutton);
        row1.setComponents(
            new MessageButton()
                .setCustomId("endinteraction")
                .setLabel("End Interaction")
                .setStyle("SECONDARY")
        );
        components = [row, row0, row1];

        interaction.reply({
            embeds: [settings_embed],
            components: components,
        });

        const settings_msg = await interaction.fetchReply();
        const collector = settings_msg.createMessageComponentCollector({
            idle: 20 * 1000,
        });

        let currentsetting = settings_keys[0];
        setProcessingLock(interaction.user.id, true);
        collector.on("collect", async (button) => {
            if (button.user.id != interaction.user.id) {
                return button.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            button.deferUpdate();
            if (button.customId === "settingsmenu") {
                currentsetting = button.values[0];
                settings_embed.setDescription(
                    `**${settings[currentsetting].title}**\n${settings[currentsetting].description}`
                );

                settings_options = settings_keys.map((key) => {
                    const option_data = {
                        label: settings[key].title,
                        description: settings[key].description,
                        value: key,
                    };
                    if (key === currentsetting) {
                        option_data.default = true;
                    }
                    return option_data;
                });
                settingsmenu.setOptions(settings_options);
                enablebutton.setDisabled(
                    settingsData.settings[currentsetting].status === true
                        ? true
                        : false
                );
                disablebutton.setDisabled(
                    settingsData.settings[currentsetting].status === true
                        ? false
                        : true
                );
                row.setComponents(settingsmenu);
                row0.setComponents(enablebutton, disablebutton);
                components = [row, row0, row1];
                settings_msg.edit({
                    embeds: [settings_embed],
                    components: components,
                });
            } else if (button.customId === "endinteraction") {
                settings_msg.components.forEach((row) => {
                    row.components.forEach((c) => {
                        c.setDisabled();
                    });
                });
                settings_msg.edit({
                    components: settings_msg.components,
                });
                setProcessingLock(interaction.user.id, false);
            } else {
                let newstatus;
                if (button.customId === "disablebutton") {
                    newstatus = false;
                } else if (button.customId === "enablebutton") {
                    newstatus = true;
                }

                await editusersettings(
                    interaction.user.id,
                    currentsetting,
                    newstatus
                );
                fetch_settingsData = await fetchSettingsData(
                    interaction.user.id
                );
                settingsData = fetch_settingsData.data;
                enablebutton.setDisabled(
                    settingsData.settings[currentsetting].status === true
                        ? true
                        : false
                );
                disablebutton.setDisabled(
                    settingsData.settings[currentsetting].status === true
                        ? false
                        : true
                );
                row.setComponents(settingsmenu);
                row0.setComponents(enablebutton, disablebutton);
                components = [row, row0, row1];
                settings_msg.edit({
                    embeds: [settings_embed],
                    components: components,
                });
            }
        });

        collector.on("end", (collected) => {
            settings_msg.components.forEach((row) => {
                row.components.forEach((c) => {
                    c.setDisabled();
                });
            });
            settings_msg.edit({
                components: settings_msg.components,
            });
            setProcessingLock(interaction.user.id, false);
        });
        setCooldown(
            interaction,
            "usersettings",
            15,
            (await fetchEconomyData(interaction.user.id)).data
        );
    },
};
