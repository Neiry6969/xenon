const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addItem,
    addexperiencepoints,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const {
    setCooldown,
    setProcessingLock,
    checkFightingLock,
    checkProcessingLock,
} = require("../../utils/mainfunctions");
const letternumbers = require("../../reference/letternumber");
const { bardisplay } = require("../../utils/utilsfunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fight")
        .setDescription("Fight with users.")
        .addUserOption((oi) => {
            return oi
                .setName("user")
                .setDescription("A user within the server")
                .setRequired(true);
        })
        .addStringOption((oi) => {
            return oi
                .setName("quantity")
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                );
        })
        .addStringOption((oi) => {
            return oi
                .setName("item")
                .setDescription("Valid item that exists in the bot.");
        }),
    cdmsg: "You need to take it slow and wait before fighting again.",
    cooldown: 5,
    async execute(interaction, client, theme) {
        let confirmed = false;
        let endinteraction = false;
        let error_message;

        const options = {
            user: interaction.options.getMember("user"),
            item: interaction.options.getString("item"),
            quantity: interaction.options.getString("quantity"),
        };

        if (!options.user) {
            error_message = `That user isn't in this server.`;
            return errorReply(interaction, error_message);
        } else if (options.user.user.bot == true) {
            error_message = `You can't be fighting with bots, they just don't accept the confirmations.`;
            return errorReply(interaction, error_message);
        }

        let quantity = options.quantity?.toLowerCase();
        let itemData;

        if (options.item) {
            itemData = await fetchItemData(options.item);
            if (!itemData) {
                error_message = `\`That is not an existing item\``;
                return errorReply(interaction, error_message);
            }
        }

        if (options.user.id === interaction.user.id) {
            error_message = `You can't fight with yourself do it mentally, but I don't encourage you to.`;
            return errorReply(interaction, error_message);
        }

        if ((await checkFightingLock(options.user.id)) === true) {
            error_message = `${options.user} is already in a fight, you'll have to wait till they are done.`;
            return errorReply(interaction, error_message);
        }

        if ((await checkProcessingLock(options.user.id)) === true) {
            error_message = `${options.user} is doing something with their coins right now.`;
            return errorReply(interaction, error_message);
        }

        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        const t_inventory_fetch = await fetchInventoryData(
            options.user.user.id
        );
        const t_economyData_fetch = await fetchEconomyData(
            options.user.user.id
        );
        const t_inventoryData = t_inventory_fetch.data;
        const t_economyData = t_economyData_fetch.data;

        if (quantity === "max" || quantity === "all") {
            if (itemData && quantity) {
                if (
                    !inventoryData.inventory[itemData.item] ||
                    inventoryData.inventory[itemData.item] <= 0
                ) {
                    error_message = `You don't own any of that item to fight.\n\n**Item:** ${itemData.icon} \`${itemData.item}\``;
                    return errorReply(interaction, error_message);
                } else {
                    quantity = Math.floor(
                        inventoryData.inventory[itemData.item]
                    );
                }
            } else if (quantity) {
                if (economyData.wallet <= 0) {
                    error_message = `You have no coins to bet`;
                    return errorReply(interaction, error_message);
                } else {
                    quantity = Math.floor(economyData.wallet);
                }
            }
        } else if (!quantity) {
            quantity = 0;
        } else if (
            letternumbers.find((val) => val.letter === quantity.slice(-1))
        ) {
            if (parseInt(quantity.slice(0, -1))) {
                const number = parseFloat(quantity.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === quantity.slice(-1)
                ).number;
                quantity = number * numbermulti;
            } else {
                quantity = null;
            }
        } else {
            quantity = parseInt(quantity);
        }

        quantity = parseInt(quantity);

        if (options.item) {
            if (!quantity) {
                error_message = `Specify how much of that item you want to be in the \`quantity\` option.`;
                return errorReply(interaction, error_message);
            } else if (quantity < 0) {
                error_message = `You can only fight a whole number of items.`;
                return errorReply(interaction, error_message);
            } else if (quantity === 0) {
                error_message = `So you want to fight nothing, why bother?`;
                return errorReply(interaction, error_message);
            } else if (!inventoryData.inventory[itemData.item]) {
                error_message = `You don't own any of that item to fight.\n\n**Item:** ${itemData.icon} \`${itemData.item}\``;
                return errorReply(interaction, error_message);
            } else if (inventoryData.inventory[itemData.item] < quantity) {
                error_message = `You don't have that many of that item to fight.\n\n**Item:** ${
                    itemData.icon
                } \`${itemData.item}\`\n**Units Owned:** \`${(
                    inventoryData.inventory[itemData.item] || 0
                ).toLocaleString()}\``;
                return errorReply(interaction, error_message);
            } else if (
                !t_inventoryData.inventory[itemData.item] ||
                t_inventoryData.inventory[itemData.item] < quantity
            ) {
                error_message = `${options.user} doesn't have that many of that item to fight.\n\n**Item:** ${itemData.icon} \`${itemData.item}\``;
                return errorReply(interaction, error_message);
            }
        } else if (quantity && !options.item) {
            if (!quantity || quantity < 0) {
                error_message = `You can only fight a whole number of coins`;
                return errorReply(interaction, error_message);
            } else if (quantity === 0) {
                error_message = `So you want to fight nothing, why bother?`;
                return errorReply(interaction, error_message);
            } else if (economyData.wallet < quantity) {
                error_message = `You don't have that many coins in your wallet to fight.\n\nWallet: \`❀ ${economyData.wallet.toLocaleString()}\``;
                return errorReply(interaction, error_message);
            } else if (t_economyData.wallet < quantity) {
                error_message = `${options.user} doesn't have that many coins to fight.`;
                return errorReply(interaction, error_message);
            }
        }
        let singleprize_display;
        let doubleprize_display;

        if (quantity === 0) {
            singleprize_display = `\`nothing\``;
            doubleprize_display = `\`nothing\``;
        } else if (quantity && !options.item) {
            singleprize_display = `\`❀ ${quantity.toLocaleString()}\``;
            doubleprize_display = `\`❀ ${(quantity * 2).toLocaleString()}\``;
        } else if (quantity && itemData) {
            singleprize_display = `${itemData.icon} \`${
                itemData.item
            }\` \`x ${quantity.toLocaleString()}\``;
            doubleprize_display = `${itemData.icon} \`${itemData.item}\` \`x ${(
                quantity * 2
            ).toLocaleString()}\``;
        }

        let confirm = new MessageButton()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle("PRIMARY");

        let cancel = new MessageButton()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("DANGER");

        let row = new MessageActionRow().addComponents(confirm, cancel);

        const confirmfight_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Action Confirmation - Fight`)
            .setDescription(
                `${interaction.user} are you sure you want to fight ${singleprize_display} with ${options.user}?`
            );

        await interaction.reply({
            embeds: [confirmfight_embed],
            components: [row],
        });

        const confirmfight_msg = await interaction.fetchReply();

        const collector = confirmfight_msg.createMessageComponentCollector({
            time: 20 * 1000,
        });

        async function fight() {
            const local_stats = {
                health: 100,
                shield: 0,
                buff: 0,
            };
            const target_stats = {
                health: 100,
                shield: 0,
                buff: 0,
            };
            let turn;
            if (Math.floor(Math.random() * 2) === 1) {
                turn = options.user.user;
            } else {
                turn = interaction.user;
            }

            const fight_embed = new MessageEmbed()
                .setColor(theme.embed.color)
                .setAuthor({
                    name: `${turn.tag}`,
                    iconURL: turn.displayAvatarURL(),
                })
                .setTitle(`Fight`)
                .setThumbnail(
                    "https://media.discordapp.net/attachments/964716079425417269/1013874952136564767/scientist-street-fighter-game-pixel-art-animation-by-diego-sanches-1.gif?width=311&height=389"
                )
                .setDescription(
                    `${interaction.user} **VS** ${options.user}\n**Prize:** ${doubleprize_display}`
                )
                .setFields(
                    {
                        name: `${interaction.user.username}`,
                        value: `<:lifesaver:978754575098085426> ${bardisplay(
                            Math.floor((local_stats.health / 100) * 100)
                        )} **${
                            local_stats.health
                        }%**\n<:shield:1013876234138177586> ${bardisplay(
                            Math.floor((local_stats.shield / 100) * 100)
                        )} **${
                            local_stats.shield
                        }%**\n<:sword:1013883185337221151> ${bardisplay(
                            Math.floor((local_stats.buff / 100) * 100)
                        )} **${local_stats.buff}%**`,
                        inline: true,
                    },
                    {
                        name: `${options.user.user.username}`,
                        value: `<:lifesaver:978754575098085426> ${bardisplay(
                            Math.floor((target_stats.health / 100) * 100)
                        )} **${
                            local_stats.health
                        }%**\n<:shield:1013876234138177586> ${bardisplay(
                            Math.floor((target_stats.shield / 100) * 100)
                        )} **${
                            target_stats.shield
                        }%**\n<:sword:1013883185337221151> ${bardisplay(
                            Math.floor((target_stats.buff / 100) * 100)
                        )} **${target_stats.buff}%**`,
                        inline: true,
                    },
                    {
                        name: `Last Action`,
                        value: `\`A fight has been started!\``,
                        inline: false,
                    }
                );

            const fight_msg = await interaction.followUp({
                content: `**Turn:** ${turn}`,
                embeds: [fight_embed],
            });
        }

        async function target_confirmation() {
            const confirmfight_embed_target = new MessageEmbed()
                .setTitle(`Action Confirmation - Fight`)
                .setColor(theme.embed.color)
                .setAuthor({
                    name: `${options.user.user.tag}`,
                    iconURL: options.user.user.displayAvatarURL(),
                })
                .setDescription(
                    `${interaction.user} want to fight ${singleprize_display} with you.\n**If you except, you will fight with ${singleprize_display}. If you lose the fight, you will also lose ${singleprize_display}.**`
                );
            confirm.setDisabled(false).setStyle("PRIMARY");
            cancel.setDisabled(false).setStyle("DANGER");
            const confirmfight_msg_target = await interaction.followUp({
                content: `${options.user}`,
                embeds: [confirmfight_embed_target],
                components: [row],
            });

            const collector_target =
                confirmfight_msg_target.createMessageComponentCollector({
                    time: 20 * 1000,
                });

            setProcessingLock(options.user.user.id, true);
            collector_target.on("collect", async (button) => {
                if (button.user.id != options.user.user.id) {
                    return button.reply({
                        content: "This is not for you.",
                        ephemeral: true,
                    });
                }

                button.deferUpdate();

                if (button.customId === "confirm") {
                    endinteraction = true;
                    confirmfight_embed_target
                        .setColor(`#95ff87`)
                        .setTitle(`Action Confirmed - Fight`);

                    confirm.setDisabled().setStyle("SUCCESS");
                    cancel.setDisabled().setStyle("SECONDARY");

                    confirmfight_msg_target.edit({
                        embeds: [confirmfight_embed_target],
                        components: [row],
                    });
                    fight();
                } else if (button.customId === "cancel") {
                    endinteraction = true;
                    setProcessingLock(options.user.user.id, false);
                    setProcessingLock(interaction.user.id, false);

                    confirmfight_embed_target
                        .setTitle(`Action Cancellend - Fight`)
                        .setColor(`#ff8f87`);

                    confirm.setDisabled().setStyle("SECONDARY");
                    cancel.setDisabled();

                    confirmfight_msg_target.edit({
                        embeds: [confirmfight_embed_target],
                        components: [row],
                    });
                }
            });

            collector_target.on("end", async (collected) => {
                if (endinteraction === true) {
                } else {
                    setProcessingLock(options.user.user.id, false);
                    setProcessingLock(interaction.user.id, false);

                    confirmfight_embed_target
                        .setTitle(`Action Timed Out - Fight`)
                        .setColor(`#ff8f87`);

                    confirm.setDisabled().setStyle("SECONDARY");
                    cancel.setDisabled().setStyle("SECONDARY");

                    confirmfight_msg_target.edit({
                        embeds: [confirmfight_embed_target],
                        components: [row],
                    });
                }
            });
        }

        setProcessingLock(interaction.user.id, true);
        collector.on("collect", async (button) => {
            if (button.user.id != interaction.user.id) {
                return button.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            button.deferUpdate();

            if (button.customId === "confirm") {
                confirmfight_embed
                    .setColor(`#95ff87`)
                    .setTitle(`Action Confirmed - Fight`);

                confirm.setDisabled().setStyle("SUCCESS");
                cancel.setDisabled().setStyle("SECONDARY");

                confirmfight_msg.edit({
                    embeds: [confirmfight_embed],
                    components: [row],
                });

                target_confirmation();
            } else if (button.customId === "cancel") {
                endinteraction = true;
                setProcessingLock(interaction.user.id, false);

                confirmfight_embed
                    .setTitle(`Action Cancellend - Fight`)
                    .setColor(`#ff8f87`);

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled();

                confirmfight_msg.edit({
                    embeds: [confirmfight_embed],
                    components: [row],
                });
            }
        });

        collector.on("end", async (collected) => {
            if (endinteraction === true) {
            } else {
                setProcessingLock(interaction.user.id, false);

                confirmfight_embed
                    .setTitle(`Action Timed Out - Fight`)
                    .setColor(`#ff8f87`);

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled().setStyle("SECONDARY");

                confirmfight_msg.edit({
                    embeds: [confirmfight_embed],
                    components: [row],
                });
            }
        });

        return setCooldown(interaction, "fight", 5, economyData);
    },
};
