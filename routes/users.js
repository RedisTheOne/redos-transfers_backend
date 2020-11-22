//GLOBAL VARIABLES
const express = require('express')
const app = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Transfer = require('../models/Transfer')
const Notification = require('../models/Notification')
const jwt = require('jsonwebtoken')
const key = require('../jwtkey')

//GENERATE AND COMPARE PASSWORD
async function generateHash(password) {
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if(err)
                reject(err)
            bcrypt.hash(password, salt, (err, hash) => {
                if(err)
                    reject(err)
                resolve(hash)
            })
        })
    })
    return hashedPassword
}
async function compareHash(plainPass, hashword) {
    const isMatched = await new Promise((resolve, reject) => {
        bcrypt.compare(plainPass, hashword, function(err, isPasswordMatch) {  
            if(err)
                reject(err)
            resolve(isPasswordMatch)
        })
    })
    return isMatched
}

//GET USER INFORMATION
app.get('/', async (req, res) => {
    if(req.headers['authorization']) {
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
                const recievedTransfers = await Transfer.find({reciever_id: decoded.user._id})
                const sentTransfers = await Transfer.find({sender_id: decoded.user._id})
                const notifications = await Notification.find({user_id: decoded.user._id})
                const user = await User.findOne({ _id: decoded.user._id })
                res.json({
                    status: true,
                    sentTransfers,
                    notifications,
                    recievedTransfers,
                    user
                })
            }
        })
    } else
        res.json({
            status: false,
            msg: 'Not authorized'
        })
})

//GET USERNAMES LIST
app.get('/list', (req, res) => {
    User
        .find({})
        .then(users => {
            const usernames = users.map((u) => { return u.username })
            res.send({users: usernames})
        })
})

//SIGN IN
app.post('/signin', (req, res) => {
    if(req.body.username && req.body.password) {
        //FIND A USER WITH THIS USERNAME
        User
            .findOne({username: req.body.username})
            .then(user => {
                //CHECK IF USER EXISTS
                if(user) {
                    compareHash(req.body.password, user.password)
                        .then((isMatch) => {
                            //CHECK IF PASSWORD IS CORRECT
                            if(isMatch) {
                                //SEND TOKEN
                                jwt.sign({user}, key, {expiresIn: '30d'}, (err, token) => {
                                    res.json({
                                        status: true,
                                        msg: 'Signed in successfuly',
                                        token
                                    })
                                });
                            } else
                                res.json({
                                    status: false,
                                    msg: 'User is not valid'
                                })
                        })
                        .catch(() => res.json({
                            status: false,
                            msg: 'Error occured'
                        }))
                } else
                    res.json({
                        status: false,
                        msg: 'User is not valid'
                    })
            })
    } else
        res.json({
            status: false,
            msg: 'Please fill required fields'
        })
})

//SIGN UP
app.post('/signup', (req, res) => {
    if(req.body.username && req.body.password && req.body.email && req.body.phone_number && req.body.region) {
        //CHECK IF USERNAME IS USED
        User
            .findOne({username: req.body.username})
            .then(user => {
                //CHECK IF USERNAME IS TAKEN
                if(user)
                    res.json({
                        status: false,
                        msg: 'Username is already taken'
                    })
                else {
                    //IS VALID
                    generateHash(req.body.password)
                        .then(generatedPassword => {
                            //CREATE USER
                            const user = new User({
                                username: req.body.username, 
                                password: generatedPassword,
                                email: req.body.email,
                                phone_number: req.body.phone_number,
                                region: req.body.region,
                                balance: 500
                            })
                            user
                                .save()
                                .then(() => {
                                    //SEND TOKEN
                                    jwt.sign({user}, key, {expiresIn: '30d'}, (err, token) => {
                                        res.json({
                                            status: true,
                                            msg: 'User created',
                                            token
                                        })
                                    });
                                })
                        })
                        .catch(() => res.json({
                            status: false,
                            msg: 'Error occured'
                        }))
                }
            })
    } else
        res.json({
            status: false,
            msg: 'Please fill required fields'
        })
})

module.exports = app