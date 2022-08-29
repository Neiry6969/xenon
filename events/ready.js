const colors = require("colors");
const { resetInteractionproccesses } = require("../utils/mainfunctions");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        resetInteractionproccesses();
        console.log(`Client logged in as ${client.user.tag}`.green);
        client.emit("tick");

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
