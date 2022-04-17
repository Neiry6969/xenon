const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    inventory: {
        type: Object,
    }
})


const model = mongoose.model('InventoryModels', inventorySchema);

module.exports = model;