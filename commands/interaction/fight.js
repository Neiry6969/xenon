const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addItem,
    addexperiencepoints,
    removeItem,
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
    setFightingLock,
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
            setFightingLock(options.user.user.id, true);
            setFightingLock(interaction.user.id, true);
            const fightgame_status = {
                local: {
                    health: 100,
                    shield: 0,
                    buff: 0,
                },
                target: {
                    health: 100,
                    shield: 0,
                    buff: 0,
                },
            };

            let hasended = false;
            let loser;
            let winner;
            let turn;
            let turnraw;
            let waitingraw;
            let lastdamage;
            if (Math.floor(Math.random() * 2) === 1) {
                turn = options.user.user;
                turnraw = "target";
                waitingraw = "local";
            } else {
                turn = interaction.user;
                turnraw = "local";
                waitingraw = "target";
            }

            const fight_embed = new MessageEmbed()
                .setColor(theme.embed.color)
                .setAuthor({
                    name: `${turn.tag}`,
                    iconURL: turn.displayAvatarURL(),
                })
                .setTitle(`Fight`)
                .setThumbnail(
                    "https://media.discordapp.net/attachments/964716079425417269/1013903850660442262/ezgif.com-gif-maker_27.gif?width=281&height=372"
                )
                .setDescription(
                    `${interaction.user} **VS** ${
                        options.user
                    }\n**Prize:** ${doubleprize_display}\n**Turn Ends:** <t:${Math.floor(
                        (Date.now() + 60 * 1000) / 1000
                    )}:R>`
                )
                .setFields(
                    {
                        name: `${interaction.user.username}`,
                        value: `<:lifesaver:978754575098085426> ${bardisplay(
                            Math.floor(
                                (fightgame_status.local.health / 100) * 100
                            )
                        )} **${
                            fightgame_status.local.health
                        }%**\n<:shield:1013876234138177586> ${bardisplay(
                            Math.floor(
                                (fightgame_status.local.shield / 100) * 100
                            )
                        )} **${
                            fightgame_status.local.shield
                        }%**\n<:sword:1013883185337221151> ${bardisplay(
                            Math.floor(
                                (fightgame_status.local.buff / 100) * 100
                            )
                        )} **${fightgame_status.local.buff}%**`,
                        inline: true,
                    },
                    {
                        name: `${options.user.user.username}`,
                        value: `<:lifesaver:978754575098085426> ${bardisplay(
                            Math.floor(
                                (fightgame_status.target.health / 100) * 100
                            )
                        )} **${
                            fightgame_status.target.health
                        }%**\n<:shield:1013876234138177586> ${bardisplay(
                            Math.floor(
                                (fightgame_status.target.shield / 100) * 100
                            )
                        )} **${
                            fightgame_status.target.shield
                        }%**\n<:sword:1013883185337221151> ${bardisplay(
                            Math.floor(
                                (fightgame_status.target.buff / 100) * 100
                            )
                        )} **${fightgame_status.target.buff}%**`,
                        inline: true,
                    },
                    {
                        name: `Last Action`,
                        value: `\`A fight has been started!\``,
                        inline: false,
                    }
                );

            const fight_components = [];
            const row0 = new MessageActionRow();
            const row1 = new MessageActionRow();

            let shield = new MessageButton()
                .setCustomId("shield")
                .setLabel("Shield")
                .setStyle("SECONDARY")
                .setEmoji("<:shield:1013876234138177586>");

            let buff = new MessageButton()
                .setCustomId("buff")
                .setLabel("Buff")
                .setStyle("SECONDARY")
                .setEmoji("<:sword:1013883185337221151>");

            let heal = new MessageButton()
                .setCustomId("heal")
                .setLabel("Heal")
                .setStyle("SECONDARY")
                .setEmoji("<:medicalkit:1013892434129854544>");

            row0.setComponents(shield, buff, heal);

            let counterattack = new MessageButton()
                .setCustomId("counterattck")
                .setLabel("Counterattack")
                .setStyle("SECONDARY")
                .setDisabled(true);

            let block = new MessageButton()
                .setCustomId("block")
                .setLabel("Block Attack")
                .setStyle("SECONDARY")
                .setDisabled(true);

            let attack = new MessageButton()
                .setCustomId("attack")
                .setLabel("Attack")
                .setStyle("SECONDARY");

            let breakshield = new MessageButton()
                .setCustomId("breakshield")
                .setLabel("Break Shield")
                .setStyle("SECONDARY");

            let flee = new MessageButton()
                .setCustomId("flee")
                .setLabel("Flee")
                .setStyle("DANGER")
                .setEmoji("<a:run:1014250673199648910>");

            row1.setComponents(counterattack, block, attack, breakshield, flee);

            fight_components.push(row0);
            fight_components.push(row1);
            const fight_msg = await interaction.followUp({
                content: `**Turn:** ${turn}`,
                embeds: [fight_embed],
                components: fight_components,
            });

            const fight_collector = fight_msg.createMessageComponentCollector({
                idle: 60 * 1000,
            });

            fight_collector.on("collect", async (button) => {
                if (
                    button.user.id != interaction.user.id &&
                    button.user.id != options.user.user.id
                ) {
                    fight_msg.embeds[0].description = `${
                        interaction.user
                    } **VS** ${
                        options.user
                    }\n**Prize:** ${doubleprize_display}\n**Turn Ends:** <t:${Math.floor(
                        (Date.now() + 60 * 1000) / 1000
                    )}:R>`;

                    fight_msg.edit({
                        embeds: fight_msg.embeds,
                    });
                    return button.reply({
                        content: "This isn't your fight.",
                        ephemeral: true,
                    });
                } else if (button.user.id != turn.id) {
                    fight_msg.embeds[0].description = `${
                        interaction.user
                    } **VS** ${
                        options.user
                    }\n**Prize:** ${doubleprize_display}\n**Turn Ends:** <t:${Math.floor(
                        (Date.now() + 60 * 1000) / 1000
                    )}:R>`;

                    fight_msg.edit({
                        embeds: fight_msg.embeds,
                    });
                    return button.reply({
                        content: "It is not your turn, calm down.",
                        ephemeral: true,
                    });
                }

                button.deferUpdate();
                if (button.customId === "shield") {
                    const turn_current = turn;
                    let shield_added = Math.floor(Math.random() * 30 + 3);

                    if (fightgame_status[turnraw].shield + shield_added > 100) {
                        shield_added = 100 - fightgame_status[turnraw].shield;
                    }

                    fightgame_status[turnraw].shield += shield_added;

                    if (turn.id === interaction.user.id) {
                        turn = options.user.user;
                        turnraw = "target";
                        waitingraw = "local";
                        fight_msg.embeds[0].fields[0] = {
                            name: `${interaction.user.username}`,
                            value: `<:lifesaver:978754575098085426> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.health / 100) * 100
                                )
                            )} **${
                                fightgame_status.local.health
                            }%**\n<:shield:1013876234138177586> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.shield / 100) * 100
                                )
                            )} **${
                                fightgame_status.local.shield
                            }%**\n<:sword:1013883185337221151> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.buff / 100) * 100
                                )
                            )} **${fightgame_status.local.buff}%**`,
                            inline: true,
                        };
                    } else {
                        turn = interaction.user;
                        turnraw = "local";
                        waitingraw = "target";
                        fight_msg.embeds[0].fields[1] = {
                            name: `${options.user.user.username}`,
                            value: `<:lifesaver:978754575098085426> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.health / 100) * 100
                                )
                            )} **${
                                fightgame_status.target.health
                            }%**\n<:shield:1013876234138177586> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.shield / 100) * 100
                                )
                            )} **${
                                fightgame_status.target.shield
                            }%**\n<:sword:1013883185337221151> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.buff / 100) * 100
                                )
                            )} **${fightgame_status.target.buff}%**`,
                            inline: true,
                        };
                    }

                    fight_msg.embeds[0].author = {
                        name: `${turn.tag}`,
                        iconURL: turn.displayAvatarURL(),
                    };

                    fight_msg.embeds[0].description = `${
                        interaction.user
                    } **VS** ${
                        options.user
                    }\n**Prize:** ${doubleprize_display}\n**Turn Ends:** <t:${Math.floor(
                        (Date.now() + 60 * 1000) / 1000
                    )}:R>`;

                    fight_msg.embeds[0].fields[2].value = `\`${turn_current.username} upgraded their shield by ${shield_added}%\``;

                    fight_msg.edit({
                        content: `**Turn:** ${turn}`,
                        embeds: fight_msg.embeds,
                        components: fight_msg.components,
                    });
                } else if (button.customId === "buff") {
                    const turn_current = turn;
                    let buff_added = Math.floor(Math.random() * 30 + 3);

                    if (fightgame_status[turnraw].buff + buff_added > 100) {
                        buff_added = 100 - fightgame_status[turnraw].buff;
                    }

                    fightgame_status[turnraw].buff += buff_added;

                    if (turn.id === interaction.user.id) {
                        turn = options.user.user;
                        turnraw = "target";
                        waitingraw = "local";
                        fight_msg.embeds[0].fields[0] = {
                            name: `${interaction.user.username}`,
                            value: `<:lifesaver:978754575098085426> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.health / 100) * 100
                                )
                            )} **${
                                fightgame_status.local.health
                            }%**\n<:shield:1013876234138177586> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.shield / 100) * 100
                                )
                            )} **${
                                fightgame_status.local.shield
                            }%**\n<:sword:1013883185337221151> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.buff / 100) * 100
                                )
                            )} **${fightgame_status.local.buff}%**`,
                            inline: true,
                        };
                    } else {
                        turn = interaction.user;
                        turnraw = "local";
                        waitingraw = "target";
                        fight_msg.embeds[0].fields[1] = {
                            name: `${options.user.user.username}`,
                            value: `<:lifesaver:978754575098085426> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.health / 100) * 100
                                )
                            )} **${
                                fightgame_status.target.health
                            }%**\n<:shield:1013876234138177586> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.shield / 100) * 100
                                )
                            )} **${
                                fightgame_status.target.shield
                            }%**\n<:sword:1013883185337221151> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.buff / 100) * 100
                                )
                            )} **${fightgame_status.target.buff}%**`,
                            inline: true,
                        };
                    }

                    fight_msg.embeds[0].author = {
                        name: `${turn.tag}`,
                        iconURL: turn.displayAvatarURL(),
                    };

                    fight_msg.embeds[0].description = `${
                        interaction.user
                    } **VS** ${
                        options.user
                    }\n**Prize:** ${doubleprize_display}\n**Turn Ends:** <t:${Math.floor(
                        (Date.now() + 60 * 1000) / 1000
                    )}:R>`;

                    fight_msg.embeds[0].fields[2].value = `\`${turn_current.username} buffed their attack by ${buff_added}%\``;

                    fight_msg.edit({
                        content: `**Turn:** ${turn}`,
                        embeds: fight_msg.embeds,
                        components: fight_msg.components,
                    });
                } else if (button.customId === "attack") {
                    const turn_current = turn;
                    const attack_min = Math.floor(
                        15 * (fightgame_status[turnraw].buff / 100)
                    );
                    const attack_max =
                        Math.floor(
                            35 * (fightgame_status[turnraw].buff / 100)
                        ) + 10;
                    const attack_amount =
                        Math.floor(Math.random() * attack_max) + attack_min;
                    let attack_final = Math.floor(
                        attack_amount -
                            25 * (fightgame_status[waitingraw].shield / 100)
                    );

                    if (attack_final < 0) {
                        if (
                            fightgame_status[turnraw].health -
                                Math.abs(attack_final) <=
                            0
                        ) {
                            attack_final = -fightgame_status[turnraw].health;

                            if (turn.id === interaction.user.id) {
                                winner = options.user.user;
                                loser = interaction.user;
                            } else {
                                winner = interaction.user;
                                loser = options.user.user;
                            }
                        }
                        fightgame_status[turnraw].health -=
                            Math.abs(attack_final);
                    } else {
                        if (
                            fightgame_status[waitingraw].health -
                                attack_final <=
                            0
                        ) {
                            attack_final = fightgame_status[waitingraw].health;

                            if (turn.id === interaction.user.id) {
                                winner = interaction.user;
                                loser = options.user.user;
                            } else {
                                winner = options.user.user;
                                loser = interaction.user;
                            }
                        }

                        fightgame_status[waitingraw].health -= attack_final;
                    }

                    if (turn.id === interaction.user.id) {
                        turn = options.user.user;
                        turnraw = "target";
                        waitingraw = "local";

                        if (attack_final < 0) {
                            fight_msg.embeds[0].fields[0] = {
                                name: `${interaction.user.username}`,
                                value: `<:lifesaver:978754575098085426> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.local.health / 100) *
                                            100
                                    )
                                )} **${
                                    fightgame_status.local.health
                                }%**\n<:shield:1013876234138177586> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.local.shield / 100) *
                                            100
                                    )
                                )} **${
                                    fightgame_status.local.shield
                                }%**\n<:sword:1013883185337221151> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.local.buff / 100) *
                                            100
                                    )
                                )} **${fightgame_status.local.buff}%**`,
                                inline: true,
                            };
                        } else {
                            fight_msg.embeds[0].fields[1] = {
                                name: `${options.user.user.username}`,
                                value: `<:lifesaver:978754575098085426> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.target.health / 100) *
                                            100
                                    )
                                )} **${
                                    fightgame_status.target.health
                                }%**\n<:shield:1013876234138177586> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.target.shield / 100) *
                                            100
                                    )
                                )} **${
                                    fightgame_status.target.shield
                                }%**\n<:sword:1013883185337221151> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.target.buff / 100) *
                                            100
                                    )
                                )} **${fightgame_status.target.buff}%**`,
                                inline: true,
                            };
                        }
                    } else {
                        turn = interaction.user;
                        turnraw = "local";
                        waitingraw = "target";
                        if (attack_final < 0) {
                            fight_msg.embeds[0].fields[1] = {
                                name: `${options.user.user.username}`,
                                value: `<:lifesaver:978754575098085426> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.target.health / 100) *
                                            100
                                    )
                                )} **${
                                    fightgame_status.target.health
                                }%**\n<:shield:1013876234138177586> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.target.shield / 100) *
                                            100
                                    )
                                )} **${
                                    fightgame_status.target.shield
                                }%**\n<:sword:1013883185337221151> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.target.buff / 100) *
                                            100
                                    )
                                )} **${fightgame_status.target.buff}%**`,
                                inline: true,
                            };
                        } else {
                            fight_msg.embeds[0].fields[0] = {
                                name: `${interaction.user.username}`,
                                value: `<:lifesaver:978754575098085426> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.local.health / 100) *
                                            100
                                    )
                                )} **${
                                    fightgame_status.local.health
                                }%**\n<:shield:1013876234138177586> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.local.shield / 100) *
                                            100
                                    )
                                )} **${
                                    fightgame_status.local.shield
                                }%**\n<:sword:1013883185337221151> ${bardisplay(
                                    Math.floor(
                                        (fightgame_status.local.buff / 100) *
                                            100
                                    )
                                )} **${fightgame_status.local.buff}%**`,
                                inline: true,
                            };
                        }
                    }

                    fight_msg.embeds[0].author = {
                        name: `${turn.tag}`,
                        iconURL: turn.displayAvatarURL(),
                    };

                    fight_msg.embeds[0].description = `${
                        interaction.user
                    } **VS** ${
                        options.user
                    }\n**Prize:** ${doubleprize_display}\n**Turn Ends:** <t:${Math.floor(
                        (Date.now() + 60 * 1000) / 1000
                    )}:R>`;

                    fight_msg.embeds[0].fields[2].value = `${
                        attack_final < 0
                            ? `\`${
                                  turn_current.username
                              } tried to attack, but took ${Math.abs(
                                  attack_final
                              )}% damage\``
                            : `\`${turn_current.username} gave an attack of ${attack_final}%\``
                    }`;

                    if (winner) {
                        hasended = true;
                        fight_msg.embeds[0].author = {
                            name: `${winner.tag}`,
                            iconURL: winner.displayAvatarURL(),
                        };
                        fight_msg.embeds[0].thumbnail.url = `https://media.discordapp.net/attachments/964716079425417269/1013913421529485453/db1tdaj-c8dcfaf2-3068-4ec1-bb66-53f75586f29e.gif?width=390&height=390`;
                        fight_msg.embeds[0].fields[2].value = `\`${winner.username} won the fight like a king!\``;
                        fight_msg.embeds[0].description = `**Winner: ${winner}**\n\n${interaction.user} **VS** ${options.user}\n**Prize:** ${doubleprize_display}`;

                        fight_msg.components[0].components.forEach((c) => {
                            c.setDisabled();
                        });
                        fight_msg.components[1].components.forEach((c) => {
                            c.setDisabled();
                        });

                        fight_msg.edit({
                            content: `${winner} is victorious!`,
                            embeds: fight_msg.embeds,
                            components: fight_msg.components,
                        });

                        if (quantity && itemData) {
                            await removeItem(loser.id, itemData.item, quantity);
                            await addItem(winner.id, itemData.item, quantity);
                        } else if (quantity) {
                            await removeCoins(loser.id, quantity);
                            await addCoins(winner.id, quantity);
                        }
                        setFightingLock(options.user.user.id, false);
                        setFightingLock(interaction.user.id, false);
                        setProcessingLock(options.user.user.id, false);
                        setProcessingLock(interaction.user.id, false);
                    } else {
                        fight_msg.edit({
                            content: `**Turn:** ${turn}`,
                            embeds: fight_msg.embeds,
                            components: fight_msg.components,
                        });
                    }
                } else if (button.customId === "breakshield") {
                    const turn_current = turn;
                    let shield_broken = Math.floor(Math.random() * 25) + 5;

                    if (
                        fightgame_status[waitingraw].shield - shield_broken <
                        0
                    ) {
                        shield_broken = fightgame_status[waitingraw].shield;
                    }

                    fightgame_status[waitingraw].shield -= shield_broken;

                    if (turn.id === interaction.user.id) {
                        turn = options.user.user;
                        turnraw = "target";
                        waitingraw = "local";
                        fight_msg.embeds[0].fields[1] = {
                            name: `${options.user.user.username}`,
                            value: `<:lifesaver:978754575098085426> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.health / 100) * 100
                                )
                            )} **${
                                fightgame_status.target.health
                            }%**\n<:shield:1013876234138177586> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.shield / 100) * 100
                                )
                            )} **${
                                fightgame_status.target.shield
                            }%**\n<:sword:1013883185337221151> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.buff / 100) * 100
                                )
                            )} **${fightgame_status.target.buff}%**`,
                            inline: true,
                        };
                    } else {
                        turn = interaction.user;
                        turnraw = "local";
                        waitingraw = "target";
                        fight_msg.embeds[0].fields[0] = {
                            name: `${interaction.user.username}`,
                            value: `<:lifesaver:978754575098085426> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.health / 100) * 100
                                )
                            )} **${
                                fightgame_status.local.health
                            }%**\n<:shield:1013876234138177586> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.shield / 100) * 100
                                )
                            )} **${
                                fightgame_status.local.shield
                            }%**\n<:sword:1013883185337221151> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.buff / 100) * 100
                                )
                            )} **${fightgame_status.local.buff}%**`,
                            inline: true,
                        };
                    }

                    fight_msg.embeds[0].author = {
                        name: `${turn.tag}`,
                        iconURL: turn.displayAvatarURL(),
                    };

                    fight_msg.embeds[0].description = `${
                        interaction.user
                    } **VS** ${
                        options.user
                    }\n**Prize:** ${doubleprize_display}\n**Turn Ends:** <t:${Math.floor(
                        (Date.now() + 60 * 1000) / 1000
                    )}:R>`;

                    fight_msg.embeds[0].fields[2].value = `\`${turn_current.username} attacked ${turn.username}'s shield and damaged it by ${shield_broken}%\``;

                    fight_msg.edit({
                        content: `**Turn:** ${turn}`,
                        embeds: fight_msg.embeds,
                        components: fight_msg.components,
                    });
                } else if (button.customId === "flee") {
                    if (turn.id === interaction.user.id) {
                        winner = options.user.user;
                        loser = interaction.user;
                    } else {
                        winner = interaction.user;
                        loser = options.user.user;
                    }

                    hasended = true;
                    fight_msg.embeds[0].author = {
                        name: `${winner.tag}`,
                        iconURL: winner.displayAvatarURL(),
                    };
                    fight_msg.embeds[0].thumbnail.url = `https://media.discordapp.net/attachments/964716079425417269/1013913421529485453/db1tdaj-c8dcfaf2-3068-4ec1-bb66-53f75586f29e.gif?width=390&height=390`;
                    fight_msg.embeds[0].fields[2].value = `\`${loser.username} fled the scene so ${winner.username} won the fight like a king!\``;
                    fight_msg.embeds[0].description = `**Winner: ${winner}**\n\n${interaction.user} **VS** ${options.user}\n**Prize:** ${doubleprize_display}`;

                    fight_msg.components[0].components.forEach((c) => {
                        c.setDisabled();
                    });
                    fight_msg.components[1].components.forEach((c) => {
                        c.setDisabled();
                    });

                    fight_msg.edit({
                        content: `${winner} is victorious!`,
                        embeds: fight_msg.embeds,
                        components: fight_msg.components,
                    });

                    if (quantity && itemData) {
                        await removeItem(loser.id, itemData.item, quantity);
                        await addItem(winner.id, itemData.item, quantity);
                    } else if (quantity) {
                        await removeCoins(loser.id, quantity);
                        await addCoins(winner.id, quantity);
                    }
                    setFightingLock(options.user.user.id, false);
                    setFightingLock(interaction.user.id, false);
                    setProcessingLock(options.user.user.id, false);
                    setProcessingLock(interaction.user.id, false);
                } else if (button.customId === "heal") {
                    const turn_current = turn;
                    let health_added = Math.floor(Math.random() * 8);

                    if (fightgame_status[turnraw].health + health_added > 100) {
                        health_added = 100 - fightgame_status[turnraw].health;
                    }

                    fightgame_status[turnraw].health += health_added;

                    if (turn.id === interaction.user.id) {
                        turn = options.user.user;
                        turnraw = "target";
                        waitingraw = "local";
                        fight_msg.embeds[0].fields[0] = {
                            name: `${interaction.user.username}`,
                            value: `<:lifesaver:978754575098085426> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.health / 100) * 100
                                )
                            )} **${
                                fightgame_status.local.health
                            }%**\n<:shield:1013876234138177586> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.shield / 100) * 100
                                )
                            )} **${
                                fightgame_status.local.shield
                            }%**\n<:sword:1013883185337221151> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.local.buff / 100) * 100
                                )
                            )} **${fightgame_status.local.buff}%**`,
                            inline: true,
                        };
                    } else {
                        turn = interaction.user;
                        turnraw = "local";
                        waitingraw = "target";
                        fight_msg.embeds[0].fields[1] = {
                            name: `${options.user.user.username}`,
                            value: `<:lifesaver:978754575098085426> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.health / 100) * 100
                                )
                            )} **${
                                fightgame_status.target.health
                            }%**\n<:shield:1013876234138177586> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.shield / 100) * 100
                                )
                            )} **${
                                fightgame_status.target.shield
                            }%**\n<:sword:1013883185337221151> ${bardisplay(
                                Math.floor(
                                    (fightgame_status.target.buff / 100) * 100
                                )
                            )} **${fightgame_status.target.buff}%**`,
                            inline: true,
                        };
                    }

                    fight_msg.embeds[0].author = {
                        name: `${turn.tag}`,
                        iconURL: turn.displayAvatarURL(),
                    };

                    fight_msg.embeds[0].description = `${
                        interaction.user
                    } **VS** ${
                        options.user
                    }\n**Prize:** ${doubleprize_display}\n**Turn Ends:** <t:${Math.floor(
                        (Date.now() + 60 * 1000) / 1000
                    )}:R>`;

                    fight_msg.embeds[0].fields[2].value = `\`${turn_current.username} took out some magical bandages and healed their health by ${health_added}%\``;

                    fight_msg.edit({
                        content: `**Turn:** ${turn}`,
                        embeds: fight_msg.embeds,
                        components: fight_msg.components,
                    });
                }
            });

            fight_collector.on("end", async (collected) => {
                fight_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                fight_msg.components[1].components.forEach((c) => {
                    c.setDisabled();
                });
                if (
                    fightgame_status.local.health > 0 &&
                    fightgame_status.target.health > 0 &&
                    hasended === false
                ) {
                    if (turn.id === interaction.user.id) {
                        winner = options.user.user;
                        loser = interaction.user;
                    } else {
                        winner = interaction.user;
                        loser = options.user.user;
                    }
                    fight_msg.embeds[0].author = {
                        name: `${winner.tag}`,
                        iconURL: winner.displayAvatarURL(),
                    };
                    fight_msg.embeds[0].thumbnail.url = `https://media.discordapp.net/attachments/964716079425417269/1013913421529485453/db1tdaj-c8dcfaf2-3068-4ec1-bb66-53f75586f29e.gif?width=390&height=390`;
                    fight_msg.embeds[0].fields[2].value = `\`${turn.username} fell unconscious and lost the fight\``;
                    fight_msg.embeds[0].description = `**Winner: ${winner}**\n\n${interaction.user} **VS** ${options.user}\n**Prize:** ${doubleprize_display}`;
                    fight_msg.edit({
                        content: `${winner} is victorious!`,
                        embeds: fight_msg.embeds,
                        components: fight_msg.components,
                    });

                    if (quantity && itemData) {
                        await removeItem(loser.id, itemData.item, quantity);
                        await addItem(winner.id, itemData.item, quantity);
                    } else if (quantity) {
                        await removeCoins(loser.id, quantity);
                        await addCoins(winner.id, quantity);
                    }
                } else {
                    fight_msg.edit({
                        components: fight_msg.components,
                    });
                }

                setFightingLock(options.user.user.id, false);
                setFightingLock(interaction.user.id, false);
                setProcessingLock(options.user.user.id, false);
                setProcessingLock(interaction.user.id, false);
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
                    `${interaction.user} wants to fight ${singleprize_display} with you.\n**If you except, you will fight with ${singleprize_display}.**`
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

                if (button.customId === "confirm") {
                    if (
                        (await checkFightingLock(options.user.user.id)) === true
                    ) {
                        return button.reply({
                            content: "You are already in a fight.",
                            ephemeral: true,
                        });
                    }
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
                        .setTitle(`Action Declined - Fight`)
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

            if (button.customId === "confirm") {
                if ((await checkFightingLock(interaction.user.id)) === true) {
                    return button.reply({
                        content: "You are already in a fight.",
                        ephemeral: true,
                    });
                }
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
