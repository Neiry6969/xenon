const { mongodb_srv, discord_token } = require('./config.json');
const {Discord, Collection, Intents, Client, MessageEmbed } = require('discord.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
})

const mongoose = require('mongoose');

client.commands = new Collection();
client.events = new Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});

mongoose
    .connect(mongodb_srv, {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    }).then(() => {
        console.log('Connected to the database...')
    }).catch((err) => {
        console.log(err)
    })

client.login(discord_token);