const inventoryModel = require("../../models/inventorySchema");
const dropModel = require("../../models/dropSchema");
const economyModel = require("../../models/economySchema");
const itemModel = require("../../models//itemSchema");

const jsoncooldowns = require("../../cooldowns.json");
const interactionproccesses = require("../../interactionproccesses.json");
const fs = require("fs");
const {
    MessageEmbed,
    MessageSelectMenu,
    MessageActionRow,
    MessageButton,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
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
        .setName("drops")
        .setDescription("Limited drop items."),
    cooldown: 5,
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

        const params = {
            userId: interaction.user.id,
        };

        let cooldown = 5;
        if (
            interaction.guild.id === "852261411136733195" ||
            interaction.guild.id === "978479705906892830" ||
            userData.premium.rank >= 1
        ) {
            cooldown = premiumcooldowncalc(cooldown);
        }
        const cooldown_amount = cooldown * 1000;
        const timpstamp = Date.now() + cooldown_amount;
        jsoncooldowns[interaction.user.id].drop = timpstamp;
        fs.writeFile(
            "./cooldowns.json",
            JSON.stringify(jsoncooldowns),
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
        const errorembed = new MessageEmbed().setColor("#FF5C5C");

        let drops = await dropModel.find({});

        if (drops.length === 0) {
            errorembed.setDescription("There are no drops currently.");
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        drops.forEach(async (v) => {
            const dropendtime = new Date(v.dropendtime);
            const datenow = new Date();
            const timeleft = dropendtime - datenow / 1000;

            if (timeleft <= 0) {
                const fetchitem = await itemModel.findOne({ item: v.item });
                let drophistory = fetchitem.drophistory;

                if (!drophistory) {
                    drophistory = [];
                }

                const dropdata = {
                    amountbought: v.amountbought,
                    maxdrop: v.maxdrop,
                    dropstart: v.dropstarttime,
                    dropend: v.dropendtime,
                };

                drophistory.push(dropdata);
                fetchitem.drophistory = drophistory;

                await itemModel.findOneAndUpdate({ item: v.item }, fetchitem);
                await dropModel.findOneAndDelete({ _id: v._id });
            } else {
                return;
            }
        });

        const mappedData = drops
            .map((v) => {
                const dropendtime = new Date(v.dropendtime);
                const datenow = new Date();
                const timeleft = dropendtime - datenow / 1000;
                
                let amountbought_user;
                
                if(v.usersbuyobject[interaction.user.id]) {
                    amountbought_user = v.usersbuyobject[interaction.user.id]
                } else {
                    amountbought_user = 0
                }

                if (timeleft <= 0) {
                    return;
                } else {
                    const amountleft = v.maxdrop - v.amountbought;
                    const item = allItems.find(
                        (val) => val.item.toLowerCase() === v.item
                    );
                    return `${item.icon} **${item.name}**\nID: \`${
                        item.item
                    }\`\nDrop Ending At: <t:${v.dropendtime}:f> <t:${
                        v.dropendtime
                    }:R>\nPrice: \`❀ ${v.price.toLocaleString()}\`\nAmount Left: \`${amountleft.toLocaleString()}/${v.maxdrop.toLocaleString()}\`\nMax Per User: \`${amountbought_user.toLocaleString()}/${v.maxperuser.toLocaleString()}\``;
                }
            })
            .filter(Boolean)
            .join("\n\n");

        const mappedDropOptions = drops.map((v) => {
            const item = allItems.find(
                (val) => val.item.toLowerCase() === v.item
            );
            return {
                label: item.name,
                value: item.item,
                emoji: item.icon,
            };
        });

        let endinteractionbutton = new MessageButton()
            .setCustomId("endinteraction")
            .setLabel("End Interaction")
            .setStyle("SECONDARY");

        let dropmenu = new MessageSelectMenu()
            .setCustomId("dropmenu")
            .setMinValues(0)
            .setMaxValues(1)
            .setPlaceholder("Select a drop to view")
            .addOptions(mappedDropOptions);

        let buydropbutton = new MessageButton()
            .setCustomId("buydropbutton")
            .setLabel("Buy Drop")
            .setStyle("PRIMARY");
        let addbutton = new MessageButton()
            .setCustomId("addbutton")
            .setLabel("+")
            .setStyle("SECONDARY");

        let minusbutton = new MessageButton()
            .setCustomId("minusbutton")
            .setLabel("-")
            .setStyle("SECONDARY");
        let backbutton = new MessageButton()
            .setCustomId("backbutton")
            .setLabel("Back")
            .setStyle("SECONDARY");

        let row = new MessageActionRow().setComponents(dropmenu);
        let row2 = new MessageActionRow().setComponents(endinteractionbutton);

        const drops_embed = new MessageEmbed()
            .setColor("RANDOM")
            .setDescription(mappedData);

        await interaction.reply({
            embeds: [drops_embed],
            components: [row, row2],
        });

        const drop_msg = await interaction.fetchReply();

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

        const collector = await drop_msg.createMessageComponentCollector({
            idle: 30 * 1000,
        });

        let buycount = 1;
        let dropinfo_map;
        let selecteddrop;
        let fecthusereconomy = await economyModel.findOne({
            userId: interaction.user.id,
        });
        let userwallet = fecthusereconomy.wallet;
        let amountcanbuy;
        let totalprice_amountcanbuy;
        let extrastring;

        collector.on("collect", async (i) => {
            if (i.user.id != interaction.user.id) {
                return i.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            i.deferUpdate();

            if (i.customId === "endinteraction") {
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
                drop_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                drop_msg.components[1].components.forEach((c) => {
                    c.setDisabled();
                });

                return drop_msg.edit({
                    components: drop_msg.components,
                });
            } else if (i.customId === "backbutton") {
                let buycount = 1;
                row.setComponents(dropmenu);
                row2.setComponents(endinteractionbutton);
                drops_embed.setColor("RANDOM").setDescription(mappedData);

                drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
            } else if (i.customId === "dropmenu") {
                selecteddrop = i.values[0];
                const dropinfo = await dropModel.findOne({
                    item: selecteddrop,
                });

                const dropitem = allItems.find(
                    (val) => val.item.toLowerCase() === dropinfo.item
                );

                const amountleft = dropinfo.maxdrop - dropinfo.amountbought;

                let userbought = dropinfo.usersbuyobject[interaction.user.id];
                const amountleftuser = dropinfo.maxperuser - userbought;
                if (!dropinfo.usersbuyobject[interaction.user.id]) {
                    userbought = 0;
                    dropinfo.usersbuyobject[interaction.user.id] = 0;

                    await dropModel.findOneAndUpdate(
                        { item: selecteddrop },
                        dropinfo
                    );
                }

                fecthusereconomy = await economyModel.findOne({
                    userId: interaction.user.id,
                });
                userwallet = fecthusereconomy.wallet;
                amountcanbuy = Math.floor(userwallet / dropinfo.price);

                if (amountcanbuy > dropinfo.maxperuser) {
                    amountcanbuy = dropinfo.maxperuser;
                }

                if (amountcanbuy > amountleftuser) {
                    amountcanbuy = amountleftuser;
                }

                if (buycount > amountcanbuy) {
                    buycount = amountcanbuy;
                }

                totalprice_amountcanbuy = amountcanbuy * dropinfo.price;

                buydropbutton.setEmoji(dropitem.icon);

                if (amountcanbuy === 0) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    buycount = 0;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                }

                if (userbought === dropinfo.maxperuser) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (amountleft === 0) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    extrastring = `\n\`Too sad, the stocks ran out!\``;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                }

                if (buycount <= 1) {
                    buycount = 1;
                    minusbutton.setDisabled(true);
                } else {
                    minusbutton.setDisabled(false);
                }

                const leftforuser = dropinfo.maxperuser - userbought;
                if (amountcanbuy === 0) {
                    buycount = 0;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (amountcanbuy === buycount) {
                    addbutton.setDisabled(true);
                } else if (leftforuser <= buycount) {
                    buycount = leftforuser;
                    addbutton.setDisabled(true);
                } else if (amountleft <= buycount) {
                    buycount = amountleft;
                    addbutton.setDisabled(true);
                } else {
                    addbutton.setDisabled(false);
                }
                dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
                    dropitem.item
                }\`\nDrop Ending At: <t:${dropinfo.dropendtime}:f> <t:${
                    dropinfo.dropendtime
                }:R>\nPrice: \`❀ ${dropinfo.price.toLocaleString()}\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\nYour Wallet: \`❀ ${userwallet.toLocaleString()}\`\nAvaliable for you: \`❀ ${totalprice_amountcanbuy.toLocaleString()}\` (${amountcanbuy.toLocaleString()})\n**You want to buy:** \`${buycount.toLocaleString()}\` (\`❀ ${(
                    buycount * dropinfo.price
                ).toLocaleString()}\`)`;

                row.setComponents([buydropbutton, addbutton, minusbutton]);
                row2.setComponents([endinteractionbutton, backbutton]);

                drops_embed.setDescription(dropinfo_map);
                await drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
            } else if (i.customId === "addbutton") {
                buycount = buycount + 1;

                const dropinfo = await dropModel.findOne({
                    item: selecteddrop,
                });

                const dropitem = allItems.find(
                    (val) => val.item.toLowerCase() === dropinfo.item
                );

                const amountleft = dropinfo.maxdrop - dropinfo.amountbought;

                let userbought = dropinfo.usersbuyobject[interaction.user.id];
                const amountleftuser = dropinfo.maxperuser - userbought;

                if (!dropinfo.usersbuyobject[interaction.user.id]) {
                    userbought = 0;
                    dropinfo.usersbuyobject[interaction.user.id] = 0;

                    await dropModel.findOneAndUpdate(
                        { item: selecteddrop },
                        dropinfo
                    );
                }

                buydropbutton.setEmoji(dropitem.icon);

                fecthusereconomy = await economyModel.findOne({
                    userId: interaction.user.id,
                });
                userwallet = fecthusereconomy.wallet;
                amountcanbuy = Math.floor(userwallet / dropinfo.price);

                if (amountcanbuy > dropinfo.maxperuser) {
                    amountcanbuy = dropinfo.maxperuser;
                }

                if (amountcanbuy > amountleftuser) {
                    amountcanbuy = amountleftuser;
                }

                if (buycount > amountcanbuy) {
                    buycount = amountcanbuy;
                }

                totalprice_amountcanbuy = amountcanbuy * dropinfo.price;

                buydropbutton.setEmoji(dropitem.icon);

                if (amountcanbuy === 0) {
                    buycount = 0;
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                } else if (userbought === dropinfo.maxperuser) {
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (amountleft === 0) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    extrastring = `\n\`Too sad, the stocks ran out!\``;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (amountleft === 1) {
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (buycount <= 1) {
                    buycount = 1;
                    minusbutton.setDisabled(true);
                } else {
                    minusbutton.setDisabled(false);
                }

                const leftforuser = dropinfo.maxperuser - userbought;
                if (amountcanbuy === buycount) {
                    addbutton.setDisabled(true);
                } else if (leftforuser <= buycount) {
                    buycount = leftforuser;
                    addbutton.setDisabled(true);
                } else if (amountleft <= buycount) {
                    buycount = amountleft;
                    addbutton.setDisabled(true);
                } else {
                    addbutton.setDisabled(false);
                }
                dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
                    dropitem.item
                }\`\nDrop Ending At: <t:${dropinfo.dropendtime}:f> <t:${
                    dropinfo.dropendtime
                }:R>\nPrice: \`❀ ${dropinfo.price.toLocaleString()}\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\nYour Wallet: \`❀ ${userwallet.toLocaleString()}\`\nAvaliable for you: \`❀ ${totalprice_amountcanbuy.toLocaleString()}\` (${amountcanbuy.toLocaleString()})\n**You want to buy:** \`${buycount.toLocaleString()}\` (\`❀ ${(
                    buycount * dropinfo.price
                ).toLocaleString()}\`)`;

                row.setComponents([buydropbutton, addbutton, minusbutton]);
                row2.setComponents([endinteractionbutton, backbutton]);

                drops_embed.setDescription(dropinfo_map);
                await drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
            } else if (i.customId === "minusbutton") {
                buycount = buycount - 1;

                const dropinfo = await dropModel.findOne({
                    item: selecteddrop,
                });

                const dropitem = allItems.find(
                    (val) => val.item.toLowerCase() === dropinfo.item
                );

                const amountleft = dropinfo.maxdrop - dropinfo.amountbought;

                let userbought = dropinfo.usersbuyobject[interaction.user.id];
                const amountleftuser = dropinfo.maxperuser - userbought;

                if (!dropinfo.usersbuyobject[interaction.user.id]) {
                    userbought = 0;
                    dropinfo.usersbuyobject[interaction.user.id] = 0;

                    await dropModel.findOneAndUpdate(
                        { item: selecteddrop },
                        dropinfo
                    );
                }

                buydropbutton.setEmoji(dropitem.icon);

                fecthusereconomy = await economyModel.findOne({
                    userId: interaction.user.id,
                });
                userwallet = fecthusereconomy.wallet;
                amountcanbuy = Math.floor(userwallet / dropinfo.price);

                if (amountcanbuy > dropinfo.maxperuser) {
                    amountcanbuy = dropinfo.maxperuser;
                }

                if (amountcanbuy > amountleftuser) {
                    amountcanbuy = amountleftuser;
                }

                if (buycount > amountcanbuy) {
                    buycount = amountcanbuy;
                }

                totalprice_amountcanbuy = amountcanbuy * dropinfo.price;

                buydropbutton.setEmoji(dropitem.icon);

                if (amountcanbuy === 0) {
                    buycount = 0;
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (userbought === dropinfo.maxperuser) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (amountleft === 0) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    extrastring = `\n\`Too sad, the stocks ran out!\``;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                }

                if (amountleft === 1) {
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                }

                if (buycount <= 1) {
                    buycount = 1;
                    minusbutton.setDisabled(true);
                } else {
                    minusbutton.setDisabled(false);
                }

                const leftforuser = dropinfo.maxperuser - userbought;
                if (amountcanbuy === buycount) {
                    addbutton.setDisabled(true);
                } else if (leftforuser <= buycount) {
                    buycount = leftforuser;
                    addbutton.setDisabled(true);
                } else if (amountleft <= buycount) {
                    buycount = amountleft;
                    addbutton.setDisabled(true);
                } else {
                    addbutton.setDisabled(false);
                }

                dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
                    dropitem.item
                }\`\nDrop Ending At: <t:${dropinfo.dropendtime}:f> <t:${
                    dropinfo.dropendtime
                }:R>\nPrice: \`❀ ${dropinfo.price.toLocaleString()}\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\nYour Wallet: \`❀ ${userwallet.toLocaleString()}\`\nAvaliable for you: \`❀ ${totalprice_amountcanbuy.toLocaleString()}\` (${amountcanbuy.toLocaleString()})\n**You want to buy:** \`${buycount.toLocaleString()}\` (\`❀ ${(
                    buycount * dropinfo.price
                ).toLocaleString()}\`)`;

                row.setComponents([buydropbutton, addbutton, minusbutton]);
                row2.setComponents([endinteractionbutton, backbutton]);

                drops_embed.setDescription(dropinfo_map);
                await drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
            } else if (i.customId === "buydropbutton") {
                buydropbutton.setDisabled(true);
                addbutton.setDisabled(true);
                minusbutton.setDisabled(true);
                const dropinfo = await dropModel.findOne({
                    item: selecteddrop,
                });

                const dropitem = allItems.find(
                    (val) => val.item.toLowerCase() === dropinfo.item
                );

                const amountleft = dropinfo.maxdrop - dropinfo.amountbought;

                let userbought = dropinfo.usersbuyobject[interaction.user.id];
                const amountleftuser = dropinfo.maxperuser - userbought;

                if (!dropinfo.usersbuyobject[interaction.user.id]) {
                    userbought = 0;
                    dropinfo.usersbuyobject[interaction.user.id] = 0;

                    await dropModel.findOneAndUpdate(
                        { item: selecteddrop },
                        dropinfo
                    );
                }

                if (amountleft === 1) {
                    buycount = 1;
                }
                if (buycount > amountleft) {
                    buycount = amountleft;
                }

                if (amountcanbuy > amountleftuser) {
                    amountcanbuy = amountleftuser;
                }

                if (buycount > amountcanbuy) {
                    buycount = amountcanbuy;
                }

                buydropbutton.setEmoji(dropitem.icon);

                fecthusereconomy = await economyModel.findOne({
                    userId: interaction.user.id,
                });
                userwallet = fecthusereconomy.wallet;
                amountcanbuy = Math.floor(userwallet / dropinfo.price);

                if (amountcanbuy > dropinfo.maxperuser) {
                    amountcanbuy = dropinfo.maxperuser;
                }
                totalprice_amountcanbuy = amountcanbuy * dropinfo.price;

                buydropbutton.setEmoji(dropitem.icon);

                if (amountcanbuy === 0) {
                    buycount = 0;
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                    extrastring = `\n\`You couldn't even buy 1 of the stocks.\``;
                } else if (amountcanbuy === buycount) {
                }

                if (userbought === dropinfo.maxperuser || amountleft === 0) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    extrastring = `\n\`Too sad, the stocks ran out!\``;
                } else {
                    extrastring = `\n\`You sucessfully bought ${buycount.toLocaleString()} stocks! Good business!\`\n\`Total: ❀ ${(
                        buycount * dropinfo.price
                    ).toLocaleString()}\``;
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

                const totalprice = buycount * dropinfo.price;

                const hasItem = Object.keys(inventoryData.inventory).includes(
                    dropinfo.item
                );
                if (!hasItem) {
                    inventoryData.inventory[dropinfo.item] = buycount;
                } else {
                    inventoryData.inventory[dropinfo.item] =
                        inventoryData.inventory[dropinfo.item] + buycount;
                }
                userData.wallet = userData.wallet - totalprice;

                const hasUser = Object.keys(dropinfo.usersbuyobject).includes(
                    interaction.user.id
                );
                if (!hasUser) {
                    dropinfo.usersbuyobject[interaction.user.id] = buycount;
                } else {
                    dropinfo.usersbuyobject[interaction.user.id] =
                        dropinfo.usersbuyobject[interaction.user.id] + buycount;
                }

                dropinfo.amountbought = dropinfo.amountbought + buycount;

                await economyModel.findOneAndUpdate(params, userData);
                await inventoryModel.findOneAndUpdate(params, inventoryData);
                await dropModel.findOneAndUpdate(
                    { item: dropinfo.item },
                    dropinfo
                );

                dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
                    dropitem.item
                }\`\nDrop Ending At: <t:${dropinfo.dropendtime}:f> <t:${
                    dropinfo.dropendtime
                }:R>\nPrice: \`❀ ${dropinfo.price.toLocaleString()}\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\nYour Wallet: \`❀ ${userwallet.toLocaleString()}\`\nAvaliable for you: \`❀ ${totalprice_amountcanbuy.toLocaleString()}\` (${amountcanbuy.toLocaleString()})\n**You want to buy:** \`${buycount.toLocaleString()}\` (\`❀ ${(
                    buycount * dropinfo.price
                ).toLocaleString()}\`)`;

                if (extrastring) {
                    dropinfo_map = dropinfo_map + extrastring;
                }

                row.setComponents([buydropbutton, addbutton, minusbutton]);
                row2.setComponents([endinteractionbutton, backbutton]);

                drops_embed.setDescription(dropinfo_map);
                drop_msg.components[0].components.forEach((c) => {
                    c.setDisabled();
                });
                drop_msg.components[1].components.forEach((c) => {
                    c.setDisabled();
                });
                drop_msg.edit({
                    embeds: [drops_embed],
                    components: drop_msg.components,
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
            drop_msg.components[0].components.forEach((c) => {
                c.setDisabled();
            });
            drop_msg.components[1].components.forEach((c) => {
                c.setDisabled();
            });
            drop_msg.edit({
                components: drop_msg.components,
            });
        });
    },
};
