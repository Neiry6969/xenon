const {
    EmbedBuilder,
    SelectMenuBuilder,
    ActionRowBuilder,
    ButtonBuilder,
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
const DropModel = require("../../models/dropSchema");
const ItemModel = require("../../models/itemSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("drops")
        .setDescription("Limited drop items."),
    cooldown: 5,
    async execute(interaction, client, theme) {
        let error_message;
        const allItems = await fetchAllitemsData();
        const inventory_fetch = await fetchInventoryData(interaction.user.id);
        const economyData_fetch = await fetchEconomyData(interaction.user.id);
        const inventoryData = inventory_fetch.data;
        const economyData = economyData_fetch.data;

        let drops = await DropModel.find({});

        if (drops.length === 0) {
            error_message = "There are no drops currently.";
            return errorReply(interaction, error_message);
        }

        drops.forEach(async (v) => {
            const dropendtime = new Date(v.dropendtime);
            const datenow = new Date();
            const timeleft = dropendtime - datenow / 1000;

            if (timeleft <= 0) {
                const fetchitem = await ItemModel.findOne({ item: v.item });
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

                await ItemModel.findOneAndUpdate({ item: v.item }, fetchitem);
                await DropModel.findOneAndDelete({ _id: v._id });
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

                if (v.usersbuyobject[interaction.user.id]) {
                    amountbought_user = v.usersbuyobject[interaction.user.id];
                } else {
                    amountbought_user = 0;
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

        let endinteractionbutton = new ButtonBuilder()
            .setCustomId("endinteraction")
            .setLabel("End Interaction")
            .setStyle("Secondary");

        let dropmenu = new SelectMenuBuilder()
            .setCustomId("dropmenu")
            .setMinValues(0)
            .setMaxValues(1)
            .setPlaceholder("Select a drop to view")
            .addOptions(mappedDropOptions);

        let buydropbutton = new ButtonBuilder()
            .setCustomId("buydropbutton")
            .setLabel("Buy Drop")
            .setStyle("Primary");
        let addbutton = new ButtonBuilder()
            .setCustomId("addbutton")
            .setLabel("+")
            .setStyle("Secondary");

        let minusbutton = new ButtonBuilder()
            .setCustomId("minusbutton")
            .setLabel("-")
            .setStyle("Secondary");
        let backbutton = new ButtonBuilder()
            .setCustomId("backbutton")
            .setLabel("Back")
            .setStyle("Secondary");
        let setmaxbutton = new ButtonBuilder()
            .setCustomId("setmaxbutton")
            .setLabel("Set Max")
            .setStyle("Secondary");

        let row = new ActionRowBuilder().setComponents(dropmenu);
        let row2 = new ActionRowBuilder().setComponents(endinteractionbutton);

        const drops_embed = new EmbedBuilder()
            .setColor(theme.embed.color)
            .setDescription(mappedData);

        await interaction.reply({
            embeds: [drops_embed],
            components: [row, row2],
        });

        const drop_msg = await interaction.fetchReply();

        const collector = await drop_msg.createMessageComponentCollector({
            idle: 30 * 1000,
        });

        let buycount = 1;
        let dropinfo_map;
        let selecteddrop;
        let fecthusereconomy = await fetchEconomyData(interaction.user.id);
        let userwallet = fecthusereconomy.data.wallet;
        let amountcanbuy;
        let totalprice_amountcanbuy;
        let extrastring;

        setProcessingLock(interaction, true);
        collector.on("collect", async (i) => {
            if (i.user.id != interaction.user.id) {
                return i.reply({
                    content: "This is not for you.",
                    ephemeral: true,
                });
            }

            i.deferUpdate();

            if (i.customId === "endinteraction") {
                const disabledrows = [];
                drop_msg.components.forEach((row, index) => {
                    const row_new = ActionRowBuilder.from(
                        drop_msg.components[index]
                    );
                    row_new.components.forEach((c) => {
                        c.setDisabled();
                    });
                    disabledrows.push(row_new);
                });

                drop_msg.edit({
                    components: disabledrows,
                });
                setProcessingLock(interaction, false);
            } else if (i.customId === "backbutton") {
                row.setComponents(dropmenu);
                row2.setComponents(endinteractionbutton);
                drops_embed
                    .setColor(theme.embed.color)
                    .setDescription(mappedData);

                drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
            } else if (i.customId === "dropmenu") {
                selecteddrop = i.values[0];
                const dropinfo = await DropModel.findOne({
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

                    await DropModel.findOneAndUpdate(
                        { item: selecteddrop },
                        dropinfo
                    );
                }

                fecthusereconomy = await fetchEconomyData(interaction.user.id);
                userwallet = fecthusereconomy.data.wallet;
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
                    setmaxbutton.setDisabled(true);
                }

                if (userbought === dropinfo.maxperuser) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else if (amountleft === 0) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    extrastring = `\n\`Too sad, the stocks ran out!\``;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
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
                    setmaxbutton.setDisabled(true);
                } else if (amountcanbuy === buycount) {
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else if (leftforuser <= buycount) {
                    buycount = leftforuser;
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else if (amountleft <= buycount) {
                    buycount = amountleft;
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else {
                    addbutton.setDisabled(false);
                    setmaxbutton.setDisabled(false);
                    buydropbutton.setDisabled(false);
                }
                dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
                    dropitem.item
                }\`\nDrop Ending At: <t:${dropinfo.dropendtime}:f> <t:${
                    dropinfo.dropendtime
                }:R>\nPrice: \`❀ ${dropinfo.price.toLocaleString()}\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\nYour Wallet: \`❀ ${userwallet.toLocaleString()}\`\nAvaliable for you: \`❀ ${totalprice_amountcanbuy.toLocaleString()}\` (${amountcanbuy.toLocaleString()})\n**You want to buy:** \`${buycount.toLocaleString()}\` (\`❀ ${(
                    buycount * dropinfo.price
                ).toLocaleString()}\`)`;

                row.setComponents([
                    buydropbutton,
                    setmaxbutton,
                    addbutton,
                    minusbutton,
                ]);
                row2.setComponents([endinteractionbutton, backbutton]);

                drops_embed.setDescription(dropinfo_map);
                await drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
            } else if (i.customId === "setmaxbutton") {
                buycount = amountcanbuy;

                const dropinfo = await DropModel.findOne({
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

                    await DropModel.findOneAndUpdate(
                        { item: selecteddrop },
                        dropinfo
                    );
                }

                buydropbutton.setEmoji(dropitem.icon);

                fecthusereconomy = await fetchEconomyData(interaction.user.id);
                userwallet = fecthusereconomy.data.wallet;
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
                    setmaxbutton.setDisabled(true);
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
                    setmaxbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (amountleft === 1) {
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
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
                    setmaxbutton.setDisabled(true);
                } else if (leftforuser <= buycount) {
                    buycount = leftforuser;
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else if (amountleft <= buycount) {
                    buycount = amountleft;
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else {
                    addbutton.setDisabled(false);
                    setmaxbutton.setDisabled(false);
                }
                dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
                    dropitem.item
                }\`\nDrop Ending At: <t:${dropinfo.dropendtime}:f> <t:${
                    dropinfo.dropendtime
                }:R>\nPrice: \`❀ ${dropinfo.price.toLocaleString()}\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\nYour Wallet: \`❀ ${userwallet.toLocaleString()}\`\nAvaliable for you: \`❀ ${totalprice_amountcanbuy.toLocaleString()}\` (${amountcanbuy.toLocaleString()})\n**You want to buy:** \`${buycount.toLocaleString()}\` (\`❀ ${(
                    buycount * dropinfo.price
                ).toLocaleString()}\`)`;

                row.setComponents([
                    buydropbutton,
                    setmaxbutton,
                    addbutton,
                    minusbutton,
                ]);
                row2.setComponents([endinteractionbutton, backbutton]);

                drops_embed.setDescription(dropinfo_map);
                await drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
            } else if (i.customId === "addbutton") {
                buycount = buycount + 1;

                const dropinfo = await DropModel.findOne({
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

                    await DropModel.findOneAndUpdate(
                        { item: selecteddrop },
                        dropinfo
                    );
                }

                buydropbutton.setEmoji(dropitem.icon);

                fecthusereconomy = await fetchEconomyData(interaction.user.id);
                userwallet = fecthusereconomy.data.wallet;
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
                    setmaxbutton.setDisabled(true);
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
                    setmaxbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (amountleft === 1) {
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
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
                    setmaxbutton.setDisabled(true);
                } else if (leftforuser <= buycount) {
                    buycount = leftforuser;
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else if (amountleft <= buycount) {
                    buycount = amountleft;
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else {
                    addbutton.setDisabled(false);
                    setmaxbutton.setDisabled(false);
                }
                dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
                    dropitem.item
                }\`\nDrop Ending At: <t:${dropinfo.dropendtime}:f> <t:${
                    dropinfo.dropendtime
                }:R>\nPrice: \`❀ ${dropinfo.price.toLocaleString()}\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\nYour Wallet: \`❀ ${userwallet.toLocaleString()}\`\nAvaliable for you: \`❀ ${totalprice_amountcanbuy.toLocaleString()}\` (${amountcanbuy.toLocaleString()})\n**You want to buy:** \`${buycount.toLocaleString()}\` (\`❀ ${(
                    buycount * dropinfo.price
                ).toLocaleString()}\`)`;

                row.setComponents([
                    buydropbutton,
                    setmaxbutton,
                    addbutton,
                    minusbutton,
                ]);
                row2.setComponents([endinteractionbutton, backbutton]);

                drops_embed.setDescription(dropinfo_map);
                await drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
            } else if (i.customId === "minusbutton") {
                buycount = buycount - 1;

                const dropinfo = await DropModel.findOne({
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

                    await DropModel.findOneAndUpdate(
                        { item: selecteddrop },
                        dropinfo
                    );
                }

                buydropbutton.setEmoji(dropitem.icon);

                fecthusereconomy = await fetchEconomyData(interaction.user.id);
                userwallet = fecthusereconomy.data.wallet;
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
                    setmaxbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (userbought === dropinfo.maxperuser) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                } else if (amountleft === 0) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    extrastring = `\n\`Too sad, the stocks ran out!\``;
                    buydropbutton.setDisabled(true);
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                }

                if (amountleft === 1) {
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
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
                    setmaxbutton.setDisabled(true);
                } else if (leftforuser <= buycount) {
                    buycount = leftforuser;
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else if (amountleft <= buycount) {
                    buycount = amountleft;
                    addbutton.setDisabled(true);
                    setmaxbutton.setDisabled(true);
                } else {
                    addbutton.setDisabled(false);
                    setmaxbutton.setDisabled(false);
                }

                dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
                    dropitem.item
                }\`\nDrop Ending At: <t:${dropinfo.dropendtime}:f> <t:${
                    dropinfo.dropendtime
                }:R>\nPrice: \`❀ ${dropinfo.price.toLocaleString()}\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\nYour Wallet: \`❀ ${userwallet.toLocaleString()}\`\nAvaliable for you: \`❀ ${totalprice_amountcanbuy.toLocaleString()}\` (${amountcanbuy.toLocaleString()})\n**You want to buy:** \`${buycount.toLocaleString()}\` (\`❀ ${(
                    buycount * dropinfo.price
                ).toLocaleString()}\`)`;

                row.setComponents([
                    buydropbutton,
                    setmaxbutton,
                    addbutton,
                    minusbutton,
                ]);
                row2.setComponents([endinteractionbutton, backbutton]);

                drops_embed.setDescription(dropinfo_map);
                await drop_msg.edit({
                    embeds: [drops_embed],
                    components: [row, row2],
                });
            } else if (i.customId === "buydropbutton") {
                buydropbutton.setDisabled(true);
                addbutton.setDisabled(true);
                setmaxbutton.setDisabled(true);
                minusbutton.setDisabled(true);
                const dropinfo = await DropModel.findOne({
                    item: selecteddrop,
                });
                fecthusereconomy = await fetchEconomyData(interaction.user.id);
                userwallet = fecthusereconomy.data.wallet;
                amountcanbuy = Math.floor(userwallet / dropinfo.price);

                const dropitem = allItems.find(
                    (val) => val.item.toLowerCase() === dropinfo.item
                );

                const amountleft = dropinfo.maxdrop - dropinfo.amountbought;

                let userbought = dropinfo.usersbuyobject[interaction.user.id];
                const amountleftuser = dropinfo.maxperuser - userbought;

                if (!dropinfo.usersbuyobject[interaction.user.id]) {
                    userbought = 0;
                    dropinfo.usersbuyobject[interaction.user.id] = 0;

                    await DropModel.findOneAndUpdate(
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
                    setmaxbutton.setDisabled(true);
                    minusbutton.setDisabled(true);
                    extrastring = `\n\`You couldn't even buy 1 of the stocks.\``;
                } else if (amountcanbuy === buycount) {
                }

                if (userbought === dropinfo.maxperuser || amountleft === 0) {
                    totalprice_amountcanbuy = 0;
                    amountcanbuy = 0;
                    extrastring = `\n\`Too sad, the stocks ran out!\``;
                } else {
                    extrastring = `\n\`\`\`fix\n⬇️ You sucessfully bought some stocks of this drop! Great business!\n\nItem: ${
                        dropinfo.item
                    }\nQuantity: ${buycount.toLocaleString()}\nTotal: ❀ ${(
                        buycount * dropinfo.price
                    ).toLocaleString()}\`\`\``;
                }

                const totalprice = buycount * dropinfo.price;

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

                await removeCoins(interaction.user.id, totalprice);
                await addItem(interaction.user.id, dropinfo.item, buycount);
                await DropModel.findOneAndUpdate(
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

                row.setComponents([
                    buydropbutton,
                    setmaxbutton,
                    addbutton,
                    minusbutton,
                ]);
                row2.setComponents([endinteractionbutton, backbutton]);

                drops_embed
                    .setDescription(dropinfo_map)
                    .setColor(`#95ff87`)
                    .setFooter({
                        text: `New Wallet: ❀ ${(
                            userwallet - totalprice
                        ).toLocaleString()}`,
                    });
                const disabledrows = [];
                drop_msg.components.forEach((row, index) => {
                    const row_new = ActionRowBuilder.from(
                        drop_msg.components[index]
                    );
                    row_new.components.forEach((c) => {
                        c.setDisabled();
                    });
                    disabledrows.push(row_new);
                });
                drop_msg.edit({
                    embeds: [drops_embed],
                    components: disabledrows,
                });

                setProcessingLock(interaction, false);
            }
        });

        collector.on("end", (collected) => {
            setProcessingLock(interaction, false);

            const disabledrows = [];
            drop_msg.components.forEach((row, index) => {
                const row_new = ActionRowBuilder.from(
                    drop_msg.components[index]
                );
                row_new.components.forEach((c) => {
                    c.setDisabled();
                });
                disabledrows.push(row_new);
            });
            drop_msg.edit({
                components: disabledrows,
            });
        });
        return setCooldown(interaction, "drops", 5, economyData);
    },
};
