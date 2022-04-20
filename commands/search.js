const { MessageActionRow, MessageButton } = require('discord.js')

const profileModel = require("../models/profileSchema");
const inventoryModel = require('../models/inventorySchema');
const allItems = require('../items/all_items');

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

module.exports = {
    name: "search",
    aliases: ["scout"],
    cooldown: 15,
    minArgs: 0,
    maxArgs: 1,
    description: "sell an item.",
    async execute(message, args, cmd, client, Discord, profileData) {
        const searchplaces = ['truck', 'railway', 'alley', 'studio', 'shop', 'circus', 'skatepark', 'downtown', 'frige',  'brain', 'school', 'valley', 'beach', 'bar', 'internet']
        const displayedplaces = getRandom(searchplaces, 3)

        let display_1 = new MessageButton()
            .setCustomId(displayedplaces[0])
            .setLabel(displayedplaces[0])
            .setStyle('PRIMARY')

        let display_2 = new MessageButton()
            .setCustomId(displayedplaces[1])
            .setLabel(displayedplaces[1])
            .setStyle('PRIMARY')

        let display_3 = new MessageButton()
            .setCustomId(displayedplaces[2])
            .setLabel(displayedplaces[2])
            .setStyle('PRIMARY')

        let row = new MessageActionRow()
            .addComponents(
                display_1,
                display_2,
                display_3
            );

        const embed = {
            color: "RANDOM",
            title: `Where do you plan to search?`,
            description: `Pick an option below to start searching that location.\n\`You got 20 seconds to choose!\``,
            timestamp: new Date(),
        };

        const search_msg = await message.reply({ embeds: [embed], components: [row] });

        const collector = search_msg.createMessageComponentCollector({ time: 20 * 1000 });

        collector.on('collect', async (button) => {
            if(button.user.id != message.author.id) {
                return button.reply({
                    content: 'This is not for you.',
                    ephemeral: true,
                })
            } 

            button.deferUpdate()
        })

        collector.on('end', collected => {
            const embed = {
                color: "RANDOM",
                title: `Search timed out`,
                description: `So I guess your not going to search anywhere.`,
                timestamp: new Date(),
            };
            search_msg.components[0].components.forEach(c => {c.setDisabled()})
            search_msg.edit({ embeds: [embed], components: search_msg.components })
        });
    },
}