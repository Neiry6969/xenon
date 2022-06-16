const jsoncooldowns = require('../cooldowns.json');
const fs = require('fs')
function premiumcooldowncalc(defaultcooldown) {
    if(defaultcooldown <= 5 && defaultcooldown > 2) {
        return defaultcooldown - 2
    } else if(defaultcooldown <= 15) {
        return defaultcooldown - 5
    } else if(defaultcooldown <= 120) {
        return defaultcooldown - 10
    } else {
        return defaultcooldown
    }
}

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
        let cooldown = 10;
        if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
            cooldown = premiumcooldowncalc(cooldown)
        }
        const cooldown_amount = (cooldown) * 1000;
        const timpstamp = Date.now() + cooldown_amount
        jsoncooldowns[message.author.id].ping = timpstamp
        fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})
    }
}