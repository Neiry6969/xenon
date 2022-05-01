const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    serverId: {
        type: String,
        required: true,
    },
    coins: {
        type: Number,
        default: 0
    },
    bank: {
        type: Number,
    },
    bankspace: {
        type: Number,
    },
    expbankspace: {
        type: Number,
    },
    experiencepoints: {
        type: Number,
    },
    level: {
        type: Number,
    }, 
    commands: {
        type: Number,
    },
    dailystreak: {
        type: Number,
    },
    prestige: {
        type: Number,
    },
    deaths: {
        type: Number,
    },
    prenium: {
        type: Number,
    }
})


const model = mongoose.model('ProfileModels', profileSchema);

module.exports = model;