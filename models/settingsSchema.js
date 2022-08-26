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
            default: {
                dmnotifications: {
                    status: true,
                    lastedit: null,
                },
                tips: {
                    status: true,
                    lastedit: null,
                },
                passive: {
                    status: false,
                    lastedit: null,
                },
                votereminders: {
                    status: true,
                    lastedit: null,
                },
                levelupnotifications: {
                    status: true,
                    lastedit: null,
                },
                compactmode: {
                    status: false,
                    lastedit: null,
                },
            },
        },
    },
    { minimize: false }
);

const model = mongoose.model("SettingsModels", settingsSchema);

module.exports = model;
