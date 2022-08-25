const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema(
    {
        place: {
            type: String,
            required: true,
            unique: true,
        },
        message: {
            type: String,
            required: true,
        },
        maxcoins: {
            type: Number,
            required: true,
        },
        mincoins: {
            type: Number,
            required: true,
        },
        items: {
            type: Array,
            default: [],
        },
        itempecrent: {
            type: Number,
            default: 0,
        },
    },
    { minimize: false }
);

const model = mongoose.model("SearchModels", searchSchema);

module.exports = model;
