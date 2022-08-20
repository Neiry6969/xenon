const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
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
    },
    { minimize: false }
);

const model = mongoose.model("SettingsModels", settingsSchema);

module.exports = model;
