const { Collection, EmbedBuilder, InteractionType } = require("discord.js");

const { errorReply } = require("../utils/errorfunctions");
const { backgroundupdates_handler } = require("../utils/currencyevents");
const {
    checkProcessingLock,
    checkCooldown,
    checkAlert,
} = require("../utils/mainfunctions");
const { fetchEmbedColor } = require("../utils/cosmeticsfunctions");
const { fetchSettingsData } = require("../utils/currencyfunctions");
const GuildModel = require("../models/guildSchema");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (interaction.type === InteractionType.ApplicationCommand) {
            const commandname = interaction.commandName;
            const command = client.commands.get(commandname);

            if (!command) return;
            let error_message;
            const user = interaction.user;
            let guildData;
            try {
                guildData = await GuildModel.findOne({
                    guildId: interaction.guild.id,
                });
                if (!guildData) {
                    let guild = await GuildModel.create({
                        guildId: interaction.guild.id,
                    });

                    guild.save();

                    guildData = guild;
                }
            } catch (error) {
                console.log(error);
            }

            const ProcessingLock_status = await checkProcessingLock(
                interaction.user.id
            );
            if (ProcessingLock_status === true) {
                error_message = `You have an ongoing command.`;
                return errorReply(interaction, error_message);
            }
            // if (
            //     profileData.moderation.blacklist.status === true ||
            //     profileData.moderation.ban.status === true
            // ) {
            //     errorembed.setDescription(
            //         `You are a blacklisted user, you cannot use commands untill you are unblacklisted.\nIf you believe this is a mistake please go here: [https://discord.gg/B5vjnwakdk](https://discord.gg/B5vjnwakdk)`
            //     );

            //     return interaction.reply({ embeds: [errorembed], ephemeral: true });
            // }

            if (guildData.disabledcmds[commandname] === true) {
                error_message = `<a:cross:987458395823018044> **This command has been disabled in** \`${interaction.guild.name}\`\nGuild ID: \`${interaction.guild.id}\`\nCommand: \`${commandname}\``;
                return errorReply(interaction, error_message);
            }

            await backgroundupdates_handler(interaction, commandname);

            async function executecmd() {
                try {
                    const oncooldown = await checkCooldown(
                        interaction,
                        interaction.user.id,
                        command,
                        commandname
                    );

                    if (oncooldown === true) return;

                    const theme = {
                        embed: {
                            color: await fetchEmbedColor(interaction),
                        },
                    };

                    await command.execute(interaction, client, theme);
                    setTimeout(async function () {
                        if (
                            interaction.replied === true &&
                            commandname !== "alert"
                        ) {
                            await checkAlert(interaction);
                        }
                    }, 1000);
                } catch (error) {
                    console.error(error);
                    error_message =
                        "There was an error while executing this command!";
                    return errorReply(interaction, error_message);
                }
            }

            executecmd();
        }
    },
};
