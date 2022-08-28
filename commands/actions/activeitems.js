const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchUserData,
    fetchEconomyData,
} = require("../../utils/currencyfunctions");
const {
    fetchAllitemsData,
    fetchItemData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");
const { ri_watermelon } = require("../../utils/itemremove");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("activeitems")
        .setDescription("Commands relating to interacting with active items.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("show")
                .setDescription("Show which items you have active.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Remove an active item.")
                .addStringOption((oi) => {
                    return oi
                        .setName("item")
                        .setDescription(
                            "Valid active item, you can see active items using the /activeitems show command."
                        );
                })
        ),
    cdmsg: "Wait before you remove another active item",
    cooldown: 5,
    async execute(interaction, client, theme) {
        let error_message;
        const allItems = await fetchAllitemsData();
        const userData_fetch = await fetchUserData(interaction.user.id);
        const userData = userData_fetch.data;

        if (interaction.options.getSubcommand() === "show") {
            let activeitems_map;
            if (Object.keys(userData.activeitems).length === 0) {
                activeitems_map = `\`currently no active items\``;
            } else {
                activeitems_map = Object.keys(userData.activeitems).map(
                    (key) => {
                        const item = allItems.find(({ item }) => item === key);
                        return `${item.icon} \`${
                            item.item
                        }\` expires: <t:${Math.floor(
                            userData.activeitems[key].expirydate / 1000
                        )}:R>`;
                    }
                );
            }
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(theme.embed.color)
                        .setAuthor({
                            name: `${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setTitle(`Active items`)
                        .setDescription(`${activeitems_map}`),
                ],
            });
        } else if (interaction.options.getSubcommand() === "remove") {
            const options = {
                item: interaction.options.getString("item"),
            };

            const itemData = await fetchItemData(options.item);
            if (!itemData) {
                error_message = `\`That is not an existing item\``;
                return errorReply(interaction, error_message);
            }

            if (!Object.keys(userData.activeitems).includes(itemData.item)) {
                error_message = `You don't currently have that item active.\n\nItem: ${itemData.icon} \`${itemData.item}\``;
                return errorReply(interaction, error_message);
            }

            if (itemData.item === "watermelon") {
                await ri_watermelon(interaction.user.id);
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Action Executed - Active Item Remove`)
                            .setAuthor({
                                name: `${interaction.user.tag}`,
                                iconURL: interaction.user.displayAvatarURL(),
                            })
                            .setColor(`#95ff87`)
                            .setDescription(
                                `Item: ${itemData.icon} \`${itemData.item}\``
                            ),
                    ],
                });
            }
        }

        setCooldown(
            interaction,
            "activeitems",
            5,
            (await fetchEconomyData(interaction.user.id)).data
        );
    },
};
