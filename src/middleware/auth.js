const { default: mongoose } = require("mongoose")
const jwt = require('jsonwebtoken')

// check admin authorization
const adminAuth = async (req, res, next) => {
    let code = 400
    try {
        const secret_key = process.env.AdminAuth_SECRETKEY
        const token = req.header('Authorization')
        if (!token) throw new Error('Access Token Not Found..!')

        const decoded = jwt.decode(token, secret_key)
        if (decoded.exp < Date.now() / 1000) { code = 401; throw new Error('Token Rxpired..!') }
        const admin = await mongoose.model('admin').findOne({ emailID: decoded.emailID, 'token': token })
        if (!admin) throw new Error('Unauthorized Access..!')
        req._id = decoded.id
        req.emailID = decoded.emailID
        next()
    } catch (error) {
        res.status(code).send({ code: code, success: false, error: error.message })
    }
}


// check user authorization
const userAuth = async (req, res, next) => {
    let code = 400
    try {
        const secret_key = process.env.UserAuth_SECRETKEY
        const token = req.header('Authorization')
        if (!token) throw new Error('Access Token Not Found..!')
        const decoded = jwt.decode(token, secret_key)
        if (decoded.exp < Date.now() / 1000) { code = 401; throw new Error('Token Rxpired..!') }
        const user = await mongoose.model('user').findOne({ emailID: decoded.emailID, 'token': token })
        if (!user) throw new Error('Unauthorized Access..!')
        req._id = decoded.id
        req.emailID = decoded.emailID
        next()
    } catch (error) {
        res.status(code).send({ code: code, success: false, error: error.message })
    }
}


// check user authorization
const guestAuth = async (req, res, next) => {
    let code = 400
    try {
        const secret_key = process.env.UserAuth_SECRETKEY
        const token = req.header('Authorization')
        if (token) {
            const decoded = jwt.decode(token, secret_key)
            if (decoded.exp < Date.now() / 1000) { code = 401; throw new Error('Token Rxpired..!') }
            const user = await mongoose.model('user').findOne({ emailID: decoded.emailID, 'token': token })
            if (!user) throw new Error('Unauthorized Access..!')
            req._id = decoded.id
            req.emailID = decoded.emailID
            res.isguestuser = false
        } else {
            res.isguestuser = true
        }
        next()
    } catch (error) {
        res.status(code).send({ code: code, success: false, error: error.message })
    }
}




module.exports = {
    adminAuth,
    userAuth,
    guestAuth
}