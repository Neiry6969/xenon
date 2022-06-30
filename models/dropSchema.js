const mongoose = require("mongoose");

const dropSchema = new mongoose.Schema(
    {
        item: {
            type: String,
            required: true,
        },
        maxperuser: {
            type: Number,
            required: true,
        },
        amountbought: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: true,
        },
        usersbuyobject: {
            type: Object,
            default: {},
        },
        maxdrop: {
            type: Number,
            required: true,
        },
    },
    { minimize: false }
);

const model = mongoose.model("DropModels", dropSchema);

module.exports = model;
