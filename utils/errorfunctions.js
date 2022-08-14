const { MessageEmbed } = require("discord.js");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const ItemModel = require("../models/itemSchema");
const { fetchAllitemsData, fetchItemData } = require("./itemfunctions");

class Errorfunctions {
    static async errorReply(interaction, description) {
        const error_embed = new MessageEmbed()
            .setColor(`#ff6678`)
            .setDescription(`${description}`);
        return interaction.reply({ embeds: [error_embed], ephemeral: true });
    }
}

module.exports = Errorfunctions;
