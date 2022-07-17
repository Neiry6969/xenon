const { MessageEmbed } = require("discord.js");

const EconomyModel = require("../models/economySchema");
const InventoryModel = require("../models/inventorySchema");
const UserModel = require("../models/userSchema");
const StatsModel = require("../models/statsSchema");

class Currencyevents {
    static async death_handler(
        client,
        userId,
        userData,
        inventoryData,
        reason
    ) {
        userData.deaths = userData.deaths + 1;
        const lostcoins = userData.wallet;
        const dmdeathembed = new MessageEmbed().setColor("#FFA500");

        const hasLife = Object.keys(inventoryData.inventory).includes(
            "lifesaver"
        );
        if (userData.deaths <= 1) {
            dmdeathembed
                .setColor("#edfaf1")
                .setTitle(
                    `You were spared from death! <:lifesaver:978754575098085426>`
                )
                .setDescription(
                    `Since this is the first time you've almost died, Xenon decided to protect you from dying, but next time you really will die.\n**To prevent death, buy a lifesaver from the Xenon shop (\`/shop\`)**\n\nDeath: \`${reason}\`\nAvoided Coin Loss: \`❀ ${lostcoins.toLocaleString()}\``
                );
        } else if (!hasLife || inventoryData.inventory["lifesaver"] <= 0) {
            userData.wallet = userData.wallet - userData.wallet;
            dmdeathembed
                .setTitle(`You died, rip. <:ghost:978412292012146688>`)
                .setDescription(
                    `You didn't have any items to save you from this death. You lost your whole wallet.\n\nDeath: \`${reason}\`\nCoins Lost: \`❀ ${lostcoins.toLocaleString()}\``
                );
        } else {
            inventoryData.inventory["lifesaver"] =
                inventoryData.inventory["lifesaver"] - 1;
            dmdeathembed
                .setColor("#edfaf1")
                .setTitle(
                    `You were saved from death's grasps because of a lifesaver! <:lifesaver:978754575098085426>`
                )
                .setDescription(
                    `Since you had a <:lifesaver:978754575098085426> \`lifesaver\` in your inventory, death was scared and ran away, but after the <:lifesaver:978754575098085426> \`lifesaver\` disappeared. Whew, close shave!\n\nDeath: \`${reason}\`\nAvoided Coin Loss: \`❀ ${lostcoins.toLocaleString()}\`\nLifes Left: <:lifesaver:978754575098085426> \`${inventoryData.inventory[
                        "lifesaver"
                    ].toLocaleString()}\``
                );
        }

        await EconomyModel.findOneAndUpdate({ userId: userId }, userData);
        await InventoryModel.findOneAndUpdate(
            { userId: userId },
            inventoryData
        );
        client.users.fetch(userId, false).then((user) => {
            user.send({ embeds: [dmdeathembed] });
        });
    }
}

module.exports = Currencyevents;
