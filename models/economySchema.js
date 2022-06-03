const mongoose = require('mongoose');

const economySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        wallet: {
            type: Number,
            default: 0
        },
        bank: {
            type: Object,
            default: {
                coins: 0,
                bankspace: 1000,
                expbankspace: 0,
                otherbankspace: 0,
            }
        },
        experiencepoints: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 0
        },
        prestige: {
            type: Number,
            default: 0
        }, 
        inventory: {
            type: Object,
            default: {},
        },
        commands: {
            type: Number,
            default: 0
        },
        commandsObject: {
            type: Object,
            default: {}
        },
        streaks: {
            type: Object,
            default: {
                daily: {
                    lastclaimed: null,
                    strk: 0
                }
            }
        },
        deaths: {
            type: Number,
            default: 0,
        },
        premium: {
            type: Object,
            default: {
                expiredate: {
                    type: Date,
                    default: null
                },
                activatedate: {
                    type: Date,
                    default: null
                },
                rank: 0,
            }
        },
        gamblestats: {
            type: Object,
            default: {}
        },
        interactionstats: {
            type: Object,
            default: {}
        },
        job: {
            type: Object,
            default: {
                name: null,
                totalhoursworked: 0,
                currentjobhoursworked: 0,
                streak: 0,
                lastworked: null,
                hoursworkedday: 0,
            }
        },
        badges: {
            type: Object,
            default: {},
        },
        titles: {
            type: Object,
            default: {
                currenttitle: "Newbie",
                titles: {
                    type: Array,
                    default: ["Newbie"]
                }
            }
        },
        showcase: {
            type: Object,
            default: {
                slots: 0,
                items: {
                    type: Object,
                    default: {}
                }
            },
        },
        pet: {
            type: Object,
            default: {
                species: null,
                name: null,
                hygiene: {
                    percent: null,
                    lastinteract: null
                },
                hunger:  {
                    percent: null,
                    lastinteract: null
                },
                experience: {
                    percent: null,
                    lastinteract: null
                },
                toys: { 
                    type: Object,
                    default: {}
                }
            },
        },
        moderation: {
            type: Object,
            default: {
                blacklist: {
                    date: null,
                    status: false,
                    reason: null,
                    unblacklistdate: null,
                    resposiblemod: null
                },
                ban: {
                    date: null,
                    status: false,
                    reason: null,
                    unblacklistdate: null,
                    resposiblemod: null
                },
                logs: {
                    type: Array,
                    default: []
                }
            },
        },
        knowledge: {
            type: Number,
            default: 0
        },
        settings: {
            type: Object,
            default: {},
        },
        interactionproccesses: {
            type: Object, 
            default: {
                interaction: false,
                proccessingcoins: false
            },
        },
        usersocial: {
            type: Object,
            default: {
                thumbnailurl: "",
                followers: {
                    type: Array,
                    default: [],
                },
                following: {
                    type: Array,
                    default: [],
                },
                desc: {
                    type: String,
                    default: ""
                },
            }
        },
        cooldowns: {
            type: Object,
            default: {},
        },
        createdAt: { 
            required: true,
            type: Date, 
            default: Date.now 
        }, 
    },
    { minimize: false }
)


const model = mongoose.model('EconomyModels', economySchema);

module.exports = model;