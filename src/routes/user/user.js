const express = require('express')
const { APILOG, APIInfo } = require('../../middleware/logger')
const { userAuth } = require('../../middleware/auth')
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcrypt')
const { usersignuppost_, userloginpost_, userlogoutpost_, userpassresetpost_ } = require('../../endpoints')
const { _usersignup, _invaliddata, _usersignupemailunique, _usersignin, _usersignout, _userpassreset, _passvalidate, _passlengthvalidate, _passcasevalidate, _datanotmatch, _passoldvalidate } = require('../../messages')
const { UserActivity } = require('../../middleware/activity')
const router = express.Router()


// user signup
router.post(usersignuppost_, APILOG, async (req, res) => {
    let code = 400
    try {
        const msg = _usersignup
        APIInfo(msg, req.method)
        const { name, emailID, contact, password } = req.body
        if (!name || !emailID || !password) { code = 400; throw new Error(_invaliddata) }
        const checkDuplicate = await mongoose.model('user').findOne({ emailID: emailID.trim() })
        if (checkDuplicate) { code = 404; throw new Error(_usersignupemailunique) }
        const data = {
            name: name,
            emailID: emailID,
            contact: contact,
            password: password
        }
        const user = await mongoose.model('user')(data).save()
        const token = await user.generateAuthToken()

        UserActivity({ module: 'user', action: 'signup', method: req.method, title: `${emailID} signup`, ip: req.ip, from: user._id, emailID })

        res.status(200).send({ code: 200, success: true, message: msg, data: { username: user.name, emailID: emailID, userID: user._id, token } })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})

// user login
router.post(userloginpost_, APILOG, async (req, res) => {
    let code = 400
    try {
        const msg = _usersignin
        APIInfo(msg, req.method)
        const { emailID, password } = req.body
        if (!emailID || !password) { code = 400; throw new Error(_invaliddata) }
        const user = await mongoose.model('user').findByCredentials(emailID, password)
        const token = await user.generateAuthToken()

        UserActivity({ module: 'user', action: 'login', method: req.method, title: `${emailID} login`, ip: req.ip, from: user._id, emailID })
        res.status(200).send({ code: 200, success: true, message: msg, data: { username: user.name, emailID: emailID, userID: user._id, token } })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})

// user logout
router.post(userlogoutpost_, APILOG, userAuth, async (req, res) => {
    let code = 400
    try {
        const msg = _usersignout
        APIInfo(msg, req.method)
        const token = req.header('Authorization')
        const { _id, emailID } = req
        await mongoose.model('user').findByIdAndUpdate(_id, { $pull: { token: token } })

        UserActivity({ module: 'user', action: 'logout', method: req.method, title: `${emailID} logout`, ip: req.ip, from: user._id, emailID })
        res.status(200).send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})



// user reset password
router.post(userpassresetpost_, APILOG, userAuth, async (req, res) => {
    let code = 400
    try {
        const msg = _userpassreset
        APIInfo(msg, req.method)
        const { emailID, password, newPassword } = req.body
        if (!emailID || password || !newPassword) { code = 400; throw new Error(_invaliddata) }
        if (password.toLowerCase() == newPassword.toLowerCase()) { code = 400; throw new Error(_passvalidate) }

        if (newPassword.length < 6) throw new Error(_passlengthvalidate)
        if (newPassword.endsWith(' ')) throw new Error(_passcasevalidate)

        const user = await mongoose.model('user').findOne({ emailID: emailID.trim() })
        if (!user) { code = 404; throw new Error(_datanotmatch) }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw new Error(_passoldvalidate)
        user.password = newPassword
        await user.save()
        UserActivity({ module: 'user', action: 'reset password', method: req.method, title: `${emailID} reset password`, ip: req.ip, from: user._id, emailID })
        res.status(200).send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})



module.exports = router