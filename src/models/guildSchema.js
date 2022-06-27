const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema(
    {
        guildId: {
            type: String,
            required: true,
            unique: true,
        },
        disabledcmds: {
            type: Object,
            default: {},
        },
        disableditems: {
            type: Object,
            default: {},
        },
        createdAt: { 
            required: true,
            type: Date, 
            default: Date.now 
        }, 
    },
    { minimize: false }
)


const model = mongoose.model('GuildModels', guildSchema);

module.exports = model;