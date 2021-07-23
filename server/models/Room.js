const mongoose = require('mongoose')
const Schema = mongoose.Schema
const roomSchema = Schema({
    name: { type: String, required:  true },
    teams: { type: Array },
    // team2: { type: Array },
    game: { type: Number, default: 0 },
    dummy: { type: Array },
    admin: {type: String},
    score: {type: Array, default: [0, 0]},
    rounds: { type: Number, default: 4},
    words: {type: Array}
})
const Room = mongoose.model('room', roomSchema)
module.exports = Room