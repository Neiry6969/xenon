const mongoose = require('mongoose');

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
    aliases: { 
        required: true,
        type: Object
    },
    icon: {
        required: true,
        type: String,
    },
    price: {},
    sell: {},
    trade: {},
    imageUrl: {
        type: String,
        required: true,
    },
    description: {
        required: true,
        type: String,
    },
    rarity: {
        required: true,
        type: String,
    },
    type: {
        required: true,
        type: String,
    },

})


const model = mongoose.model('ItemModels', itemSchema);

module.exports = model;