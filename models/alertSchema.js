const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        alertId: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        usersRead: {
            type: Array,
            default: [],
        },
    },
    { minimize: false }
);

const model = mongoose.model("AlertModels", alertSchema);

module.exports = model;
