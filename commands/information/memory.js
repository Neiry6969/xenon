const { SlashCommandBuilder } = require("@discordjs/builders");
const { setEventCooldown } = require("../../utils/mainfunctions");
const os = require("os");

module.exports = {
    data: new SlashCommandBuilder().setName("memory").setDescription("memory?"),
    cooldown: 10,
    async execute(interaction) {
        const p = (os.freemem() * 100) / os.totalmem();
        interaction.reply(p.toString());
    },
};
