const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Message,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const {
    fetchInventoryData,
    fetchEconomyData,
    removeCoins,
    addCoins,
    addItem,
} = require("../../utils/currencyfunctions");
const {
    fetchItemData,
    fetchAllitemsData,
} = require("../../utils/itemfunctions");
const { errorReply } = require("../../utils/errorfunctions");
const { setCooldown, setProcessingLock } = require("../../utils/mainfunctions");
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

        let endinteraction = false;
        let error_message;
        let amount = options.amount?.toLowerCase();
        const minreqcoins = 500000;
        const minjoincoins = 5000;

        if (economyData.bank.coins <= 0) {
            if (economyData.wallet <= 0) {
                error_message = `You have no coins in your bank to host an event-heist.\n\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``;
                return errorReply(interaction, error_message);
            } else {
                error_message = `You have no coins in your bank to host an event-heist, maybe deposit some?\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``;
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
                error_message = `You don't have that amount coins in your bank to host an event-heist, maybe deposit some?\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``;
                return errorReply(interaction, error_message);
            } else {
                error_message = `You don't have that amount coins in your bank or your wallet to host an event-heist.\nMinimum: \`❀ ${minreqcoins.toLocaleString()}\``;
                return errorReply(interaction, error_message);
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

                    if (userEconomy.wallet < minjoincoins) {
                        error_message = `You need at least \`❀ ${minjoincoins.toLocaleString()}\` in your wallet to join this event-heist!`;
                        return errorReply(button, error_message);
                    } else if (eventheist_arry.includes(button.user.id)) {
                        error_message = `You already joined this heist bruh!`;
                        return errorReply(button, error_message);
                    } else {
                        eventheist_arry.push(button.user.id);
                        await removeCoins(button.user.id, minjoincoins);

                        eventheistjoinedno = eventheist_arry.length;

                        eventheistjoined.setLabel(
                            `Users: ${eventheistjoinedno.toLocaleString()}`
                        );
                        const joinedembed = new MessageEmbed()
                            .setColor(`#95ff87`)
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
                setProcessingLock(interaction, false);

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
                        .setColor(theme.embed.color)

                        .setTitle("<:nezuko_yas:995045946087968850> Survivors")
                        .setDescription(
                            `Showing results~ <a:loading:987196796549861376>`
                        );
                    const caughtembed = new MessageEmbed()
                        .setColor(theme.embed.color)

                        .setTitle("<:nezuko_gun:995045376551833611> Caught")
                        .setDescription(
                            `Showing results~ <a:loading:987196796549861376>`
                        );
                    const deadembed = new MessageEmbed()
                        .setColor(theme.embed.color)

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
                            "scammed a police into letting them out of the bank",
                            "snuck out the back door",
                            "sunck out with the hostages",
                            "ate something that made them invisible",
                            "was just lucky",
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

                            const fetchUserData = await fetchEconomyData(
                                user.id
                            );
                            const fetctInvData = await fetchInventoryData(
                                user.id
                            );

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

                    economyData.bank.coins -= amount;

                    const resultembed = new MessageEmbed()
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

                setProcessingLock(interaction, false);
                await eventheistlobby_msg.edit({
                    embeds: [eventheist_embed],
                    components: [erow],
                });
            });
        }

        let confirm = new MessageButton()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle("PRIMARY");

        let cancel = new MessageButton()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("DANGER");

        let row = new MessageActionRow().addComponents(confirm, cancel);

        const eventheist_embed = new MessageEmbed()
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

        setProcessingLock(interaction, true);
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
                setProcessingLock(interaction, false);

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
                if (confirmed === true) {
                    setProcessingLock(interaction, false);
                }

                eventheist_embed
                    .setColor(`#ff8f87`)
                    .setTitle(`Action Cancelled - Event-heist`)
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
