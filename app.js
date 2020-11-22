//GLOBAL VARIABLES
const express = require('express')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 5000
const app = express()

//DB SETUP
mongoose.connect('mongodb+srv://redus:redis06122002!@cluster0-xwsm9.mongodb.net/redos-transfers?retryWrites=true&w=majority', {useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Error connecting to MongoDb'));

//MiddleWares
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//ROUTES
app.use('/api/users', require('./routes/users'))
app.use('/api/transfers', require('./routes/transfers'))
app.use('/api/notifications', require('./routes/notifications'))

//LISTEN
app.listen(PORT, () => console.log(`Server started at port: ${PORT}`))