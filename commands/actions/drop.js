const inventoryModel = require("../../models/inventorySchema");
const dropModel = require("../../models/dropSchema");
const economyModel = require("../../models/economySchema");

const jsoncooldowns = require("../../cooldowns.json");
const interactionproccesses = require("../../interactionproccesses.json");
const fs = require("fs");
const {
  MessageEmbed,
  MessageSelectMenu,
  MessageActionRow,
  MessageButton
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
    fs.writeFile("./cooldowns.json", JSON.stringify(jsoncooldowns), (err) => {
      if (err) {
        console.log(err);
      }
    });
    const errorembed = new MessageEmbed().setColor("#FF5C5C");

    let drops = await dropModel.find({});

    if (drops.length === 0) {
      errorembed.setDescription("There are no drops currently.");
      return interaction.reply({ embeds: [errorembed], ephemeral: true });
    }

    const mappedData = drops
      .map((v) => {
        const amountleft = v.maxdrop - v.amountbought;
        const item = allItems.find((val) => val.item.toLowerCase() === v.item);
        return `${item.icon} **${item.name}**\nID: \`${
          item.item
        }\`\nAmount Left: \`${amountleft.toLocaleString()}/${v.maxdrop.toLocaleString()}\`\nMax Per User: \`${v.maxperuser.toLocaleString()}\``;
      })
      .join("\n\n");

    const mappedDropOptions = drops.map((v) => {
      const item = allItems.find((val) => val.item.toLowerCase() === v.item);
      return {
        label: item.name,
        value: item.item,
        emoji: item.icon
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
      // .setDisabled(true)
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

    let row = new MessageActionRow().addComponents(dropmenu);
    let row2 = new MessageActionRow().addComponents(endinteractionbutton);

    const drops_embed = new MessageEmbed()
      .setColor("RANDOM")
      .setDescription(mappedData);

    await interaction.reply({
      embeds: [drops_embed],
      components: [row, row2]
    });

    const drop_msg = await interaction.fetchReply();

    interactionproccesses[interaction.user.id] = {
      interaction: true,
      proccessingcoins: true
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
      idle: 30 * 1000
    });

    let buycount = 1;
    let dropinfo_map;
    let selecteddrop;

    collector.on("collect", async (i) => {
      if (i.user.id != interaction.user.id) {
        return i.reply({
          content: "This is not for you.",
          ephemeral: true
        });
      }

      i.deferUpdate();

      if (i.customId === "endinteraction") {
        interactionproccesses[interaction.user.id] = {
          interaction: false,
          proccessingcoins: false
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
          components: drop_msg.components
        });
      } else if (i.customId === "dropmenu") {
        selecteddrop = i.values[0];
        const dropinfo = await dropModel.findOne({
          item: selecteddrop
        });

        const dropitem = allItems.find(
          (val) => val.item.toLowerCase() === dropinfo.item
        );

        const amountleft = dropinfo.maxdrop - dropinfo.amountbought;

        let userbought = dropinfo.usersbuyobject[interaction.user.id];
        if (!dropinfo.usersbuyobject[interaction.user.id]) {
          userbought = 0;
          dropinfo.usersbuyobject[interaction.user.id] = 0;

          await dropModel.findOneAndUpdate({ item: selecteddrop }, dropinfo);
        }

        dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
          dropitem.item
        }\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\n**You want to buy:** \`${buycount.toLocaleString()}\``;

        buydropbutton.setEmoji(dropitem.icon);

        if (userbought === dropinfo.maxperuser || amountleft === 0) {
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
        if (leftforuser <= buycount) {
          buycount = leftforuser;
          addbutton.setDisabled(true);
        } else if (amountleft <= buycount) {
          buycount = amountleft;
          addbutton.setDisabled(true);
        } else {
          addbutton.setDisabled(false);
        }

        row.setComponents([buydropbutton, addbutton, minusbutton]);

        drops_embed.setDescription(dropinfo_map);
        await drop_msg.edit({
          embeds: [drops_embed],
          components: [row, row2]
        });
      } else if (i.customId === "addbutton") {
        buycount = buycount + 1;

        const dropinfo = await dropModel.findOne({
          item: selecteddrop
        });

        const dropitem = allItems.find(
          (val) => val.item.toLowerCase() === dropinfo.item
        );

        const amountleft = dropinfo.maxdrop - dropinfo.amountbought;

        let userbought = dropinfo.usersbuyobject[interaction.user.id];
        if (!dropinfo.usersbuyobject[interaction.user.id]) {
          userbought = 0;
          dropinfo.usersbuyobject[interaction.user.id] = 0;

          await dropModel.findOneAndUpdate({ item: selecteddrop }, dropinfo);
        }

        dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
          dropitem.item
        }\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\n**You want to buy:** \`${buycount.toLocaleString()}\``;

        buydropbutton.setEmoji(dropitem.icon);

        if (userbought === dropinfo.maxperuser || amountleft === 0) {
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
        if (leftforuser <= buycount) {
          buycount = leftforuser;
          addbutton.setDisabled(true);
        } else if (amountleft <= buycount) {
          buycount = amountleft;
          addbutton.setDisabled(true);
        } else {
          addbutton.setDisabled(false);
        }

        row.setComponents([buydropbutton, addbutton, minusbutton]);

        drops_embed.setDescription(dropinfo_map);
        await drop_msg.edit({
          embeds: [drops_embed],
          components: [row, row2]
        });
      } else if (i.customId === "minusbutton") {
        const dropinfo = await dropModel.findOne({
          item: selecteddrop
        });

        const dropitem = allItems.find(
          (val) => val.item.toLowerCase() === dropinfo.item
        );

        const amountleft = dropinfo.maxdrop - dropinfo.amountbought;

        let userbought = dropinfo.usersbuyobject[interaction.user.id];
        if (!dropinfo.usersbuyobject[interaction.user.id]) {
          userbought = 0;
          dropinfo.usersbuyobject[interaction.user.id] = 0;

          await dropModel.findOneAndUpdate({ item: selecteddrop }, dropinfo);
        }

        dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
          dropitem.item
        }\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\n**You want to buy:** \`${buycount.toLocaleString()}\``;

        buydropbutton.setEmoji(dropitem.icon);

        if (userbought === dropinfo.maxperuser || amountleft === 0) {
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
        if (leftforuser <= buycount) {
          buycount = leftforuser;
          addbutton.setDisabled(true);
        } else if (amountleft <= buycount) {
          buycount = amountleft;
          addbutton.setDisabled(true);
        } else {
          addbutton.setDisabled(false);
        }

        row.setComponents([buydropbutton, addbutton, minusbutton]);

        drops_embed.setDescription(dropinfo_map);
        await drop_msg.edit({
          embeds: [drops_embed],
          components: [row, row2]
        });
      } else if (i.customId === "buydropbutton") {
        let problem = false;
        buydropbutton.setDisabled(true);
          addbutton.setDisabled(true);
          minusbutton.setDisabled(true);
        const dropinfo = await dropModel.findOne({
          item: selecteddrop
        });

        const dropitem = allItems.find(
          (val) => val.item.toLowerCase() === dropinfo.item
        );

        const amountleft = dropinfo.maxdrop - dropinfo.amountbought;

        let userbought = dropinfo.usersbuyobject[interaction.user.id];
        if (!dropinfo.usersbuyobject[interaction.user.id]) {
          userbought = 0;
          dropinfo.usersbuyobject[interaction.user.id] = 0;

          await dropModel.findOneAndUpdate({ item: selecteddrop }, dropinfo);
        }

        if (amountleft === 1) {
          buycount = 1
        }
        if (buycount > amountleft) {
          buycount = amountleft;
        }

        dropinfo_map = `${dropitem.icon} **${dropitem.name}**\nID: \`${
          dropitem.item
        }\`\nAmount Left: \`${amountleft.toLocaleString()}/${dropinfo.maxdrop.toLocaleString()}\`\nMax Per User: \`${userbought.toLocaleString()}/${dropinfo.maxperuser.toLocaleString()}\`\n\n**You want to buy:** \`${buycount.toLocaleString()}\``;

        buydropbutton.setEmoji(dropitem.icon);

        if (userbought === dropinfo.maxperuser || amountleft === 0) {
          dropinfo_map = dropinfo_map + `\n\`Too sad, the stocks ran out!\``
        } else {
          dropinfo_map = dropinfo_map + `\n\`You sucessfully bought ${buycount.toLocaleString()} stocks! Good buisness!\``
        }
        
        
        row.setComponents([buydropbutton, addbutton, minusbutton]);

        interactionproccesses[interaction.user.id] = {
          interaction: false,
          proccessingcoins: false
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
        
        drops_embed.setDescription(dropinfo_map)
        drop_msg.components[0].components.forEach((c) => {
          c.setDisabled();
        });
        drop_msg.components[1].components.forEach((c) => {
          c.setDisabled();
        });
        drop_msg.edit({
          embeds: [drops_embed]
          components: drop_msg.components
        });
      }
    });

    collector.on("end", (collected) => {
      interactionproccesses[interaction.user.id] = {
        interaction: false,
        proccessingcoins: false
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
        components: drop_msg.components
      });
    });
  }
};
