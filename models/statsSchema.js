const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        commands: {
            type: Number,
            default: 0
        },
        commandsObject: {
            type: Object,
            default: {}
        },
        gamblestats: {
            type: Object,
            default: {}
        },
        interactionstats: {
            type: Object,
            default: {}
        },
    },
    { minimize: false }
)


const model = mongoose.model('StatsModels', statsSchema);

module.exports = model;