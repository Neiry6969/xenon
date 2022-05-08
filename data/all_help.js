module.exports = [
    {
        command: 'balance',
        aliases: ['bal', 'bl'],
        cooldown: 5,
        category: 'currency',
        description: 'Check a balance.',
        shortdesc: 'Check a balance.',
    },
    {
        command: 'profile',
        aliases: ['exp', 'level', 'lvl'],
        cooldown: 5,
        category: 'currency',
        description: 'Check your profile.',
        shortdesc: 'Check your profile.',
    },
    {
        command: "beg",

        cooldown: 25,
        category: 'income',
        description: 'Beg for coins.',
        shortdesc: 'Beg for coins.',
    },
    {
        command: 'buy',
        aliases: ['purchase'],
        cooldown: 5,
        category: 'item interaction',
        description: "Buy items.",
        shortdesc: "Buy items.",
    },
    {
        command: 'dig',

        cooldown: 35,
        description: "Dig for some treasures.",
        category: 'income',
        shortdesc: "Dig for some treasures.",
    },
    {
        command: 'daily',
        aliases: ['dai'],
        cooldown: 86400,
        description: "Collect your daily rewards.",
        shortdesc: "Collect your daily rewards.",
        category: 'income',
    },
    {
        command: "deposit",
        aliases: ["dep"],
        cooldown: 5,
        description: "Deposit coins into your bank.",
        shortdesc: "Deposit coins into your bank.",
        category: 'currency',
    },
    {
        command: 'fish',
        cooldown: 35,

        description: "Fish for some fish.",
        shortdesc: "Fish for some fish.",
        category: 'income',
    },
    {
        command: 'harvest',
        aliases: ['harv'],
        cooldown: 35,
        description: "Harvest for some food.",
        shortdesc: "Harvest for some food.",
        category: 'income',
    },
    {
        command: 'hunt',

        cooldown: 35,
        description: "Hunt for some animals.",
        shortdesc: "Hunt for some animals.",
        category: 'income',
    },
    {
        command: "gamble",
        aliases: ['bet'],
        cooldown: 10,
        description: "Bet your money away.",
        shortdesc: "Bet your money away.",
        category: 'gamble',
    },
    {
        command: "gift",
        aliases: ['yeet', 'send'],
        cooldown: 10,
        description: "Gift items to other users.",
        shortdesc: "Gift items to other users.",
        category: 'interaction',
    },
    {
        command: 'inventory',
        aliases: ['inv'],
        cooldown: 3,
        description: "Check a inventory.",
        shortdesc: "Check a inventory.",
        category: 'currency',
    },
    {
        command: 'invite',
        
        cooldown: 5,
        description: "Invite the bot to your server.",
        shortdesc: "Invite the bot to your server.",
        category: 'bot',
    },
    {
        command: 'ping',
        aliases: ['latency'],
        cooldown: 10,
        description: "Check the bot's latency status.",
        shortdesc: "Check the bot's latency status.",
        category: 'bot',
    },
    {
        command: "search",
        aliases: ["scout"],
        cooldown: 20,
        description: "Search for coins or items.",
        shortdesc: "Search for coins or items.",
        category: 'income',
    },
    {
        command: "sell",

        cooldown: 10,
        description: "Sell an item.",
        shortdesc: "Sell an item.",
        category: 'item interaction',
    },
    {
        command: "share",
        aliases: ['give', 'shr'],
        cooldown: 10,
        description: "Share coins with other users.",
        shortdesc: "Share coins with other users.",
        category: 'interaction',
    },
    {
        command: "shop",
        aliases: ["store", "item"],
        cooldown: 5,
        description: 'See what is in the item shop or check the stats of an item.',
        shortdesc: 'See what is in the item shop or check the stats of an item.',
        category: 'item interaction',
    },
    {
        command: "slots",
        aliases: ['slot'],
        cooldown: 10,
        description: "Slots your money away.",
        shortdesc: "Slots your money away.",
        category: 'gamble',
    },
    {
        command: "use",

        cooldown: 5,
        description: "Use useable items.",
        shortdesc: "Use useable items.",
        category: 'item interaction',
    },
    {
        command: "withdraw",
        aliases: ["with"],
        cooldown: 5,
        description: "Withdraw coins into your bank.",
        shortdesc: "Withdraw coins into your bank.",
        category: 'currency',
    },
]