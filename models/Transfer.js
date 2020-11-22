const mongoose = require('mongoose')

const schema = mongoose.Schema({
    sender_id: {
        required: true,
        type: String
    },
    reciever_id: {
        required: true,
        type: String
    },
    quantity: {
        required: true,
        type: Number
    }
})

module.exports = mongoose.model('Transfer', schema)