const mongoose = require("mongoose");

const lotterySchema = new mongoose.Schema(
    {
        lotteryId: {
            type: String,
            required: true,
            unique: true,
        },
        entrees: {
            type: Array,
            default: [],
        },
        topEntrees: {
            type: Array,
            default: [],
        },
        winner: {
            type: Object,
            default: {},
        },
    },
    { minimize: false }
);

const model = mongoose.model("LotteryModels", lotterySchema);

module.exports = model;
