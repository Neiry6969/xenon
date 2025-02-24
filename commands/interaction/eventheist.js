const {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    Message,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    fetchStatsData,
    removeCoins,
    addCoins,
    addItem,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const {
    setCooldown,
    setProcessingLock,
    setEventCooldown,
    checkEventCooldown,
} = require("../../utils/mainfunctions");
const { death_handler } = require("../../utils/currencyevents");
const letternumbers = require("../../reference/letternumber");
const EconomyModel = require("../../models/economySchema");

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
    async execute(interaction, client, theme) {
        const options = {
            amount: interaction.options.getString("amount"),
        };
        const cooldown = await checkEventCooldown(
            interaction.user.id,
            "eventheist"
        );
        let endinteraction = false;
        let error_message;

        if (cooldown.status === true) {
            error_message = `You already did an event heist earlier, you need to wait for the 1 hour cooldown\n\nReady: <t:${Math.floor(
                cooldown.rawcooldown / 1000
            )}:R>`;
            return errorReply(interaction, error_message);
        }

        let amount = options.amount?.toLowerCase();
        const minreqcoins = 500000;
        const minjoincoins = 5000;
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        if (economyData.bank.coins <= 0) {
            if (economyData.wallet <= 0) {
                error_message = `You have no coins in your bank to host an event-heist.\n\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``;
                return errorReply(interaction, error_message);
            } else {
                error_message = `You have no coins in your bank to host an event-heist, maybe deposit some?\n\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``;
                return errorReply(interaction, error_message);
            }
        }

        if (amount === "max" || amount === "all") {
            amount = economyData.bank.coins;
        } else if (amount === "half") {
            amount = Math.floor(economyData.bank.coins / 2);
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
            error_message = `That amount you provided is lower than the minimum event-heist hosting amount, pick a larger amount so payouts can be juicy.\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``;
            return errorReply(interaction, error_message);
        } else if (!amount || amount < 0 || amount % 1 != 0) {
            errorembed.setDescription(
                "Event-heist amount must be a whole number."
            );
            return errorReply(interaction, error_message);
        } else if (amount > economyData.bank.coins) {
            if (amount < economyData.bank.coins + economyData.wallet) {
                error_message = `You don't have that amount coins in your bank to host an event-heist, maybe deposit some?\n\nNet Balance: \`❀ ${economyData_fetch.networth.toLocaleString()}\``;
                return errorReply(interaction, error_message);
            } else {
                error_message = `You don't have that amount coins in your bank or your wallet to host an event-heist.\n\nNet Balance: \`❀ ${economyData_fetch.networth.toLocaleString()}\``;
                return errorReply(interaction, error_message);
            }
        }

        async function eventheist() {
            const heistendstimestamp = Math.floor((Date.now() + 120000) / 1000);
            const eventheist_arry = [];
            let eventheistjoinedno = 0;
            let joineventheist = new ButtonBuilder()
                .setCustomId("joineventheist")
                .setLabel(
                    `Join Event Heist (- ❀ ${minjoincoins.toLocaleString()})`
                )
                .setStyle(`SUCCESS`);
            let eventheistjoined = new ButtonBuilder()
                .setCustomId("eventheistjoined")
                .setLabel(`Users: ${eventheistjoinedno.toLocaleString()}`)
                .setStyle("SECONDARY")
                .setDisabled();

            let erow = new ActionRowBuilder().addComponents(
                joineventheist,
                eventheistjoined
            );

            const eventheist_embed = new EmbedBuilder()
                .setColor(theme.embed.color)
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
                    error_message =
                        "You can't join your own event-heist, sorry not sorry.";
                    return errorReply(button, error_message);
                }

                if (button.customId === "joineventheist") {
                    const fetch_userEconomy = await fetchEconomyData(
                        button.user.id
                    );
                    const userEconomy = fetch_userEconomy.data;
                    const joincooldown = await checkEventCooldown(
                        button.user.id,
                        "heist"
                    );

                    if (joincooldown.status === true) {
                        error_message = `It hasn't been long since you last joined a heist, you will need to wait 10 minutes before joining another one.\n\nReady: <t:${Math.floor(
                            joincooldown.rawcooldown / 1000
                        )}:R>`;
                        return errorReply(button, error_message);
                    } else if (userEconomy.wallet < minjoincoins) {
                        error_message = `You need at least \`❀ ${minjoincoins.toLocaleString()}\` in your wallet to join this event-heist!`;
                        return errorReply(button, error_message);
                    } else if (eventheist_arry.includes(button.user.id)) {
                        error_message = `You already joined this heist bruh!`;
                        return errorReply(button, error_message);
                    } else {
                        await setEventCooldown(button.user.id, "heist", 600);
                        eventheist_arry.push(button.user.id);
                        await removeCoins(button.user.id, minjoincoins);

                        eventheistjoinedno = eventheist_arry.length;

                        eventheistjoined.setLabel(
                            `Users: ${eventheistjoinedno.toLocaleString()}`
                        );
                        const joinedembed = new EmbedBuilder()
                            .setColor(`#95ff87`)
                            .setDescription(
                                `You successfully paid \`❀ ${minjoincoins.toLocaleString()}\` to join the event-heist, now sit tight and wait for the event to end!`
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
                setProcessingLock(interaction.user.id, false);

                eventheist_embed
                    .setTitle(`Event Heist Ended...`)
                    .setColor(theme.embed.color);
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
                            const pullIndex = failed.indexOf(id);
                            failed.splice(pullIndex, 1);
                            survivors.push(id);
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

                    const surviorsembed = new EmbedBuilder()
                        .setColor(theme.embed.color)

                        .setTitle("<:nezuko_yas:995045946087968850> Survivors")
                        .setDescription(
                            `Showing results~ <a:loading:987196796549861376>`
                        );
                    const caughtembed = new EmbedBuilder()
                        .setColor(theme.embed.color)

                        .setTitle("<:nezuko_gun:995045376551833611> Caught")
                        .setDescription(
                            `Showing results~ <a:loading:987196796549861376>`
                        );
                    const deadembed = new EmbedBuilder()
                        .setColor(theme.embed.color)

                        .setTitle("<:ghost:978412292012146688> Died")
                        .setDescription(
                            `Showing results~ <a:loading:987196796549861376>`
                        );
                    let survivorsusermsg;
                    let caughtsusermsg;
                    let deadusermsg;

                    if (eventheist_arry.length > 40) {
                        await interaction.channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(theme.embed.color)
                                    .setDescription(
                                        `More than \`40\` join this event-heist and to prevent spam, individual results aren't shown.There might be changes to this in the future.`
                                    ),
                            ],
                        });

                        survivors.forEach(async (id) => {
                            const user = await client.users
                                .fetch(id)
                                .catch(console.error);

                            await addCoins(user.id, eachcoins);
                        });

                        if (dead.length > 0) {
                            dead.forEach(async (id) => {
                                const user = await client.users
                                    .fetch(id)
                                    .catch(console.error);

                                const fetchEconomyData_user =
                                    await fetchEconomyData(user.id);
                                const fetctInvData_user =
                                    await fetchInventoryData(user.id);
                                const fetctStatsData_user =
                                    await fetchStatsData(user.id);

                                await death_handler(
                                    client,
                                    user.id,
                                    fetchEconomyData_user.data,
                                    fetctInvData_user.data,
                                    fetctStatsData_user.data,
                                    "event-heist"
                                );
                            });
                        }
                    } else {
                        const survivors_msg = await interaction.channel.send({
                            embeds: [surviorsembed],
                        });
                        survivors.forEach(async (id) => {
                            const smsgs = [
                                "tampled over everyone in the bank to get out",
                                "shot everyone they saw and walked out the front door of the bank",
                                "scammed a police into letting them out of the bank",
                                "snuck out the back door",
                                "sunck out with the hostages",
                                "ate something that made them invisible",
                                "was just lucky",
                                "feared nothing",
                                "went out right away",
                                "was so scary no one wanted to be near them",
                                "had some decent combat skills and escaped",
                                "just did it ✓™",
                                "came out with tons of wounds",
                                "almost died, and might retire soon",
                                "walked in mad that they didn't get their salary, walked out happier",
                                "wormed their way out",
                                "turned invisible and became a ninja",
                                "put on airpods and hear nothing, didn't even know they where robbing a bank",
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

                            await addCoins(user.id, eachcoins);
                            return survivors_msg.edit({
                                embeds: [surviorsembed],
                            });
                        });
                        if (survivors.length <= 0) {
                            survivorsusermsg = `\`\`\`No one survived\`\`\``;
                            surviorsembed.setDescription(survivorsusermsg);
                            survivors_msg.edit({ embeds: [surviorsembed] });
                        }

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
                                    "attended the heist in their head",
                                    "tried to befriend a police",
                                    "was drunk and called the police",
                                    "belly was too big and was suspected",
                                    "ate too much and couldn't move",
                                    "looked for shelter in a police car",
                                    "was woulded and needed an ambulance",
                                    "felt disgraced",
                                    "dream of getting it, but was caught in the end",
                                ];
                                const selected_smsg =
                                    smsgs[
                                        Math.floor(Math.random() * smsgs.length)
                                    ];
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
                            dead.forEach(async (id) => {
                                const smsgs = [
                                    "was shot by someone in the commotion",
                                    "was destroyed by a cop",
                                    "slipped on a banana",
                                    "jumped by a hostage",
                                    "hit in the head by a steal baton",
                                    "killed because they died an explosion",
                                    "fought with their buddy and got shot by them",
                                    "fell off the stairs, kinda funny how they died",
                                    "played too many games of mafia and died of cringe",
                                    "was hanged by the their comrades",
                                    "ate too much edibles",
                                    "was stabbed to death",
                                    "tried be cool but died doing nothing",
                                    "died of cringe",
                                    "died because they weren't able to enter the bank",
                                ];
                                const selected_smsg =
                                    smsgs[
                                        Math.floor(Math.random() * smsgs.length)
                                    ];
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

                                const fetchEconomyData_user =
                                    await fetchEconomyData(user.id);
                                const fetctInvData_user =
                                    await fetchInventoryData(user.id);
                                const fetctStatsData_user =
                                    await fetchStatsData(user.id);

                                await death_handler(
                                    client,
                                    user.id,
                                    fetchEconomyData_user.data,
                                    fetctInvData_user.data,
                                    fetctStatsData_user.data,
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
                    }

                    economyData.bank.coins -= amount;

                    const resultembed = new EmbedBuilder()
                        .setTitle("Event-heist Results~")
                        .setDescription(
                            `\`${eventheist_arry.length.toLocaleString()} attended the event-heist\`\n**Each survivor took home a payout of: \`❀ ${eachcoins.toLocaleString()}\`**\n\n<:nezuko_yas:995045946087968850> Survivors: \`${survivors.length.toLocaleString()}\`\n<:nezuko_gun:995045376551833611> Caught: \`${caught.length.toLocaleString()}\`\n<:ghost:978412292012146688> Died: \`${dead.length.toLocaleString()}\``
                        );

                    if (survivors.length <= 0) {
                        economyData.bank.coins += amount;

                        resultembed.setDescription(
                            `All the users that attended to this event either failed or died, therefore <@${
                                interaction.user.id
                            }> magically burned all the coins!\nCoins: \`❀ ${amount.toLocaleString()}\`\n\`just joking :)\``
                        );
                    }

                    await EconomyModel.findOneAndUpdate(
                        { userId: interaction.user.id },
                        economyData
                    );

                    interaction.channel.send({ embeds: [resultembed] });
                }

                setProcessingLock(interaction.user.id, false);
                await eventheistlobby_msg.edit({
                    embeds: [eventheist_embed],
                    components: [erow],
                });
            });
        }

        let confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle("PRIMARY");

        let cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("DANGER");

        let row = new ActionRowBuilder().addComponents(confirm, cancel);

        const eventheist_embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Action Confirmation - Event-heist`)
            .setDescription(
                `<@${
                    interaction.user.id
                }>, are you sure you want to host an event-heist of \`❀ ${amount.toLocaleString()}\`?`
            );

        await interaction.reply({
            embeds: [eventheist_embed],
            components: [row],
        });

        const eventheist_msg = await interaction.fetchReply();

        const collector = eventheist_msg.createMessageComponentCollector({
            time: 20 * 1000,
        });

        setProcessingLock(interaction.user.id, true);
        collector.on("collect", async (button) => {
            if (button.user.id != interaction.user.id) {
                return button.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            button.deferUpdate();

            if (button.customId === "confirm") {
                endinteraction = true;
                setEventCooldown(interaction.user.id, "eventheist", 3600);

                eventheist_embed
                    .setColor(`#95ff87`)
                    .setTitle(`Action Confirmed - Event-heist`)
                    .setDescription(
                        `<@${
                            interaction.user.id
                        }>, alrighty, lets get this started! The entrance to your event-heist will appear soon!\n\nEvent Heist Amount: \`❀ ${amount.toLocaleString()}\``
                    );

                eventheist();

                confirm.setDisabled().setStyle("SUCCESS");
                cancel.setDisabled().setStyle("SECONDARY");

                eventheist_msg.edit({
                    embeds: [eventheist_embed],
                    components: [row],
                });
            } else if (button.customId === "cancel") {
                endinteraction = true;
                setProcessingLock(interaction.user.id, false);

                eventheist_embed
                    .setColor(`#ff8f87`)
                    .setTitle(`Action Cancelled - Event-heist`)
                    .setDescription(
                        `<@${
                            interaction.user.id
                        }>, are you sure you want to host an event-heist of \`❀ ${amount.toLocaleString()}\`?`
                    );

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled();

                eventheist_msg.edit({
                    embeds: [eventheist_embed],
                    components: [row],
                });
            }
        });

        collector.on("end", async (collected) => {
            if (endinteraction === true) {
            } else {
                setProcessingLock(interaction.user.id, false);

                eventheist_embed
                    .setColor(`#ff8f87`)
                    .setTitle(`Action Timed Out - Event-heist`)
                    .setDescription(
                        `<@${
                            interaction.user.id
                        }>, are you sure you want to host an event-heist of \`❀ ${amount.toLocaleString()}\`?`
                    );

                confirm.setDisabled().setStyle("SECONDARY");
                cancel.setDisabled().setStyle("SECONDARY");

                eventheist_msg.edit({
                    embeds: [eventheist_embed],
                    components: [row],
                });
            }
        });
        return setCooldown(interaction, "eventheist", 25, economyData);
    },
};
