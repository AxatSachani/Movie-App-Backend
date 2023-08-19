const express = require('express')
const { APILOG, APIInfo } = require('../../middleware/logger')
const { adminAuth } = require('../../middleware/auth')
const { default: mongoose } = require('mongoose')
const router = express.Router()

// admin login
router.post('/admin/login', APILOG, async (req, res) => {
    let code = 400
    try {
        const msg = 'Admin Login'
        APIInfo(msg, req.method)
        const { emailID, password } = req.body
        if (!emailID || password) throw new Error('invalid data')

        const admin = await mongoose.model('admin').findByCredentials(emailID, password)
        const token = await admin.generateAuthToken()
        admin.lastlogin = Date.now()
        await admin.save()
        res.status(200).send({ code: 200, success: true, message: msg, data: { username: admin.name, emailID: emailID, userID: admin._id, token } })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})


// admin logout
router.post('/admin/logout', APILOG, adminAuth, async (req, res) => {
    let code = 400
    try {
        const msg = 'Admin Logout'
        APIInfo(msg, req.method)
        const token = req.header('Authorization')
        const { _id } = req
        await mongoose.model('admin').findByIdAndUpdate(_id, { $pull: { token: token } })
        res.status(200).send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})



module.exports = router