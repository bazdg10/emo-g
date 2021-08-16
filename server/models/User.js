const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = Schema({
    email: { type: String, require: true },
    score: { type: Number, default: 0},
    tempId: { type: String },
    room: { type: String },
    // lastScore: { type: Number, default: 0}
})

const User = mongoose.model('User', userSchema)

module.exports = User