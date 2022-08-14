const mongoose = require("mongoose");

const economySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        wallet: {
            type: Number,
            default: 0,
        },
        bank: {
            type: Object,
            default: {
                coins: 0,
                expbankspace: 0,
                otherbankspace: 0,
                bankmessagespace: 0,
            },
        },
        experiencepoints: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 0,
        },
        prestige: {
            type: Number,
            default: 0,
        },
        premium: {
            type: Object,
            default: {
                expiredate: {
                    type: Date,
                    default: null,
                },
                activatedate: {
                    type: Date,
                    default: null,
                },
                rank: 0,
            },
        },
        badges: {
            type: Array,
            default: [],
        },
        titles: {
            type: Object,
            default: {
                currenttitle: "Newbie",
                titles: {
                    type: Array,
                    default: ["Newbie"],
                },
            },
        },
        createdAt: {
            required: true,
            type: Date,
            default: Date.now,
        },
    },
    { minimize: false }
);

const model = mongoose.model("EconomyModels", economySchema);

module.exports = model;
