const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Message,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const letternumbers = require("../../reference/letternumber");
const interactionproccesses = require("../../interactionproccesses.json");
const { death_handler } = require("../../utils/currencyevents");

const jsoncooldowns = require("../../cooldowns.json");
const fs = require("fs");
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eventheist")
        .setDescription(
            "An event for everyone to join together and heist your bank."
        )
        .addStringOption((oi) => {
            return oi
                .setName("amount")
                .setRequired(true)
                .setDescription(
                    "A constant number: `123`, a short form: `2k`, a keyword: `max or half`"
                );
        }),
    cooldown: 25,
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData
    ) {
        let confirmed = false;
        const params = {
            userId: interaction.user.id,
        };

        const options = {
            amount: interaction.options.getString("amount"),
        };

        let amount = options.amount?.toLowerCase();
        const errorembed = new MessageEmbed().setColor("#FF5C5C");

        let cooldown = 25;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].eventheist = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        const minreqcoins = 500000;
        const minjoincoins = 5000;

        if (userData.bank.coins <= 0) {
            if (userData.wallet <= 0) {
                errorembed.setDescription(
                    `You have no coins in your bank to host an event-heist.\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                errorembed.setDescription(
                    `You have no coins in your bank to host an event-heist, maybe deposit some?\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            }
        }

        if (amount === "max" || amount === "all") {
            amount = userData.bank.coins;
        } else if (amount === "half") {
            amount = Math.floor(userData.bank.coins / 2);
        } else if (
            letternumbers.find((val) => val.letter === amount.slice(-1))
        ) {
            if (parseInt(amount.slice(0, -1))) {
                const number = parseFloat(amount.slice(0, -1));
                const numbermulti = letternumbers.find(
                    (val) => val.letter === amount.slice(-1)
                ).number;
                amount = number * numbermulti;
            } else {
                amount = null;
            }
        } else {
            amount = parseInt(amount);
        }

        if (amount < minreqcoins) {
            errorembed.setDescription(
                `That amount you provided is lower than the minimum event-heist hosting amount, pick a larger amount so payouts can be juicy.\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (!amount || amount < 0 || amount % 1 != 0) {
            errorembed.setDescription(
                "Event-heist amount must be a whole number."
            );
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        } else if (amount > userData.bank.coins) {
            if (amount < userData.bank.coins + userData.wallet) {
                errorembed.setDescription(
                    `You don't have that amount coins in your bank to host an event-heist, maybe deposit some?\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            } else {
                errorembed.setDescription(
                    `You don't have that amount coins in your bank or your wallet to host an event-heist.\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``
                );
                return interaction.reply({
                    embeds: [errorembed],
                    ephemeral: true,
                });
            }
        }

        async function eventheist() {
            const heistendstimestamp = Math.floor((Date.now() + 120000) / 1000);
            const eventheist_arry = [];
            let eventheistjoinedno = 0;
            let joineventheist = new MessageButton()
                .setCustomId("joineventheist")
                .setLabel(
                    `Join Event Heist (- ❀ ${minjoincoins.toLocaleString()})`
                )
                .setStyle(`SUCCESS`);
            let eventheistjoined = new MessageButton()
                .setCustomId("eventheistjoined")
                .setLabel(`Users: ${eventheistjoinedno.toLocaleString()}`)
                .setStyle("SECONDARY")
                .setDisabled();

            let erow = new MessageActionRow().addComponents(
                joineventheist,
                eventheistjoined
            );

            const eventheist_embed = new MessageEmbed()
                .setTitle(
                    `<a:alarm:997584331302260909> Event Heist Starting! <a:alarm:997584331302260909>`
                )
                .setDescription(
                    `\`Alright hungry people, join up! This heist is about to get crazy!\`\n\n**Ending:** <t:${heistendstimestamp}:R>\n\n**Information**\nHost: <@${
                        interaction.user.id
                    }> (\`${interaction.user.tag}\`)\nId: \`${
                        interaction.user.id
                    }\`\n**Amount:** \`❀ ${amount.toLocaleString()}\`\n\`\`\`diff\n- You need to pay ❀ ${minjoincoins.toLocaleString()} from your wallet\n\`\`\``
                );

            const eventheistlobby_msg = await interaction.channel.send({
                embeds: [eventheist_embed],
                components: [erow],
            });

            const collector =
                eventheistlobby_msg.createMessageComponentCollector({
                    time: 120 * 1000,
                });

            collector.on("collect", async (button) => {
                if (button.user.id === interaction.user.id) {
                    return button.reply({
                        content:
                            "You can't join your own event-heist, sorry not sorry.",
                        ephemeral: true,
                    });
                }

                if (button.customId === "joineventheist") {
                    let getUserData;
                    try {
                        getUserData = await economyModel.findOne({
                            userId: button.user.id,
                        });
                        if (!getUserData) {
                            let user = await economyModel.create({
                                userId: button.user.id,
                            });

                            user.save();

                            getUserData = user;
                        }
                    } catch (error) {
                        console.log(error);
                    }

                    if (getUserData.wallet < minjoincoins) {
                        errorembed.setDescription(
                            `You need at least \`❀ ${minjoincoins.toLocaleString()}\` in your wallet to join this event-heist!`
                        );
                        return button.reply({
                            embeds: [errorembed],
                            ephemeral: true,
                        });
                    } else if (eventheist_arry.includes(button.user.id)) {
                        errorembed.setDescription(
                            `You already joined this heist bruh!`
                        );
                        return button.reply({
                            embeds: [errorembed],
                            ephemeral: true,
                        });
                    } else {
                        eventheist_arry.push(button.user.id);
                        getUserData.wallet = getUserData.wallet - minjoincoins;
                        await economyModel.findOneAndUpdate(
                            {
                                userId: button.user.id,
                            },
                            getUserData
                        );

                        eventheistjoinedno = eventheist_arry.length;

                        eventheistjoined.setLabel(
                            `Users: ${eventheistjoinedno.toLocaleString()}`
                        );
                        const joinedembed = new MessageEmbed()
                            .setColor("#9cffa1")
                            .setDescription(
                                `You successfully paided \`❀ ${minjoincoins.toLocaleString()}\` to join the event-heist, now sit tight and wait for the event to end!`
                            );

                        await eventheistlobby_msg.edit({
                            embeds: [eventheist_embed],
                            components: [erow],
                        });

                        return button.reply({
                            embeds: [joinedembed],
                            ephemeral: true,
                        });
                    }
                }
            });

            collector.on("end", async (collected) => {
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
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

                eventheist_embed.setTitle(`Event Heist Ended...`);
                joineventheist.setDisabled();

                if (eventheist_arry.length < 3) {
                    eventheist_embed.setDescription(
                        `<@${interaction.user.id}>, your event-heist wasn't popular at all sadly.\nYou need at least \`3\` users to join.`
                    );
                } else {
                    eventheist_embed.setDescription(
                        `Alright, let us get on with the heist!\nUsers: \`${eventheist_arry.length.toLocaleString()}\``
                    );
                    const survivors = [];
                    const failed = [];
                    const caught = [];
                    const dead = [];

                    eventheist_arry.forEach((id) => {
                        const result = Math.floor(Math.random() * 2);

                        if (result === 0) {
                            return survivors.push(id);
                        } else {
                            return failed.push(id);
                        }
                    });

                    if (
                        survivors.length === 0 ||
                        survivors.length <
                            Math.floor(eventheist_arry.length / 3)
                    ) {
                        const allowedsurvied =
                            survivors.length -
                            Math.floor(eventheist_arry.length / 3);

                        for (let i = 0; i < allowedsurvied; i++) {
                            const survivedno = Math.floor(
                                Math.random() * failed.length
                            );
                            const id = failed[survivedno];
                            failed.pull(id);
                            survivors.push(id);
                            console.log(id);
                        }
                    }

                    failed.forEach((id) => {
                        const result = Math.floor(Math.random() * 2);

                        if (result === 0) {
                            return caught.push(id);
                        } else {
                            return dead.push(id);
                        }
                    });

                    const eachcoins = Math.floor(amount / survivors.length);

                    const surviorsembed = new MessageEmbed()
                        .setTitle("<:nezuko_yas:995045946087968850> Survivors")
                        .setDescription(
                            `Showing results~ <a:loading:987196796549861376>`
                        );
                    const caughtembed = new MessageEmbed()
                        .setTitle("<:nezuko_gun:995045376551833611> Caught")
                        .setDescription(
                            `Showing results~ <a:loading:987196796549861376>`
                        );
                    const deadembed = new MessageEmbed()
                        .setTitle("<:ghost:978412292012146688> Died")
                        .setDescription(
                            `Showing results~ <a:loading:987196796549861376>`
                        );
                    let survivorsusermsg;
                    let caughtsusermsg;
                    let deadusermsg;

                    const survivors_msg = await interaction.channel.send({
                        embeds: [surviorsembed],
                    });
                    survivors.forEach(async (id) => {
                        const smsgs = [
                            "tampled over everyone in the bank to get out",
                            "shot everyone they saw and walked out the front door of the bank",
                            "scammed the police into letting them out of the bank",
                            "snuck out the back door",
                            "sunck out with the hostages",
                        ];
                        const selected_smsg =
                            smsgs[Math.floor(Math.random() * smsgs.length)];
                        const user = await client.users
                            .fetch(id)
                            .catch(console.error);

                        if (survivorsusermsg === undefined) {
                            survivorsusermsg = `+ ${user.tag} ${selected_smsg}`;
                        } else {
                            survivorsusermsg =
                                survivorsusermsg +
                                `\n+ ${user.tag} ${selected_smsg}`;
                        }
                        surviorsembed.setDescription(
                            `\`\`\`diff\n${survivorsusermsg}\n\`\`\``
                        );

                        await economyModel.findOneAndUpdate(
                            { userId: user.id },
                            {
                                $inc: {
                                    wallet: eachcoins,
                                },
                            }
                        );
                        return survivors_msg.edit({ embeds: [surviorsembed] });
                    });

                    const caught_msg = await interaction.channel.send({
                        embeds: [caughtembed],
                    });
                    if (caught.length > 0) {
                        caught.forEach(async (id) => {
                            const smsgs = [
                                "was scared and turned themselves in",
                                "ran into a cop",
                                "failed to get out",
                                "was stuck at the entrance looking for the exit",
                                "tried sneaking out but was caught",
                            ];
                            const selected_smsg =
                                smsgs[Math.floor(Math.random() * smsgs.length)];
                            const user = await client.users
                                .fetch(id)
                                .catch(console.error);

                            if (caughtsusermsg === undefined) {
                                caughtsusermsg = `> ${user.tag} ${selected_smsg}`;
                            } else {
                                caughtsusermsg =
                                    caughtsusermsg +
                                    `\n> ${user.tag} ${selected_smsg}`;
                            }
                            caughtembed.setDescription(
                                `\`\`\`${caughtsusermsg}\n\`\`\``
                            );
                            return caught_msg.edit({
                                embeds: [caughtembed],
                            });
                        });
                    } else {
                        caughtsusermsg = `\`\`\`No one was caught\`\`\``;
                        caughtembed.setDescription(caughtsusermsg);
                        caught_msg.edit({ embeds: [caughtembed] });
                    }

                    const dead_msg = await interaction.channel.send({
                        embeds: [deadembed],
                    });
                    if (dead.length > 0) {
                        const smsgs = [
                            "was shot by someone in the commotion",
                            "was destroyed by a cop",
                            "slipped on a banana",
                            "jumped by a hostage",
                            "hit in the head by a steal baton",
                            "killed because they died an explosion",
                        ];
                        const selected_smsg =
                            smsgs[Math.floor(Math.random() * smsgs.length)];
                        dead.forEach(async (id) => {
                            const user = await client.users
                                .fetch(id)
                                .catch(console.error);

                            if (deadusermsg === undefined) {
                                deadusermsg = `- ${user.tag} ${selected_smsg}`;
                            } else {
                                deadusermsg =
                                    deadusermsg +
                                    `\n- ${user.tag} ${selected_smsg}`;
                            }

                            deadembed.setDescription(
                                `\`\`\`diff\n${deadusermsg}\n\`\`\``
                            );

                            const fetchUserData = await economyModel.findOne({
                                userId: user.id,
                            });
                            const fetctInvData = await inventoryModel.findOne({
                                userId: user.id,
                            });

                            death_handler(
                                client,
                                user.id,
                                fetchUserData,
                                fetctInvData,
                                "event-heist"
                            );
                            return dead_msg.edit({
                                embeds: [deadembed],
                            });
                        });
                    } else {
                        deadusermsg = `\`\`\`No one died\`\`\``;
                        deadembed.setDescription(deadusermsg);
                        dead_msg.edit({ embeds: [deadembed] });
                    }

                    userData.bank.coins = userData.bank.coins - amount;
                    await economyModel.findOneAndUpdate(params, userData);

                    const resultembed = new MessageEmbed()
                        .setTitle("Event-heist Results~")
                        .setDescription(
                            `\`${eventheist_arry.length.toLocaleString()} attended the event-heist\`\n**Each survivor took home a payout of: \`❀ ${eachcoins.toLocaleString()}\`**\n\n<:nezuko_yas:995045946087968850> Survivors: \`${survivors.length.toLocaleString()}\`\n<:nezuko_gun:995045376551833611> Caught: \`${caught.length.toLocaleString()}\`\n<:ghost:978412292012146688> Died: \`${dead.length.toLocaleString()}\``
                        );

                    if (survivors.length <= 0) {
                        userData.bank.coins = userData.bank.coins + amount;
                        await economyModel.findOneAndUpdate(params, userData);
                        resultembed.setDescription(
                            `All the users that attended to this event either failed or died, therefore <@${
                                interaction.user.id
                            }> magically burned all the coins!\nCoins: \`❀ ${amount.toLocaleString()}\`\n\`just joking :)\``
                        );
                    }
                    interaction.channel.send({ embeds: [resultembed] });
                }
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
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

                await eventheistlobby_msg.edit({
                    embeds: [eventheist_embed],
                    components: [erow],
                });
            });
        }

        interactionproccesses[interaction.user.id] = {
            interaction: true,
            proccessingcoins: true,
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

        let confirm = new MessageButton()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle("PRIMARY");

        let cancel = new MessageButton()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("DANGER");

        let row = new MessageActionRow().addComponents(confirm, cancel);

        const embed = {
            color: "RANDOM",
            author: {
                name: `_____________`,
                icon_url: `${interaction.user.displayAvatarURL()}`,
            },
            title: `Confirm action`,
            description: `<@${
                interaction.user.id
            }>, are you sure you want to host an event-heist of \`❀ ${amount.toLocaleString()}\`?`,
            timestamp: new Date(),
        };
        await interaction.reply({
            embeds: [embed],
            components: [row],
        });

        const eventheist_msg = await interaction.fetchReply();

        const collector = eventheist_msg.createMessageComponentCollector({
            time: 20 * 1000,
        });

        collector.on("collect", async (button) => {
            if (button.user.id != interaction.user.id) {
                return button.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            button.deferUpdate();

            if (button.customId === "confirm") {
                confirmed = true;
                const embed = {
                    color: "RANDOM",
                    author: {
                        name: `_____________`,
                        icon_url: `${interaction.user.displayAvatarURL()}`,
                    },
                    title: `Action confirmed`,
                    description: `<@${
                        interaction.user.id
                    }>, alrighty, lets get this started!\nEvent Heist Amount: \`❀ ${amount.toLocaleString()}\`?`,
                    timestamp: new Date(),
                };

                eventheist();

                confirm.setDisabled().setStyle("SUCCESS");

                cancel.setDisabled().setStyle("SECONDARY");

                eventheist_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
            } else if (button.customId === "cancel") {
                interactionproccesses[interaction.user.id] = {
                    interaction: false,
                    proccessingcoins: false,
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

                const embed = {
                    color: "#FF0000",
                    author: {
                        name: `_____________`,
                        icon_url: `${interaction.user.displayAvatarURL()}`,
                    },
                    title: `Confirm action`,
                    description: `<@${
                        interaction.user.id
                    }>, are you sure you want to host an event-heist of \`❀ ${amount.toLocaleString()}\`?\nI guess not...`,
                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled();

                eventheist_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
            }
        });

        collector.on("end", async (collected) => {
            if (collected.size > 0) {
            } else {
                if (confirmed === true) {
                    interactionproccesses[interaction.user.id] = {
                        interaction: false,
                        proccessingcoins: false,
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

                const embed = {
                    color: "#FF0000",
                    author: {
                        name: `_____________`,
                        icon_url: `${interaction.user.displayAvatarURL()}`,
                    },
                    title: `Confirm action`,
                    description: `<@${
                        interaction.user.id
                    }>, are you sure you want to host an event-heist of \`❀ ${amount.toLocaleString()}\`?\nI guess not...`,
                    timestamp: new Date(),
                };

                confirm.setDisabled().setStyle("SECONDARY");

                cancel.setDisabled().setStyle("SECONDARY");

                eventheist_msg.edit({
                    embeds: [embed],
                    components: [row],
                });
            }
        });
    },
};
