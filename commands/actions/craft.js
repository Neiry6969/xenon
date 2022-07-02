const {
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
    MessageEmbed,
} = require("discord.js");
const fs = require("fs");
const { SlashCommandBuilder } = require("@discordjs/builders");

const economyModel = require("../../models/economySchema");
const inventoryModel = require("../../models/inventorySchema");
const allItems = require("../..//data/all_items");
const letternumbers = require("../../reference/letternumber");
const interactionproccesses = require("../../interactionproccesses.json");

const jsoncooldowns = require("../../cooldowns.json");
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
        .setName("craft")
        .setDescription("Craft craftable items."),

    cdmsg: "You were already at your crafting table, stop trying to break me!",
    cooldown: 10,
    async execute(
        interaction,
        client,
        userData,
        inventoryData,
        statsData,
        profileData,
        itemData
    ) {
        const allItems = itemData;

        let cooldown = 10;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].craft = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );

        const craft_msg_embed = new MessageEmbed()
            .setColor("#000000")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setThumbnail(
                "https://media.discordapp.net/attachments/965028200390475858/992588652465111120/image-removebg-preview_17.png"
            )
            .setTitle("Crafting Table")
            .setDescription(
                `Finding the crafting book, hm I wonder where I left it... <a:loading:987196796549861376>`
            );

        await interaction.reply({ embeds: [craft_msg_embed] });
        const craft_msg = await interaction.fetchReply();

        try {
            const craftingtable_map = itemData
                .map((v) => {
                    const ifcraftabe =
                        !!v.craftitems.length > 0 || v.crafttools.length > 0;

                    if (ifcraftabe === true) {
                        return `${v.icon} **${v.name}**\nItem ID: \`${v.item}\``;
                    } else {
                        return;
                    }
                })
                .filter(Boolean);
            const craftingtable_mapData = itemData
                .map((v) => {
                    const ifcraftabe =
                        !!v.craftitems.length > 0 || v.crafttools.length > 0;

                    if (ifcraftabe === true) {
                        return v;
                    } else {
                        return;
                    }
                })
                .filter(Boolean);

            const craftlength = craftingtable_map.length;
            const itemsperpage = 3;

            let lastpage;
            if (craftlength % itemsperpage > 0) {
                lastpage = Math.floor(craftlength / itemsperpage) + 1;
            } else {
                lastpage = craftlength / itemsperpage;
            }

            let page = 1;
            let display_start = (page - 1) * itemsperpage;
            let display_end = page * itemsperpage;

            let pageslice = craftingtable_mapData.slice(
                display_start,
                display_end
            );
            let mappedCraftOptions = pageslice.map((v) => {
                const item = allItems.find(
                    (val) => val.item.toLowerCase() === v.item
                );
                return {
                    label: item.name,
                    value: item.item,
                    emoji: item.icon,
                };
            });

            let pagebutton = new MessageButton()
                .setCustomId("page")
                .setLabel(`${page}/${lastpage}`)
                .setStyle("SECONDARY")
                .setDisabled();
            let leftfarbutton = new MessageButton()
                .setCustomId("leftfar")
                .setLabel("<<")
                .setStyle("PRIMARY")
                .setDisabled();

            let leftbutton = new MessageButton()
                .setCustomId("left")
                .setLabel("<")
                .setStyle("PRIMARY")
                .setDisabled();

            let rightfarbutton = new MessageButton()
                .setCustomId("rightfar")
                .setLabel(">>")
                .setStyle("PRIMARY");

            let rightbutton = new MessageButton()
                .setCustomId("right")
                .setLabel(">")
                .setStyle("PRIMARY");
            let craftmenu = new MessageSelectMenu()
                .setCustomId("dropmenu")
                .setMinValues(0)
                .setMaxValues(1)
                // .setDisabled(true)
                .addOptions(mappedCraftOptions);

            let endinteractionbutton = new MessageButton()
                .setCustomId("endinteraction")
                .setLabel("End Interaction")
                .setStyle("SECONDARY");

            let row = new MessageActionRow().addComponents(
                leftfarbutton,
                leftbutton,
                pagebutton,
                rightbutton,
                rightfarbutton
            );
            let row2 = new MessageActionRow().addComponents(craftmenu);
            let row3 = new MessageActionRow().addComponents(
                endinteractionbutton
            );

            craft_msg_embed.setDescription(
                `${craftingtable_map
                    .slice(display_start, display_end)
                    .join("\n\n")}`
            );

            await craft_msg.edit({
                embeds: [craft_msg_embed],
                components: [row2, row, row3],
            });

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
            const collector = craft_msg.createMessageComponentCollector({
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
                if (button.customId === "endinteraction") {
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
                    craft_msg.components[0].components.forEach((c) => {
                        c.setDisabled();
                    });
                    craft_msg.components[1].components.forEach((c) => {
                        c.setDisabled();
                    });

                    craft_msg.components[2].components.forEach((c) => {
                        c.setDisabled();
                    });

                    return craft_msg.edit({
                        components: craft_msg.components,
                    });
                } else if (button.customId === "right") {
                    page = page + 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    pageslice = craftingtable_mapData.slice(
                        display_start,
                        display_end
                    );
                    mappedCraftOptions = pageslice.map((v) => {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === v.item
                        );
                        return {
                            label: item.name,
                            value: item.item,
                            emoji: item.icon,
                        };
                    });

                    craft_msg_embed.setDescription(
                        `${craftingtable_map
                            .slice(display_start, display_end)
                            .join("\n\n")}`
                    );
                    craftmenu.setOptions(mappedCraftOptions);

                    if (page === lastpage) {
                        leftbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightbutton.setDisabled();
                        rightfarbutton.setDisabled();
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    }

                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (button.customId === "rightfar") {
                    page = lastpage;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    pageslice = craftingtable_mapData.slice(
                        display_start,
                        display_end
                    );
                    mappedCraftOptions = pageslice.map((v) => {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === v.item
                        );
                        return {
                            label: item.name,
                            value: item.item,
                            emoji: item.icon,
                        };
                    });

                    craft_msg_embed.setDescription(
                        `${craftingtable_map
                            .slice(display_start, display_end)
                            .join("\n\n")}`
                    );
                    craftmenu.setOptions(mappedCraftOptions);

                    if (page === lastpage) {
                        leftbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightbutton.setDisabled();
                        rightfarbutton.setDisabled();
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    }
                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (button.customId === "left") {
                    page = page - 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    pageslice = craftingtable_mapData.slice(
                        display_start,
                        display_end
                    );
                    mappedCraftOptions = pageslice.map((v) => {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === v.item
                        );
                        return {
                            label: item.name,
                            value: item.item,
                            emoji: item.icon,
                        };
                    });

                    craft_msg_embed.setDescription(
                        `${craftingtable_map
                            .slice(display_start, display_end)
                            .join("\n\n")}`
                    );
                    craftmenu.setOptions(mappedCraftOptions);

                    if (page === 1) {
                        leftbutton.setDisabled();
                        leftfarbutton.setDisabled();
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    }
                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                } else if (button.customId === "leftfar") {
                    page = 1;
                    display_start = (page - 1) * itemsperpage;
                    display_end = page * itemsperpage;
                    pagebutton.setLabel(`${page}/${lastpage}`);

                    pageslice = craftingtable_mapData.slice(
                        display_start,
                        display_end
                    );
                    mappedCraftOptions = pageslice.map((v) => {
                        const item = allItems.find(
                            (val) => val.item.toLowerCase() === v.item
                        );
                        return {
                            label: item.name,
                            value: item.item,
                            emoji: item.icon,
                        };
                    });

                    craft_msg_embed.setDescription(
                        `${craftingtable_map
                            .slice(display_start, display_end)
                            .join("\n\n")}`
                    );
                    craftmenu.setOptions(mappedCraftOptions);

                    if (page === 1) {
                        leftbutton.setDisabled();
                        leftfarbutton.setDisabled();
                        rightbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    } else {
                        leftbutton.setDisabled(false);
                        rightbutton.setDisabled(false);
                        leftfarbutton.setDisabled(false);
                        rightfarbutton.setDisabled(false);
                    }
                    await craft_msg.edit({
                        embeds: [craft_msg_embed],
                        components: [row2, row, row3],
                    });
                }
            });

            collector.on("end", (collected) => {
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
                craft_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                craft_msg.components[1].components.forEach((c) => {
                    c.setDisabled();
                });
                craft_msg.components[2].components.forEach((c) => {
                    c.setDisabled();
                });
                craft_msg.edit({
                    components: craft_msg.components,
                });
            });
        } catch (error) {
            craft_msg_embed
                .setDescription(
                    `There was an unexpected error that occurred, error has been sent to developers.`
                )
                .setColor("RED");

            console.log(error);
            return await craft_msg.edit({
                embeds: [craft_msg_embed],
            });
        }

        // const expectedsyntax = `\`xe craft [item] [amount]\``;
        // let amount = args[1]?.toLowerCase();
        // const getitem = args[0]?.toLowerCase();
        // const iftable = args[0]?.toLowerCase();
        // if (iftable === "table" || iftable === "list") {
        //     const craftablelist = allItems
        //         .map((value) => {
        //             if (!value.craftitems && !value.crafttools) {
        //                 return;
        //             } else {
        //                 return `${value.icon} **${value.name}**\nItem ID: \`${value.item}\``;
        //             }
        //         })
        //         .filter(Boolean)
        //         .join("\n\n");
        //     const embed = {
        //         color: "RANDOM",
        //         title: `Craftable Items`,
        //         description: `${craftablelist}`,
        //         footer: {
        //             text: `xe craft [item] [amount]`,
        //         },
        //     };
        //     return message.reply({ embeds: [embed] });
        // } else if (!getitem) {
        //     const craftablelist = allItems
        //         .map((value) => {
        //             if (!value.craftitems && !value.crafttools) {
        //                 return;
        //             } else {
        //                 return `${value.icon} **${value.name}**\nItem ID: \`${value.item}\``;
        //             }
        //         })
        //         .filter(Boolean)
        //         .join("\n\n");
        //     const embed = {
        //         color: "RANDOM",
        //         title: `Craftable Items`,
        //         description: `${craftablelist}`,
        //         footer: {
        //             text: `xe craft [item] [amount]`,
        //         },
        //     };
        //     return message.reply({ embeds: [embed] });
        // } else {
        //     if (!getitem) {
        //         const embed = {
        //             color: "#FF0000",
        //             title: `Action error`,
        //             description: `Specify the item to craft.\n**Expected Syntax:** ${expectedsyntax}`,
        //         };
        //         return message.reply({ embeds: [embed] });
        //     }
        //     if (getitem.length < 3) {
        //         return message.reply(
        //             `\`${getitem}\` is not even an existing item.`
        //         );
        //     } else if (getitem.length > 250) {
        //         return message.reply(
        //             `Couldn't find that item because you typed passed the limit of 250 characters.`
        //         );
        //     }
        //     const itemssearch = allItems.filter((value) => {
        //         return value.item.includes(getitem);
        //     });
        //     const item = itemssearch[0];
        //     if (item === undefined) {
        //         const embed = {
        //             color: "#FF0000",
        //             title: `Action error`,
        //             description: `\`${getitem}\` is not existent item.\n**Expected Syntax:** ${expectedsyntax}`,
        //         };
        //         return message.reply({ embeds: [embed] });
        //     }
        //     if (!item.craftitems && !item.crafttools) {
        //         const embed = {
        //             color: "#FF0000",
        //             title: `Action error`,
        //             description: `This item is not craftable\n**Item:** ${item.icon} \`${item.item}\`\n**Item Type:** \`${item.type}\`\n\nTo see craftable items run: \`xe craft table\``,
        //         };
        //         return message.reply({ embeds: [embed] });
        //     }
        //     const params = {
        //         userId: message.author.id,
        //     };
        //     function ifhasamountitem(reqm, hasa) {
        //         if (hasa >= reqm) {
        //             return true;
        //         } else {
        //             return false;
        //         }
        //     }
        //     let missingitems = false;
        //     let crafttools;
        //     if (item.crafttools) {
        //         crafttools = item.crafttools
        //             .map((value) => {
        //                 const toolitem = allItems.find(
        //                     ({ item }) => item === value.i
        //                 );
        //                 let hasamount = inventoryData.inventory[toolitem.item];
        //                 if (!inventoryData.inventory[toolitem.item]) {
        //                     hasamount = 0;
        //                 }
        //                 if (ifhasamountitem(value.q, hasamount) === false) {
        //                     missingitems = true;
        //                 }
        //                 let message = `\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\` ${
        //                     toolitem.icon
        //                 } \`${toolitem.item}\``;
        //                 if (ifhasamountitem(value.q, hasamount) === true) {
        //                     message = `[\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
        //                         toolitem.icon
        //                     } \`${toolitem.item}\``;
        //                 }
        //                 return message;
        //             })
        //             .join("\n");
        //     }
        //     let craftitems;
        //     if (item.craftitems) {
        //         craftitems = item.craftitems
        //             .map((value) => {
        //                 const craftitem = allItems.find(
        //                     ({ item }) => item === value.i
        //                 );
        //                 let hasamount = inventoryData.inventory[craftitem.item];
        //                 if (!inventoryData.inventory[craftitem.item]) {
        //                     hasamount = 0;
        //                 }
        //                 if (ifhasamountitem(value.q, hasamount) === false) {
        //                     missingitems = true;
        //                 }
        //                 let message = `\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\` ${
        //                     craftitem.icon
        //                 } \`${craftitem.item}\``;
        //                 if (ifhasamountitem(value.q, hasamount) === true) {
        //                     message = `[\`${hasamount.toLocaleString()}/${value.q.toLocaleString()}\`](https://www.google.com/) ${
        //                         craftitem.icon
        //                     } \`${craftitem.item}\``;
        //                 }
        //                 return message;
        //             })
        //             .join("\n");
        //     }
        //     if (missingitems === true) {
        //         const embed = {
        //             color: "#FF0000",
        //             title: `Craft error`,
        //             description: `You do not meet all of the requirements to craft that item\nItem: ${item.icon} \`${item.item}\`\nItem Type: \`${item.type}\`\n\n **Craft requirements:**\nCraft Tools:\n${crafttools}\n\nCraft Items:\n${craftitems}`,
        //         };
        //         return message.reply({ embeds: [embed] });
        //     }
        //     const craftitemamountmap = item.craftitems.map((value) => {
        //         const craftitem = allItems.find(({ item }) => item === value.i);
        //         return Math.floor(
        //             inventoryData.inventory[craftitem.item] / value.q
        //         );
        //     });
        //     const maxcraftamount = Math.min(...craftitemamountmap);
        //     if (amount === "max" || amount === "all") {
        //         amount = maxcraftamount;
        //     } else if (amount === "half") {
        //         amount = Math.floor(maxcraftamount / 2) + 1;
        //     } else if (!amount) {
        //         amount = 1;
        //     } else if (
        //         letternumbers.find((val) => val.letter === amount.slice(-1))
        //     ) {
        //         if (parseInt(amount.slice(0, -1))) {
        //             const number = parseFloat(amount.slice(0, -1));
        //             const numbermulti = letternumbers.find(
        //                 (val) => val.letter === amount.slice(-1)
        //             ).number;
        //             amount = number * numbermulti;
        //         } else {
        //             amount = null;
        //         }
        //     } else {
        //         amount = parseInt(amount);
        //     }
        //     amount = parseInt(amount);
        //     if (!amount || amount < 0) {
        //         return message.reply(
        //             "You can only craft a whole number of items."
        //         );
        //     } else if (amount === 0) {
        //         return message.reply(
        //             "So you want to craft nothing, why bother?"
        //         );
        //     } else if (maxcraftamount < amount) {
        //         const embed = {
        //             color: "#FF0000",
        //             title: `Craft error`,
        //             description: `You don't have enough of the required items to craft that much of that item.\n\n**Item:** ${
        //                 item.icon
        //             } \`${
        //                 item.item
        //             }\`\n**Max Able To Be Crafted:** \`${maxcraftamount.toLocaleString()}\``,
        //             timestamp: new Date(),
        //         };
        //         return message.reply({ embeds: [embed] });
        //     }
        //     const confirmationlist = item.craftitems
        //         .map((value) => {
        //             const craftitem = allItems.find(
        //                 ({ item }) => item === value.i
        //             );
        //             return `\`${(value.q * amount).toLocaleString()}x\` ${
        //                 craftitem.icon
        //             } \`${craftitem.item}\``;
        //         })
        //         .join("\n");
        //     interactionproccesses[message.author.id] = {
        //         interaction: true,
        //         proccessingcoins: true,
        //     };
        //     fs.writeFile(
        //         "./interactionproccesses.json",
        //         JSON.stringify(interactionproccesses),
        //         (err) => {
        //             if (err) {
        //                 console.log(err);
        //             }
        //         }
        //     );
        //     item.craftitems.forEach(async (value) => {
        //         inventoryData.inventory[value.i] =
        //             inventoryData.inventory[value.i] - value.q * amount;
        //     });
        //     const hasItem = Object.keys(inventoryData.inventory).includes(
        //         item.item
        //     );
        //     if (!hasItem) {
        //         inventoryData.inventory[item.item] = amount;
        //     } else {
        //         inventoryData.inventory[item.item] =
        //             inventoryData.inventory[item.item] + amount;
        //     }
        //     await inventoryModel.updateOne(params, inventoryData);
        //     let confirm = new MessageButton()
        //         .setCustomId("confirm")
        //         .setLabel("Confirm")
        //         .setStyle("PRIMARY");
        //     let cancel = new MessageButton()
        //         .setCustomId("cancel")
        //         .setLabel("Cancel")
        //         .setStyle("DANGER");
        //     let row = new MessageActionRow().addComponents(confirm, cancel);
        //     const embed = {
        //         color: "RANDOM",
        //         title: `Confirm craft`,
        //         description: `<@${
        //             message.author.id
        //         }>, are you sure you want to craft ${item.icon} \`${
        //             item.item
        //         }\` x\`${amount.toLocaleString()}\`\n\n**Here are the items that will be used for this craft:**\n${confirmationlist}`,
        //         timestamp: new Date(),
        //     };
        //     const craft_msg = await message.reply({
        //         embeds: [embed],
        //         components: [row],
        //     });
        //     const collector = craft_msg.createMessageComponentCollector({
        //         time: 20 * 1000,
        //     });
        //     collector.on("collect", async (button) => {
        //         if (button.user.id != message.author.id) {
        //             return button.reply({
        //                 content: "This is not for you.",
        //                 ephemeral: true,
        //             });
        //         }
        //         button.deferUpdate();
        //         if (button.customId === "confirm") {
        //             interactionproccesses[message.author.id] = {
        //                 interaction: false,
        //                 proccessingcoins: false,
        //             };
        //             fs.writeFile(
        //                 "./interactionproccesses.json",
        //                 JSON.stringify(interactionproccesses),
        //                 (err) => {
        //                     if (err) {
        //                         console.log(err);
        //                     }
        //                 }
        //             );
        //             await inventoryModel.updateOne(params, inventoryData);
        //             confirm.setDisabled().setStyle("SUCCESS");
        //             cancel.setDisabled().setStyle("SECONDARY");
        //             return craft_msg.edit({
        //                 embeds: [embed],
        //                 components: [row],
        //             });
        //         } else if (button.customId === "cancel") {
        //             interactionproccesses[message.author.id] = {
        //                 interaction: false,
        //                 proccessingcoins: false,
        //             };
        //             fs.writeFile(
        //                 "./interactionproccesses.json",
        //                 JSON.stringify(interactionproccesses),
        //                 (err) => {
        //                     if (err) {
        //                         console.log(err);
        //                     }
        //                 }
        //             );
        //             item.craftitems.forEach(async (value) => {
        //                 inventoryData.inventory[value.i] =
        //                     inventoryData.inventory[value.i] + value.q * amount;
        //             });
        //             const hasItem = Object.keys(
        //                 inventoryData.inventory
        //             ).includes(item.item);
        //             if (!hasItem) {
        //                 inventoryData.inventory[item.item] = 0;
        //             } else {
        //                 inventoryData.inventory[item.item] =
        //                     inventoryData.inventory[item.item] - amount;
        //             }
        //             await inventoryModel.updateOne(params, inventoryData);
        //             const embed = {
        //                 color: "#FF0000",
        //                 title: `Craft cancelled`,
        //                 description: `<@${
        //                     message.author.id
        //                 }>, are you sure you want to craft ${item.icon} \`${
        //                     item.item
        //                 }\` x\`${amount.toLocaleString()}\`\n\n**Here are the items that will be used for this craft:**\n${confirmationlist}\nI guess not. Come back later if you change your mind.`,
        //                 timestamp: new Date(),
        //             };
        //             confirm.setDisabled().setStyle("SECONDARY");
        //             cancel.setDisabled();
        //             return craft_msg.edit({
        //                 embeds: [embed],
        //                 components: [row],
        //             });
        //         }
        //     });
        //     collector.on("end", async (collected) => {
        //         if (collected.size > 0) {
        //         } else {
        //             interactionproccesses[message.author.id] = {
        //                 interaction: false,
        //                 proccessingcoins: false,
        //             };
        //             fs.writeFile(
        //                 "./interactionproccesses.json",
        //                 JSON.stringify(interactionproccesses),
        //                 (err) => {
        //                     if (err) {
        //                         console.log(err);
        //                     }
        //                 }
        //             );
        //             item.craftitems.forEach(async (value) => {
        //                 inventoryData.inventory[value.i] =
        //                     inventoryData.inventory[value.i] + value.q * amount;
        //             });
        //             const hasItem = Object.keys(
        //                 inventoryData.inventory
        //             ).includes(item.item);
        //             if (!hasItem) {
        //                 inventoryData.inventory[item.item] = 0;
        //             } else {
        //                 inventoryData.inventory[item.item] =
        //                     inventoryData.inventory[item.item] - amount;
        //             }
        //             await inventoryModel.updateOne(params, inventoryData);
        //             const embed = {
        //                 color: "#FF0000",
        //                 title: `Craft timeout`,
        //                 description: `<@${
        //                     message.author.id
        //                 }>, are you sure you want to craft ${item.icon} \`${
        //                     item.item
        //                 }\` x\`${amount.toLocaleString()}\`\n\n**Here are the items that will be used for this craft:**\n${confirmationlist}\nI guess not. Come back later if you change your mind.`,
        //                 timestamp: new Date(),
        //             };
        //             confirm.setDisabled().setStyle("SECONDARY");
        //             cancel.setDisabled().setStyle("SECONDARY");
        //             return craft_msg.edit({
        //                 embeds: [embed],
        //                 components: [row],
        //             });
        //         }
        //     });
        //     let cooldown = 10;
        //     if (
        //         message.guild.id === "852261411136733195" ||
        //         message.guild.id === "978479705906892830" ||
        //         userData.premium.rank >= 1
        //     ) {
        //         cooldown = premiumcooldowncalc(cooldown);
        //     }
        //     const cooldown_amount = cooldown * 1000;
        //     const timpstamp = Date.now() + cooldown_amount;
        //     jsoncooldowns[message.author.id].craft = timpstamp;
        //     fs.writeFile(
        //         "./cooldowns.json",
        //         JSON.stringify(jsoncooldowns),
        //         (err) => {
        //             if (err) {
        //                 console.log(err);
        //             }
        //         }
        //     );
        // }
    },
};
