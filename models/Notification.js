const mongoose = require('mongoose')

const schema = mongoose.Schema({
    user_id: {
        required: true,
        type: String
    },
    is_seen: {
        type: Boolean,
        default: false
    },
    time: {
        type: Date,
        default: Date.now()
    },
    msg: {
        required: true,
        type: String
    }
})

module.exports = mongoose.model('Notification', schema)