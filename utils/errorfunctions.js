const { EmbedBuilder } = require("discord.js");

class Errorfunctions {
    static async errorReply(interaction, description) {
        const error_embed = new EmbedBuilder()
            .setColor(`#ff6678`)
            .setDescription(`${description}`);
        return interaction.reply({ embeds: [error_embed], ephemeral: true });
    }
}

module.exports = Errorfunctions;
