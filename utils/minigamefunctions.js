const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const { addItem } = require("./currencyfunctions");
const { fetchItemData } = require("./itemfunctions");

class Minigamefunctions {
  static async mg_fastestclick(
    interaction,
    embed_title,
    embed_description,
    embed_color,
    button_label,
    button_emoji,
    timelimit,
    item
  ) {
    let winner;
    const endsAt = Date.now() + timelimit * 1000;
    const mg_embed = new MessageEmbed()
      .setColor(embed_color)
      .setTitle(`**\`Event:\`** ${embed_title}`)
      .setDescription(
        `**Expires:** <t:${Math.floor(
          endsAt / 1000
        )}:R>\n\n${embed_description}\n\n*\`First to click the button below gets the prize!\`*`
      );

    let prize_display;
    if (item) {
      const itemdata = await fetchItemData(item);
      prize_display = `${itemdata.icon} \`${itemdata.item}\``;
    }

    let fastestclick_button = new MessageButton()
      .setCustomId("mg_fastestclick")
      .setStyle("PRIMARY")
      .setLabel(button_label)
      .setEmoji(button_emoji);
    let fastestclick_row = new MessageActionRow().setComponents(
      fastestclick_button
    );

    const mg_msg = await interaction.channel.send({
      embeds: [mg_embed],
      components: [fastestclick_row]
    });

    const collector = await mg_msg.createMessageComponentCollector({
      time: timelimit * 1000
    });

    collector.on("collect", async (button) => {
      winner = button.user;
      collector.stop();
      button.deferUpdate();

      fastestclick_button.setDisabled(true).setStyle("SUCCESS");
      mg_msg.edit({
        components: [fastestclick_row]
      });
    });

    collector.on("end", async (collected) => {
      if (winner) {
        mg_embed
          .setColor(`#95ff87`)
          .setDescription(
            `**Event Exipred:** <t:${Math.floor(
              Date.now() / 1000
            )}:R>\n\n${embed_description}\n\n${winner} was the fastest and claimed a ${prize_display}`
          );

        mg_msg.edit({
          embeds: [mg_embed]
        });
        if (item) {
          await addItem(winner.id, item, 1);
        }
      } else {
        fastestclick_button.setDisabled(true).setStyle("SECONDARY");
        mg_msg.edit({
          components: [fastestclick_row]
        });
        mg_embed
          .setColor(`#2c273d`)
          .setDescription(
            `**Event Exipred:** <t:${Math.floor(
              Date.now() / 1000
            )}:R>\n\n${embed_description}\n\n*No one clicked the button so the prize for this event is lost*`
          );

        mg_msg.edit({
          embeds: [mg_embed]
        });
      }
    });
  }
}

module.exports = Minigamefunctions;
