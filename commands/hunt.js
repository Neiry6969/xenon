const economyModel = require("../models/economySchema");
const inventoryModel = require("../models/inventorySchema");
const allItems = require('../data/all_items');

const jsoncooldowns = require('../cooldowns.json');
const fs = require('fs')
function premiumcooldowncalc(defaultcooldown) {
    if(defaultcooldown <= 5 && defaultcooldown > 2) {
        return defaultcooldown - 2
    } else if(defaultcooldown <= 15) {
        return defaultcooldown - 5
    } else if(defaultcooldown <= 120) {
        return defaultcooldown - 10
    } else {
        return defaultcooldown
    }
}

const lowest = ['bird', 'chick', 'monkey']
const lowmid = ['koala', 'pig', 'sheep']
const highmid = ['elephant', 'parrot']
const high = ['dragon', 'unicorn']
const highest = ['panda']

function hunt() {
    const number = Math.floor(Math.random() * 10000);
    if(number <= 5000) {
        return `You weren't able to hunt any animals, welp I guess you should sharpen your aim.`
    } else if(number <= 8000 && number > 5000) {
        const result = Math.floor(Math.random() * lowest.length);

        return lowest[result];
    } else if(number <= 9500 && number > 8000) {
        const result = Math.floor(Math.random() * lowmid.length);

        return lowmid[result];
    } else if(number <= 9950 && number > 9500) {
        const result = Math.floor(Math.random() * highmid.length);

        return highmid[result];
    } else if(number <= 9999 && number > 9950)  {
        const result = Math.floor(Math.random() * high.length);

        return high[result];
    } else if(number >= 10000) {
        const result = Math.floor(Math.random() * highest.length);

        return highest[result];
    }
}

module.exports = {
    name: 'hunt',
    cooldown: 35,
    maxArgs: 0,
    description: "hunt for some animals.",
    async execute(message, args, cmd, client, Discord, userData, inventoryData, statsData, profileData) {
        const params = {
            userId: message.author.id
        }
        const rifle = allItems.find((val) => (val.item.toLowerCase()) === "rifle")

        const iftable = args[0]?.toLowerCase()
        if(iftable === 'table' || iftable === 'list') {
            const bird = allItems.find((val) => (val.item.toLowerCase()) === "bird")
            const chick = allItems.find((val) => (val.item.toLowerCase()) === "chick")
            const monkey = allItems.find((val) => (val.item.toLowerCase()) === "monkey")
            const koala = allItems.find((val) => (val.item.toLowerCase()) === "koala")
            const pig = allItems.find((val) => (val.item.toLowerCase()) === "pig")
            const sheep = allItems.find((val) => (val.item.toLowerCase()) === "sheep")
            const panda = allItems.find((val) => (val.item.toLowerCase()) === "panda")
            const elephant = allItems.find((val) => (val.item.toLowerCase()) === "elephant")
            const parrot = allItems.find((val) => (val.item.toLowerCase()) === "parrot")
            const dragon = allItems.find((val) => (val.item.toLowerCase()) === "dragon")
            const unicorn = allItems.find((val) => (val.item.toLowerCase()) === "unicorn")
            
            const lowest_table = `${bird.icon} \`${bird.item}\`, ${chick.icon} \`${chick.item}\`, ${monkey.icon} \`${monkey.item}\``
            const lowmid_table = `${koala.icon} \`${koala.item}\`, ${pig.icon} \`${pig.item}\`, ${sheep.icon} \`${sheep.item}\``
            const highmid_table = `${elephant.icon} \`${elephant.item}\`, ${parrot.icon} \`${parrot.item}\``
            const high_table = `${dragon.icon} \`${dragon.item}\`, ${unicorn.icon} \`${unicorn.item}\``
            const highest_table = `${panda.icon} \`${panda.item}\``


            const embed = {
                color: 'RANDOM',
                title: `Hunt Table ${rifle.icon}`,
                description: `**Fail** ──── \`50%\`\n\n**Lowest** ──── \`30%\`\nitems: ${lowest_table}\n\n**Low Mid** ──── \`15%\`\nitems: ${lowmid_table}\n\n**High Mid** ──── \`4.5%\`\nitems: ${highmid_table}\n\n**High** ──── \`0.49%\`\nitems: ${high_table}\n\n**Highest** ──── \`0.01%\`\nitems: ${highest_table}`,
                timestamp: new Date(),
            };
    
            return message.reply({ embeds: [embed] });
        } else {
            const result = hunt()
            if(
                !inventoryData.inventory[rifle.item] || inventoryData.inventory[rifle.item] === 0 || !userData
            ) {
                const embed = {
                    color: 'RANDOM',
                    title: `Hunt Error ${rifle.icon}`,
                    description: `You need atleast \`1\` ${rifle.item} ${rifle.icon} to go hunting. Use this command again when you have one.`,
                    timestamp: new Date(),
                };
        
                return message.reply({ embeds: [embed] });
            } else {
                if(result === `You weren't able to hunt any animals, welp I guess you should sharpen your aim.`) {
                    const embed = {
                        color: 'RANDOM',
                        title: `${message.author.username} went for a hunt ${rifle.icon}`,
                        description: result,
                        timestamp: new Date(),
                    };
            
                    message.reply({ embeds: [embed] });
                } else {
                    const item = allItems.find((val) => (val.item.toLowerCase()) === result)
                    const hasItem = Object.keys(inventoryData.inventory).includes(item.item);
                    if(!hasItem) {
                        inventoryData.inventory[item.item] = 1;
                    } else {
                        inventoryData.inventory[item.item] = inventoryData.inventory[item.item] + 1;
                    }

                    const expbankspace_amount = Math.floor(Math.random() * 1000) + 100;
                    const experiencepoints_amount = Math.floor(expbankspace_amount / 100);
                    userData.bank.expbankspace = userData.bank.expbankspace + expbankspace_amount
                    userData.experiencepoints = userData.experiencepoints + experiencepoints_amount
                    userData.bank.expbankspace = userData.bank.expbankspace + Math.floor(Math.random() * 69)
                    await inventoryModel.findOneAndUpdate(params, inventoryData);
                    await economyModel.findOneAndUpdate(params, userData);
            
                    
                    const embed = {
                        color: 'RANDOM',
                        title: `${message.author.username} went for a hunt ${rifle.icon}`,
                        description: `Wow nice shot! You got a \`${item.item}\` ${item.icon}`,
                        timestamp: new Date(),
                    };
            
                    message.reply({ embeds: [embed] });
                }
                let cooldown = 35;
                if(message.guild.id === '852261411136733195' || message.guild.id === '978479705906892830' || userData.premium.rank >= 1) {
                    cooldown = premiumcooldowncalc(cooldown)
                }
                const cooldown_amount = (cooldown) * 1000;
                const timpstamp = Date.now() + cooldown_amount
                jsoncooldowns[message.author.id].hunt = timpstamp
                fs.writeFile('./cooldowns.json', JSON.stringify(jsoncooldowns), (err) => {if(err) {console.log(err)}})
            }
           
    
        }
        
    }
}