const express = require('express')
const passport = require('passport')
const crypto = require('crypto')

const LocalStrategy = require('passport-local')

const { User } = require('../models')

const router = express.Router()

passport.use(new LocalStrategy(async function verify(username, password, callback) {
    try {
        const user = await User.findOne({ username })

        if (!user) {
            return callback(null, false, { message: 'Incorrect username or password.' })
        }

        crypto.pbkdf2(password, Buffer.from(user.passwordSalt, 'base64'), 310000, 32, 'sha256', function (error, hashedPassword) {
            if (error) {
                return callback(error)
            }

            if (!crypto.timingSafeEqual(Buffer.from(user.passwordHash, 'base64'), hashedPassword)) {
                return callback(null, false, { message: 'Incorrect username or password.' })
            }
            return callback(null, user)
        })
    } catch (error) {
        return callback(error)
    }
}))

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user._id,
            username: user.username,
        })
    })
})

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user)
    })
})

router.post('/register', async (req, res, next) => {

    if (!req.body.username || !req.body.password) {
        return next('Username and password are required to register')
    }

    const user = await User.findOne({ username: req.body.username })

    if (user) {
        return next('Username already exists')
    }

    const salt = crypto.randomBytes(16)

    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function (error, hashedPassword) {
        if (error) {
            return next('Error while creating password hash')
        }

        try {
            const user = await User.create({
                username: req.body.username,
                passwordSalt: salt.toString('base64'),
                passwordHash: hashedPassword.toString('base64')
            })

            if (!user) {
                return next('Error while creating user')
            }

            req.login(user, function (error) {
                if (error) {
                    return next(error)
                }
                res.redirect('/app')
            })
        } catch (error) {
            return next(error)
        }
    })
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/app',
    failureRedirect: '/app/login.html'
}))

router.post('/logout', async (req, res, next) => {
    req.logout((error) => {
        if (error) {
            return next(error)
        }
        res.redirect('/app/login.html')
    })
})

module.exports = router