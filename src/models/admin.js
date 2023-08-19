const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { _adminpassnotmatch, _adminnotfound } = require('../messages');


const AdminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        emailID: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('invalid emailID..!')
                }
            }
        },
        contact: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        token: [String],
        created: Number,
        lastlogin: Number
    }, {
    collation: {
        locale: 'en',
        strength: 2
    },
    versionKey: false,
    timestamps: { currentTime: () => Date.now(), createdAt: 'created', updatedAt: 'lastlogin' }
});


// convert password into hash format
AdminSchema.pre('save', async function (next) {
    const admin = this
    if (admin.isModified('password')) admin.password = await bcrypt.hash(admin.password, 8)
    next()
})


// verify credential for login
AdminSchema.statics.findByCredentials = async function (emailID, password) {
    const admin = await Admin.findOne({ emailID })
    if (!admin) throw new Error(_adminnotfound)
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) throw new Error(_adminpassnotmatch)
    admin.lastlogin = Date.now()
    await admin.save()
    return admin
}

// generate token
AdminSchema.methods.generateAuthToken = async function () {
    const secret_key = process.env.AdminAuth_SECRETKEY
    const admin = this
    const token = jwt.sign({ id: admin._id.toString(), emailID: admin.emailID.toString(), logintime: Date.now() }, secret_key, { expiresIn: 18000 })
    admin.token.push(token)
    await admin.save()
    return token
}


const Admin = mongoose.model('admin', AdminSchema)
module.exports = {
    Admin
};
