const mongoose = require('mongoose')
const Schema = mongoose.Schema
const roomSchema = Schema({
    name: { type: String, required:  true },
    teams: { type: [String] },
    current: {type: [Number], default: [0, 3]},
    player: {type: String},
    mails: { type: [[String]], default: [[], []] }, 
    game: { type: Number, default: 0 },
    turn: { type: Number, default: 0 },
    dummy: { type: [[String]], default: [[], []] },
    score: {type: [Number], default: [0, 0]},
    rounds: { type: Number, default: 4},
    st: { type: String },
    word: {type: String}
})
const Room = mongoose.model('room', roomSchema)
module.exports = Room