const mongoose = require("mongoose");

const tipsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
        },
    },
    { minimize: false }
);

const model = mongoose.model("TipsModels", tipsSchema);

module.exports = model;
