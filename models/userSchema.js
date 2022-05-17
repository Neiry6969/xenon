const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        commands: {
            type: Object,
            default: {},
        },
        gamblingstats: {
            type: Object,
            default: {},
        },
        job: {
            type: String,
            default: "none"
        },
        followers: {
            type: Array,
            default: [],
        },
        following: {
            type: Array,
            default: [],
        },
        biodesc: {
            type: String,
            default: "",
        },
        bioimage: {
            type: String,
            default: ""
        },
        interactionstats: {
            type: Object,
            default: {},
        },
        awaitinginteraction: {
            required: true,
            type: Boolean, 
            default: false,
        },
        badges: {
            type: Object,
            default: {},
        },
        stealinteractions: {
            type: Object,
            default: {},
        },
        titles: {
            type: Object,
            default: {},
        },
        title: {
            type: String,
            default: "Newbie"
        },
        showcase: {
            type: Object,
            default: {},
        },
        pet: {
            type: Object,
            default: {},
        },
        blacklisted: {
            type: Boolean,
            default: false,
        },
        knowledge: {
            type: Number,
            default: 0
        },
        settings: {
            type: Object,
            default: {},
        }
    }, 
    { minimize: false }
)


const model = mongoose.model('UserModels', userSchema);

module.exports = model;