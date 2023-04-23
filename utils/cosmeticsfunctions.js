const { EmbedBuilder } = require("discord.js");

const { fetchEconomyData, fetchUserData } = require("./currencyfunctions");
const UserModel = require("../models/userSchema");

class Cosmeticsfunction {
    static async fetchEmbedColor(interaction) {
        const fetch_userData = await fetchUserData(interaction.user.id);
        const userData = fetch_userData.data;
        const colors = userData.cosmetics.embedcolors;

        if (!colors || colors.length <= 0) return `#2f3136`;

        const color_choose = colors[Math.floor(Math.random() * colors.length)];
        return color_choose;
    }

    static async removeEmbedColors(userId, colors) {
        const fetch_userData = await fetchUserData(userId);
        const userData = fetch_userData.data;
        colors.forEach((color) => {
            if (userData.cosmetics.embedcolors.includes(color)) {
                const pullIndex = userData.cosmetics.embedcolors.indexOf(color);
                userData.cosmetics.embedcolors.splice(pullIndex, 1);
            }
        });
        await UserModel.findOneAndUpdate({ userId: userId }, userData);
    }
}

module.exports = Cosmeticsfunction;
