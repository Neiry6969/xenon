const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        commands: {
            type: Onject,
            default: { total: 0, list: {} },
        },
        gamblestats: {
            type: Object,
            default: {},
        },
        interactionstats: {
            type: Object,
            default: {},
        },
        streaks: {
            type: Object,
            default: {
                daily: {
                    lastclaimed: null,
                    strk: 0,
                },
            },
        },
        deaths: {
            type: Number,
            default: 0,
        },
    },
    { minimize: false }
);

const model = mongoose.model("StatsModels", statsSchema);

module.exports = model;
