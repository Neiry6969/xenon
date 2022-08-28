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

        if (quantity === 0) {
            singleprize_display = `\`nothing\``;
        } else if (quantity && !options.item) {
            singleprize_display = `\`❀ ${quantity.toLocaleString()}\``;
        } else if (quantity && itemData) {
            singleprize_display = `${itemData.icon} \`${
                itemData.item
            }\` \`x ${quantity.toLocaleString()}}\``;
        }

        const confirmfight_embed = new MessageEmbed()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Action Confirmation  - Fight`)
            .setDescription(
                `${interaction.user} are you sure you want to fight ${singleprize_display} with ${options.user}`
            );
        interaction.reply({
            embeds: [confirmfight_embed],
        });

        return setCooldown(interaction, "fight", 5, economyData);
    },
};
