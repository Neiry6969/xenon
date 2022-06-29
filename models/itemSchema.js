const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    value: {},

    price: {},
    sell: {},
    trade: {},
    imageUrl: {
        type: String,
    },
    description: {
        type: String,
    },
    rarity: {
        type: String,
    },
    type: {
        type: String,
    },
    lootbox: {
        type: Array,
    },
    crafttools: {
        type: Array,
    },
    craftitems: {
        type: Array,
    },
});

const model = mongoose.model("ItemModels", itemSchema);

module.exports = model;
