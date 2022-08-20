const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    alert: {
        type: Object,
        default: {},
    },
    settings: {
        type: Object,
        default: {},
    },
});

const model = mongoose.model("SettingsModels", settingsSchema);

module.exports = model;
