const mongoose = require('mongoose')
const Schema = mongoose.Schema
const roomSchema = Schema({
    name: { type: String, required:  true },
    team1: { type: Array },
    team2: { type: Array },
    game: { type: Number, default: 0 },
    dummy: { type: Array }
})
const Room = mongoose.model('room', roomSchema)
module.exports = Room