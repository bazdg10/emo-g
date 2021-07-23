const mongoose = require('mongoose')
const Schema = mongoose.Schema
const roomSchema = Schema({
    name: { type: String, required:  true },
    teams: { type: [String] },
    moderator: {type: String, required: true},
    current: {type: [Number], default: [0, 0]},
    game: { type: Number, default: 0 },
    dummy: { type: [String] },
    admin: {type: String},
    score: {type: [Number], default: [0, 0]},
    rounds: { type: Number, default: 4},
    words: {type: [String]}
})
const Room = mongoose.model('room', roomSchema)
module.exports = Room