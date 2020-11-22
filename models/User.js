const mongoose = require('mongoose')

const schema = mongoose.Schema({
    username: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String
    },
    phone_number: {
        required: true,
        type: String
    },
    region: {
        required: true,
        type: String
    },
    balance: {
        required: true,
        type: Number
    }
})

module.exports = mongoose.model('User', schema)