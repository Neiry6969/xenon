const colors = require("colors");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`Client logged in as ${client.user.tag}`.green);

        client.user.setPresence({
            activities: [
                {
                    name: `${client.guilds.cache.size} servers`,
                    type: "WATCHING",
                },
            ],
        });
    },
};
