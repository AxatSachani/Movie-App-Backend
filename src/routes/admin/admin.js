const express = require('express')
const { APILOG, APIInfo } = require('../../middleware/logger')
const { adminAuth } = require('../../middleware/auth')
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcrypt')
const { adminloginpost_, adminlogoutpost_, adminpassresetpost_ } = require('../../endpoints')
const { _invaliddata, _passlengthvalidate, _passcasevalidate, _passvalidate, _datanotmatch, _passoldvalidate, _adminlogin, _adminlogout, _adminpassreset } = require('../../messages')
const { AdminActivity } = require('../../middleware/activity')
const router = express.Router()

// admin login
router.post(adminloginpost_, APILOG, async (req, res) => {
    let code = 400
    try {
        const msg = _adminlogin
        APIInfo(msg, req.method)
        const { emailID, password } = req.body
        if (!emailID || password) { code = 400; throw new Error(_invaliddata) }

        const admin = await mongoose.model('admin').findByCredentials(emailID, password)
        const token = await admin.generateAuthToken()
        AdminActivity({ module: 'admin', action: 'login', method: req.method, title: `${emailID} login`, ip: req.ip, from: admin._id, emailID })
        res.status(200).send({ code: 200, success: true, message: msg, data: { username: admin.name, emailID: emailID, userID: admin._id, token } })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})


// admin logout
router.post(adminlogoutpost_, APILOG, adminAuth, async (req, res) => {
    let code = 400
    try {
        const msg = _adminlogout
        APIInfo(msg, req.method)
        const token = req.header('Authorization')
        const { _id, emailID } = req
        await mongoose.model('admin').findByIdAndUpdate(_id, { $pull: { token: token } })
        AdminActivity({ module: 'admin', action: 'logout', method: req.method, title: `${emailID} logout`, ip: req.ip, from: _id, emailID })
        res.status(200).send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})


// admin reset password
router.post(adminpassresetpost_, APILOG, adminAuth, async (req, res) => {
    let code = 400
    try {
        const msg = _adminpassreset
        APIInfo(msg, req.method)
        const { emailID, password, newPassword } = req.body
        const { _id } = req
        if (!emailID || password || !newPassword) { code = 400; throw new Error(_invaliddata) }
        if (password.toLowerCase() == newPassword.toLowerCase()) { code = 400; throw new Error(_passvalidate) }

        if (newPassword.length < 6) throw new Error(_passlengthvalidate)
        if (newPassword.endsWith(' ')) throw new Error(_passcasevalidate)

        const admin = await mongoose.model('admin').findOne({ emailID: emailID.trim() })
        if (!admin) { code = 404; throw new Error(_datanotmatch) }
        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) throw new Error(_passoldvalidate)
        admin.password = newPassword
        await admin.save()
        AdminActivity({ module: 'admin', action: 'reset password', method: req.method, title: `${emailID} reset password`, ip: req.ip, from: _id, emailID })
        res.status(200).send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})



module.exports = router