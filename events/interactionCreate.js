const { Collection, MessageEmbed, Permissions } = require("discord.js");

const { errorReply } = require("../utils/errorfunctions");
const {
    backgroundupdates_handler,
    tips_handler,
} = require("../utils/currencyevents");
const {
    checkProcessingLock,
    checkCooldown,
    checkAlert,
} = require("../utils/mainfunctions");
const { fetchEmbedColor } = require("../utils/cosmeticsfunctions");
const {
    fetchSettingsData,
    fetchUserData,
} = require("../utils/currencyfunctions");
const GuildModel = require("../models/guildSchema");
const { fetchItemData, fetchAllitemsData } = require("../utils/itemfunctions");
const { fetchActiveItems } = require("../utils/userfunctions");
const { mg_fastestclick } = require("../utils/minigamefunctions");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        let error_message;
        const permissions_required = [
            "ADD_REACTIONS",
            "ATTACH_FILES",
            "SEND_MESSAGES",
            "SEND_MESSAGES_IN_THREADS",
            "EMBED_LINKS",
            "VIEW_CHANNEL",
            "READ_MESSAGE_HISTORY",
        ];
        const permissions_stillrequired = [];

        permissions_required.forEach((perm) => {
            if (!interaction.guild.me.permissions.has(perm)) {
                return permissions_stillrequired.push(perm);
            }
        });

        if (permissions_stillrequired.length > 0) {
            error_message = `**I am missing important some  permissions in this server/channel to function properly. Please contact a user/moderator/administrator who has the authority to change permissions to change permissions so you can continue using the bot.**\n\nOutstanding permisssions required:\n${permissions_stillrequired
                .map((permission) => {
                    return `\`${permission}\``;
                })
                .join("\n")}`;
            return errorReply(interaction, error_message);
        }

        const theme = {
            embed: {
                color: await fetchEmbedColor(interaction),
            },
        };

        if (interaction.isCommand()) {
            const commandname = interaction.commandName;
            const command = client.commands.get(commandname);

            if (!command) return;
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

            // if (guildData.disabledcmds[commandname] === true) {
            //     error_message = `<a:cross:987458395823018044> **This command has been disabled in** \`${interaction.guild.name}\`\nGuild ID: \`${interaction.guild.id}\`\nCommand: \`${commandname}\``;
            //     return errorReply(interaction, error_message);
            // }

            await backgroundupdates_handler(interaction, client, commandname);

            async function executecmd() {
                try {
                    const oncooldown = await checkCooldown(
                        interaction,
                        interaction.user.id,
                        command,
                        commandname
                    );

                    if (oncooldown === true) return;

                    await command.execute(interaction, client, theme);
                    setTimeout(async function () {
                        if (
                            interaction.replied === true &&
                            commandname !== "alert"
                        ) {
                            await checkAlert(interaction);
                            await tips_handler(interaction, theme);
                            if (Math.floor(Math.random() * 10000) < 500) {
                                await mg_fastestclick(
                                    interaction,
                                    "Not ordinary paper, huh? It is old paper, ancient paper?",
                                    "Ew what is this? Coffee paper? Who wants it cause I definitely don't!",
                                    theme.embed.color,
                                    "Mine",
                                    "<a:ancientscroll:1014746011194904587>",
                                    25,
                                    "ancientscroll"
                                );
                            }
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
        } else if (interaction.isButton()) {
            if (interaction.message.createdTimestamp + 21600000 < Date.now()) {
                error_message = `This button has been created more than 6 hours ago, therefore it is no longer avaliable`;
                return errorReply(interaction, error_message);
            }
        }
    },
};
