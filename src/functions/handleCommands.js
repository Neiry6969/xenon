const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("node:fs");
const { mongodb_srv, discord_token } = require("../../config.json");
const colors = require("colors");

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        const clientId = "847528987831304192";
        const guildId = "852261411136733195";

        client.commandArray = [];
        for (folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`${path}/${folder}`)
                .filter((file) => file.endsWith(".js"));

            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);
                // Set a new item in the Collection
                // With the key as the command name and the value as the exported module
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: "9" }).setToken(discord_token);

        (async () => {
            try {
                console.log(
                    "Started refreshing application (/) commands.".blue
                );

                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: client.commandArray }
                );

                console.log(
                    "Successfully reloaded application (/) commands.".blue
                );
            } catch (error) {
                console.error(error);
            }
        })();
    };
};
