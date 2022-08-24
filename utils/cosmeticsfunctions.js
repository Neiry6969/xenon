const { MessageEmbed } = require("discord.js");

const { fetchEconomyData, fetchUserData } = require("./currencyfunctions");

class Cosmeticsfunction {
    static async fetchEmbedColor(interaction) {
        const fetch_userData = await fetchUserData(interaction.user.id);
        const userData = fetch_userData.data;
        const colors = userData.cosmetics.embedcolors;

        if (!colors || colors.length <= 0) return `#2f3136`;

        const color_choose = colors[Math.floor(Math.random() * colors.length)];
        return color_choose;
    }
}

module.exports = Cosmeticsfunction;
