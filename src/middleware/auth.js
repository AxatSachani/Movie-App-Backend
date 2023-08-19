const { default: mongoose } = require("mongoose")

// check admin authorization
const adminAuth = async (req, res, next) => {
    let code = 400
    try {
        const secret_key = process.env.AdminAuth_SECRETKEY
        const token = req.header('Authorization')
        if (!token) throw new Error('access token not found..!')
        const decoded = jwt.decode(token, secret_key)
        if (decoded.exp < Date.now() / 1000) { code = 401; throw new Error('token expired..!') }
        const admin = await mongoose.model('admin').findOne({ emailID: decoded.emailID, 'token': token })
        if (!admin) throw new Error('unauthorized access..!')
        req._id = decoded._id
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
        if (!token) throw new Error('access token not found..!')
        const decoded = jwt.decode(token, secret_key)
        if (decoded.exp < Date.now() / 1000) { code = 401; throw new Error('token expired..!') }
        const user = await mongoose.model('user').findOne({ emailID: decoded.emailID, 'token': token })
        if (!user) throw new Error('unauthorized access..!')
        req._id = decoded._id
        req.emailID = decoded.emailID
        next()
    } catch (error) {
        res.status(code).send({ code: code, success: false, error: error.message })
    }
}



module.exports = {
    adminAuth,
    userAuth
}