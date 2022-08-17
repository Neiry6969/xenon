const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        settings: {
            type: Object,
            default: {},
        },
        activeitems: {
            type: Object,
            default: {},
        },
        eventcooldowns: {
            type: Object,
            default: {},
        },
    },
    { minimize: false }
);

const model = mongoose.model("UserModels", userSchema);

module.exports = model;
