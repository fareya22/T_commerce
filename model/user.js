const { Schema, model } = require('mongoose')

const User = new Schema({
    name : String,
    chatID: Number,
    phone: String,
    admin:{
        type: Boolean,
        default: false
    },
    action: String,
    createAt: Date,
    status:{
        type: Boolean,
        default : true
    }
})

module.exports = model('User',User)