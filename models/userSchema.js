const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
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
    },
    { minimize: false }
)


const model = mongoose.model('UserModels', userSchema);

module.exports = model;