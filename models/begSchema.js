const mongoose = require("mongoose");

const begSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        mincoins: {
            type: Number,
            required: true,
        },
        maxcoins: {
            type: Number,
            required: true,
        },
        multicoins: {
            type: Number,
            required: true,
        },
        itemsprecent: {
            type: Number,
            required: true,
        },
        deathrate: {
            type: Number,
            required: true,
        },
        successrate: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        deathdescription: {
            type: String,
            required: true,
        },
        faildescription: {
            type: String,
            required: true,
        },
        itemdescription: {
            type: String,
            required: true,
        },
        items: {
            type: Array,
            default: [],
        },
    },
    { minimize: false }
);

const model = mongoose.model("BegModels", begSchema);

module.exports = model;
