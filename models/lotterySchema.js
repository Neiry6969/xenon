const mongoose = require("mongoose");

const lotterySchema = new mongoose.Schema(
    {
        lotteryId: {
            type: String,
            required: true,
            unique: true,
        },
        entriesTotal: {
            type: Number,
            default: 0,
        },
        entries: {
            type: Array,
            default: [],
        },
        entriesTop: {
            type: Object,
            default: {},
        },
        endsAt: {
            type: Number,
            default: null,
        },
        endStatus: {
            type: Boolean,
            default: false,
        },
    },
    { minimize: false }
);

const model = mongoose.model("LotteryModels", lotterySchema);

module.exports = model;
