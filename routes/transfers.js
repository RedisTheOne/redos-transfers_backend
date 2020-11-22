//GLOBAL VARIABLES
const express = require('express')
const Transfer = require('../models/Transfer')
const User = require('../models/User')
const Notification = require('../models/Notification')
const app = express.Router()
const jwt = require('jsonwebtoken')
const key = require('../jwtkey')

//SEND TRANSFER
app.post('/send', (req, res) => {
    //CHECK IF ALL FIELDS ARE ENTERED
    if(req.headers['authorization'] && req.body.reciever_id && req.body.quantity) {
        //VERIFY TOKEN
        const token = req.headers['authorization'].split(' ')[1]
        jwt.verify(token, key, async (err, decoded) => {
            //CHECK IF TOKEN IS AUTHORIZED
            if(err)
                res.json({
                    status: false,
                    msg: 'Not authorized'
                })
            else {
                //CHECK IF USER EXISTS
                User
                    .findOne({ _id: req.body.reciever_id })
                    .then(user => {
                        if(user) {
                            //CREATE TRANSFER OBJECT
                            const transfer = new Transfer({ sender_id: decoded.user._id, reciever_id: req.body.reciever_id, quantity: req.body.quantity })
                            transfer
                                .save()
                                .then(() => {
                                    //UPDATE SENDER
                                    User
                                        .findOneAndUpdate({ _id: decoded.user._id }, { $inc: { balance: -Math.abs(req.body.quantity) } })
                                        .then(() => {
                                            //UPDATE RECIEVER
                                            User
                                                .findOneAndUpdate({ _id: req.body.reciever_id }, { $inc: { balance: req.body.quantity } })
                                                .then(() => {
                                                    //CREATE NOTIFICATIONS
                                                    const notificationOne = new Notification({ user_id: decoded.user._id, msg: `${req.body.quantity} credits transfer to ${user.username} was done successfuly` })
                                                    const notificationTwo = new Notification({ user_id: user._id, msg: `${req.body.quantity} credits were transfered from ${decoded.user.username} successfuly` })
                                                    //SAVE THE FIRST
                                                    notificationOne
                                                        .save()
                                                        .then(() => {
                                                            //SAVE THE SECOND
                                                            notificationTwo
                                                                .save()
                                                                .then(() => {
                                                                    //FINALLY DONE :)
                                                                    res.json({
                                                                        status: true,
                                                                        msg: 'Transfer was done successfuly'
                                                                    })
                                                                })
                                                        })

                                                })
                                        })
                                })
                        } else
                            res.json({
                                status: false,
                                msg: 'User does not exist'
                            })
                    })
            }
        })
    } else
        res.json({
            status: false,
            msg: 'Please fill required fields'
        })
})

module.exports = app