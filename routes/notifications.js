//GLOBAL VARIABLES
const express = require('express')
const app = express.Router()
const Notification = require('../models/Notification')

//TURN NOTIFICATION SEEN
app.post('/seen', (req, res) => {
    if(req.body.notification_id) {
        Notification
            .findOneAndUpdate({ _id: req.body.notification_id }, { is_seen: true })
            .then(() => res.json({
                status: true,
                msg: 'Notification updated'
            }))
    } else
        res.json({
            status: false,
            msg: 'Please fill required fields'
        })
})

module.exports = app