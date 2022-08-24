const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    fetchInventoryData,
    fetchEconomyData,
    addItem,
    addexperiencepoints,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown } = require("../../utils/mainfunctions");

let amount;

const lowest = [
    {
        item: "rock",
        maxamount: 25,
    },
    {
        item: "shardofsteel",
        maxamount: 20,
    },
];
const lowmid = [
    {
        item: "shardofsteel",
        maxamount: 30,
    },
    {
        item: "shardofuranium",
        maxamount: 12,
    },
    {
        item: "shardofcopper",
        maxamount: 18,
    },
];
const highmid = [
    {
        item: "shardofaluminum",
        maxamount: 10,
    },
    {
        item: "shardofgold",
        maxamount: 5,
    },
];
const high = [
    {
        item: "shardofdiamond",
        maxamount: 3,
    },
    {
        item: "enhancedpickaxe",
        maxamount: 1,
    },
];

function mine() {
    const number = Math.floor(Math.random() * 10000);
    if (number <= 5000) {
        return `You weren't able to mine anything, unlucky.`;
    } else if (number <= 8300 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);
        amount = Math.floor(Math.random() * lowest[result].maxamount) + 1;

        return lowest[result].item;
    } else if (number <= 9800 && number > 8300) {
        const result = Math.floor(Math.random() * lowmid.length);
        amount = Math.floor(Math.random() * lowmid[result].maxamount) + 1;

        return lowmid[result].item;
    } else if (number <= 9999 && number > 9800) {
        const result = Math.floor(Math.random() * highmid.length);
        amount = Math.floor(Math.random() * highmid[result].maxamount) + 1;

        return highmid[result].item;
    } else if (number > 9999) {
        const result = Math.floor(Math.random() * high.length);
        amount = Math.floor(Math.random() * high[result].maxamount) + 1;

        return high[result].item;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mine")
        .setDescription("Go mining for exotic materials/substances."),
    cooldown: 120,
    cdmsg: "I am not going let you mine anymore, you need rest!",
    async execute(interaction, client, theme) {
        const allItems = await fetchAllitemsData();
        let error_message;
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        const pickaxe = allItems.find(
            (val) => val.item.toLowerCase() === "pickaxe"
        );

        const mine_embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Mine ${pickaxe.icon}`);

        const result = mine();
        if (
            !inventoryData.inventory[pickaxe.item] ||
            inventoryData.inventory[pickaxe.item] === 0
        ) {
            error_message = `You need at least \`1\` ${pickaxe.icon} ${pickaxe.item}  to go mining. Use this command again when you have one.`;
            return errorReply(interaction, error_message);
        } else {
            if (result === `You weren't able to mine anything, unlucky.`) {
                mine_embed.setDescription(`\`${result}\``);
                interaction.reply({ embeds: [mine_embed] });
            } else {
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === result
                );

                await addItem(interaction.user.id, item.item, amount);
                await addexperiencepoints(interaction.user.id, 1, 40);

                mine_embed.setDescription(
                    `What is that? Oh you were actually able to find somethings down in thet ancient mine! Good for you, you got \`${1}\` ${
                        item.icon
                    } \`${item.item}\``
                );
                interaction.reply({ embeds: [mine_embed] });
            }
        }
        return setCooldown(interaction, "mine", 120, economyData);
    },
};
