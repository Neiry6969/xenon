const { MessageActionRow, MessageButton } = require('discord.js')

module.exports = {
    name: 'invite',
    aliases: ['inv'],
    cooldown: 5,
    description: "invite the bot to your server.",
    execute(message, args, cmd, client, Discord, profileData) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
					.setLabel('Click To Invite')
					.setStyle('LINK')
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot')
                    .setDisabled(false)
        );

        const embed = {
            color: 0x0099ff,
            title: `Invite ${client.user.username} To Your Server!`,
            description: `Click the button below to invite the bot.
            Here is extra url: [\`https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot\`](https://discord.com/api/oauth2/authorize?client_id=847528987831304192&permissions=8&scope=bot)`,
            author: {
                name: `${client.user.username}`,
                icon_url: `${client.user.displayAvatarURL()}`,
            },
            thumbnail: {
                url: 'https://images-ext-1.discordapp.net/external/Sqq8x0LOEM7_G8spfygf8QrW_vcMdIwNODmHH1LCzzQ/https/i.gifer.com/UUG2.gif?width=390&height=427',
            },
            timestamp: new Date(),
        };

        message.reply({ ephemeral: true, embeds: [embed], components: [row] })
    }
}