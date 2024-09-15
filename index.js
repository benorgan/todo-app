const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')

require('dotenv').config()

const app = express()
const port = process.env.PORT || 4000

const loggedIn = (req, res, next) => {
    if (req.user) {
        next()
    } else {
        res.redirect('/app/login.html')
    }
}

const authRouter = require('./routers/authRouter')
const todoRouter = require('./routers/todoRouter')

app.use(cors())
app.use(express.json())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}))

app.use(passport.session())

app.use('/app', express.static('public'))
app.use('/auth', authRouter)
app.use('/', loggedIn, todoRouter)

app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status ?? 500).send(err)
})

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)

        app.listen(port, () => {
            console.log(`Todo backend listening on ${port}`)
        })
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

start()