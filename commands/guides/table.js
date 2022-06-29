const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("table")
        .setDescription("Guide for what you can get in some commands.")
        .addStringOption((option) =>
            option
                .setName("guide")
                .setDescription("Which command guide do you want to read.")
                .setRequired(true)
                .addChoices(
                    { name: "dig", value: "dig" },
                    { name: "hunt", value: "hunt" },
                    { name: "fish", value: "fish" },
                    { name: "harvest", value: "harvest" },
                    { name: "mine", value: "mine" },
                    { name: "gamble", value: "gamble" },
                    { name: "slots", value: "slots" },
                    { name: "item rarity", value: "item rarity" }
                )
        ),
    cooldown: 0,
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
        const options = {
            guide: interaction.options.getString("guide"),
        };

        const option = options.guide?.toLowerCase();

        if (option === "dig") {
            const shovel = allItems.find(
                (val) => val.item.toLowerCase() === "shovel"
            );
            const worm = allItems.find(
                (val) => val.item.toLowerCase() === "worm"
            );
            const rat = allItems.find(
                (val) => val.item.toLowerCase() === "rat"
            );
            const rock = allItems.find(
                (val) => val.item.toLowerCase() === "rock"
            );
            const lizard = allItems.find(
                (val) => val.item.toLowerCase() === "lizard"
            );
            const snail = allItems.find(
                (val) => val.item.toLowerCase() === "snail"
            );
            const scorpion = allItems.find(
                (val) => val.item.toLowerCase() === "scorpion"
            );
            const statue = allItems.find(
                (val) => val.item.toLowerCase() === "statue"
            );
            const bronzecrown = allItems.find(
                (val) => val.item.toLowerCase() === "bronzecrown"
            );
            const chestofwooden = allItems.find(
                (val) => val.item.toLowerCase() === "chestofwooden"
            );

            const lowest_table = `${worm.icon} \`${worm.item}\`, ${rat.icon} \`${rat.item}\`, ${rock.icon} \`${rock.item}\``;
            const lowmid_table = `${lizard.icon} \`${lizard.item}\`, ${snail.icon} \`${snail.item}\`, ${chestofwooden.icon} \`${chestofwooden.item}\``;
            const highmid_table = `${scorpion.icon} \`${scorpion.item}\``;
            const high_table = `${statue.icon} \`${statue.item}\`, ${bronzecrown.icon} \`${bronzecrown.item}\``;

            const embed = {
                color: "RANDOM",
                title: `Dig Table ${shovel.icon}`,
                description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`30%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.9%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.1%\`\nitems: ${high_table}`,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        } else if (option === "harvest") {
            const hoe = allItems.find(
                (val) => val.item.toLowerCase() === "hoe"
            );

            const bread = allItems.find(
                (val) => val.item.toLowerCase() === "bread"
            );
            const carrot = allItems.find(
                (val) => val.item.toLowerCase() === "carrot"
            );
            const lettuce = allItems.find(
                (val) => val.item.toLowerCase() === "lettuce"
            );
            const tomato = allItems.find(
                (val) => val.item.toLowerCase() === "tomato"
            );
            const corn = allItems.find(
                (val) => val.item.toLowerCase() === "corn"
            );
            const potato = allItems.find(
                (val) => val.item.toLowerCase() === "potato"
            );
            const eggplant = allItems.find(
                (val) => val.item.toLowerCase() === "eggplant"
            );
            const onion = allItems.find(
                (val) => val.item.toLowerCase() === "onion"
            );
            const bubbletea = allItems.find(
                (val) => val.item.toLowerCase() === "bubbletea"
            );
            const avocado = allItems.find(
                (val) => val.item.toLowerCase() === "avocado"
            );

            const lowest_table = `${bread.icon} \`${bread.item}\`, ${carrot.icon} \`${carrot.item}\`, ${lettuce.icon} \`${lettuce.item}\``;
            const lowmid_table = `${tomato.icon} \`${tomato.item}\`, ${corn.icon} \`${corn.item}\`, ${eggplant.icon} \`${eggplant.item}\``;
            const highmid_table = `${potato.icon} \`${potato.item}\`, ${onion.icon} \`${onion.item}\`, ${avocado.icon} \`${avocado.item}\``;
            const high_table = `${bubbletea.icon} \`${bubbletea.item}\``;

            const embed = {
                color: "RANDOM",
                title: `Harvest Table ${hoe.icon}`,
                description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`30%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.5%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.5%\`\nitems: ${high_table}`,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        } else if (option === "fish") {
            const fishingrod = allItems.find(
                (val) => val.item.toLowerCase() === "fishingrod"
            );
            const fish = allItems.find(
                (val) => val.item.toLowerCase() === "fish"
            );
            const crab = allItems.find(
                (val) => val.item.toLowerCase() === "crab"
            );
            const shrimp = allItems.find(
                (val) => val.item.toLowerCase() === "shrimp"
            );
            const lobster = allItems.find(
                (val) => val.item.toLowerCase() === "lobster"
            );
            const squid = allItems.find(
                (val) => val.item.toLowerCase() === "squid"
            );
            const whale = allItems.find(
                (val) => val.item.toLowerCase() === "whale"
            );
            const dolphin = allItems.find(
                (val) => val.item.toLowerCase() === "dolphin"
            );
            const shark = allItems.find(
                (val) => val.item.toLowerCase() === "shark"
            );
            const losttrident = allItems.find(
                (val) => val.item.toLowerCase() === "losttrident"
            );

            const lowest_table = `${fish.icon} \`${fish.item}\`, ${crab.icon} \`${crab.item}\`, ${shrimp.icon} \`${shrimp.item}\``;
            const lowmid_table = `${lobster.icon} \`${lobster.item}\`, ${squid.icon} \`${squid.item}\``;
            const highmid_table = `${shark.icon} \`${shark.item}\`, ${dolphin.icon} \`${dolphin.item}\`, ${whale.icon} \`${whale.item}\``;
            const high_table = `${losttrident.icon} \`${losttrident.item}\``;

            const embed = {
                color: "RANDOM",
                title: `Fishing Table ${fishingrod.icon}`,
                description: `**Fail** ──── \`60%\`\n\n**Lowest** ──── \`20%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.99%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.01%\`\nitems: ${high_table}`,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        } else if (option === "hunt") {
            const rifle = allItems.find(
                (val) => val.item.toLowerCase() === "rifle"
            );
            const bird = allItems.find(
                (val) => val.item.toLowerCase() === "bird"
            );
            const chick = allItems.find(
                (val) => val.item.toLowerCase() === "chick"
            );
            const monkey = allItems.find(
                (val) => val.item.toLowerCase() === "monkey"
            );
            const koala = allItems.find(
                (val) => val.item.toLowerCase() === "koala"
            );
            const pig = allItems.find(
                (val) => val.item.toLowerCase() === "pig"
            );
            const sheep = allItems.find(
                (val) => val.item.toLowerCase() === "sheep"
            );
            const panda = allItems.find(
                (val) => val.item.toLowerCase() === "panda"
            );
            const elephant = allItems.find(
                (val) => val.item.toLowerCase() === "elephant"
            );
            const parrot = allItems.find(
                (val) => val.item.toLowerCase() === "parrot"
            );
            const dragon = allItems.find(
                (val) => val.item.toLowerCase() === "dragon"
            );
            const unicorn = allItems.find(
                (val) => val.item.toLowerCase() === "unicorn"
            );

            const lowest_table = `${bird.icon} \`${bird.item}\`, ${chick.icon} \`${chick.item}\`, ${monkey.icon} \`${monkey.item}\``;
            const lowmid_table = `${koala.icon} \`${koala.item}\`, ${pig.icon} \`${pig.item}\`, ${sheep.icon} \`${sheep.item}\``;
            const highmid_table = `${elephant.icon} \`${elephant.item}\`, ${parrot.icon} \`${parrot.item}\``;
            const high_table = `${dragon.icon} \`${dragon.item}\`, ${unicorn.icon} \`${unicorn.item}\``;
            const highest_table = `${panda.icon} \`${panda.item}\``;

            const embed = {
                color: "RANDOM",
                title: `Hunt Table ${rifle.icon}`,
                description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`30%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.5%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.49%\`\nitems: ${high_table}\n\n**Highest** ──── \`0.01%\`\nitems: ${highest_table}`,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        } else if (option === "mine") {
            const lowest = [
                {
                    item: "rock",
                    maxamount: 25,
                },
                {
                    item: "shardofsteel",
                    maxamount: 20,
                },
            ];
            const lowmid = [
                {
                    item: "shardofsteel",
                    maxamount: 30,
                },
                {
                    item: "shardofuranium",
                    maxamount: 12,
                },
                {
                    item: "shardofcopper",
                    maxamount: 18,
                },
            ];
            const highmid = [
                {
                    item: "shardofaluminum",
                    maxamount: 10,
                },
                {
                    item: "shardofgold",
                    maxamount: 5,
                },
            ];
            const high = [
                {
                    item: "shardofdiamond",
                    maxamount: 3,
                },
                {
                    item: "enhancedpickaxe",
                    maxamount: 1,
                },
            ];
            const pickaxe = allItems.find(
                (val) => val.item.toLowerCase() === "pickaxe"
            );
            const lowestMap = lowest
                .map((value) => {
                    const item = allItems.find(
                        (val) => val.item.toLowerCase() === value.item
                    );
                    return `${item.icon} \`${
                        item.item
                    }\` [\`max: ${value.maxamount.toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug)`;
                })
                .sort()
                .join("\n");

            const lowmidtMap = lowmid
                .map((value) => {
                    const item = allItems.find(
                        (val) => val.item.toLowerCase() === value.item
                    );
                    return `${item.icon} \`${
                        item.item
                    }\` [\`max: ${value.maxamount.toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug)`;
                })
                .sort()
                .join("\n");

            const highmidMap = highmid
                .map((value) => {
                    const item = allItems.find(
                        (val) => val.item.toLowerCase() === value.item
                    );
                    return `${item.icon} \`${
                        item.item
                    }\` [\`max: ${value.maxamount.toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug)`;
                })
                .sort()
                .join("\n");

            const highMap = high
                .map((value) => {
                    const item = allItems.find(
                        (val) => val.item.toLowerCase() === value.item
                    );
                    return `${item.icon} \`${
                        item.item
                    }\` [\`max: ${value.maxamount
                        .toLocaleString()
                        .toLocaleString()}\`](https://www.youtube.com/watch?v=H5QeTGcCeug)`;
                })
                .sort()
                .join("\n");

            const embed = {
                color: "RANDOM",
                title: `Mine Table`,
                description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`33%\`\n${lowestMap}\n\n**Low Mid** ──── \`15%\`\n${lowmidtMap}\n\n**High Mid** ──── \`1.99%\`\n${highmidMap}\n\n**High** ──── \`0.01%\`\n${highMap}`,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        } else if (option === "gamble") {
            const maxwinningmulti = 1.5;
            const minwinningmulti = 0.5;
            const embed = {
                color: "RANDOM",
                title: `Gamble Table`,
                description: `**MAX WINNING MULTIPLIER**: **x${
                    maxwinningmulti + minwinningmulti
                }** \`${
                    (maxwinningmulti + minwinningmulti) * 100
                }%\` (-0.1 x dice difference)\n**MIN WINNING MULTIPLIER**: **x${minwinningmulti}** \`${
                    minwinningmulti * 100
                }%\``,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        } else if (option === "slots") {
            const multiplieramount_2 = [
                {
                    icon: "<a:finecoin:968650301546586193>",
                    multi: 1,
                },
                {
                    icon: "<a:finemedal:968654431484796979>",
                    multi: 1,
                },
                {
                    icon: "<a:finetrophy:968660247977803787>",
                    multi: 1.2,
                },
                {
                    icon: "<a:finecrown:968688780615766047>",
                    multi: 1.5,
                },
                {
                    icon: "<:creatorscrown:965024171463688323>",
                    multi: 2,
                },
                {
                    icon: "<:excalibur:966537260034043974>",
                    multi: 3,
                },
            ];

            const multiplieramount_3 = [
                {
                    icon: "<a:finecoin:968650301546586193>",
                    multi: 4,
                },
                {
                    icon: "<a:finemedal:968654431484796979>",
                    multi: 8,
                },
                {
                    icon: "<a:finetrophy:968660247977803787>",
                    multi: 12,
                },
                {
                    icon: "<a:finecrown:968688780615766047>",
                    multi: 15,
                },
                {
                    icon: "<:creatorscrown:965024171463688323>",
                    multi: 75,
                },
                {
                    icon: "<:excalibur:966537260034043974>",
                    multi: 250,
                },
            ];
            const multifor2 = multiplieramount_2
                .map((value) => {
                    return `${value.icon}${value.icon}<:blankemojispace:968955340517433414><:blankemojispace:968955340517433414> **x${value.multi}**`;
                })
                .join("\n");
            const multifor3 = multiplieramount_3
                .map((value) => {
                    return `${value.icon}${value.icon}${value.icon}<:blankemojispace:968955340517433414> **x${value.multi}**`;
                })
                .join("\n");

            const embed = {
                color: "RANDOM",
                title: `Slots Table`,
                description: `Here is the slots table.\n\n**ICON**<:blankemojispace:968955340517433414>**MULTIPLIER**\n${multifor2}\n${multifor3}`,
                timestamp: new Date(),
            };

            interaction.reply({ embeds: [embed] });
        } else if (option === "item rarity") {
            const embed = {
                color: "#AF97FE",
                title: `Xenon Item Rarity Chart`,
                description: `**Ranking from highest to lowest:**\n\n\`mythical\`\n\`godly\`\n\`legendary\`\n\`exotic\`\n\`epic\`\n\`rare\`\n\`uncommon\`\n\`common\``,
                timestamp: new Date(),
            };

            return interaction.reply({ embeds: [embed] });
        }
    },
};
