const fs = require("fs");

const jsoncooldowns = require("../cooldowns.json");
const interactionproccesses = require("../interactionproccesses.json");

class Mainfunctions {
    static async setCooldown(
        interaction,
        commandname,
        cooldowntime,
        economyData
    ) {
        function premiumcooldowncalc(defaultcooldown) {
            if (defaultcooldown <= 5 && defaultcooldown > 2) {
                return defaultcooldown - 2;
            } else if (defaultcooldown <= 15) {
                return defaultcooldown - 5;
            } else if (defaultcooldown <= 120) {
                return defaultcooldown - 10;
            } else {
                return defaultcooldown;
            }
        }

        let cooldown = cooldowntime;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            economyData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_ms = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_ms;
        jsoncooldowns[interaction.user.id][commandname] = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    }

    static async setProcessingLock(interaction, status) {
        interactionproccesses[interaction.user.id] = {
            interaction: status,
            proccessingcoins: status,
        };
        fs.writeFile(
            "./interactionproccesses.json",
            JSON.stringify(interactionproccesses),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    }
}

module.exports = Mainfunctions;
