module.exports = {
    name: 'ping',
    aliases: ['latency'],
    cooldown: 10,
    cooldownmsg: 'Stop trying to break the bot',
    description: "check the bit's latency status.",
    execute(message, args, cmd, client, Discord) {
        const embed = {
            color: 0x0099ff,
            title: `${client.user.username}'s Bot Latency`,
            description: `Here are the bot's latencies...`,
            author: {
                name: `${client.user.username}`,
                icon_url: `${client.user.displayAvatarURL()}`,
            },
            thumbnail: {
                url: 'https://images-ext-1.discordapp.net/external/Sqq8x0LOEM7_G8spfygf8QrW_vcMdIwNODmHH1LCzzQ/https/i.gifer.com/UUG2.gif?width=390&height=427',
            },
            fields: [
                {
                    name: 'Ping Latency',
                    value: `<:moon:962410227104383006> \`${Date.now() - message.createdTimestamp}\`ms`,
                    inline: true,
                },
                {
                    name: 'API Latency',
                    value: `<:moon:962410227104383006> \`${Math.round(client.ws.ping)}\`ms`,
                    inline: true,
                },
                
            ],
            timestamp: new Date(),
        };

        message.channel.send({ embeds: [embed] })
    }
}