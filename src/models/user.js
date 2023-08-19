const { Schema, default: mongoose } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const UserSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
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
})



// convert password into hash format
UserSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 8)
    next()
})

// verify credential for login
UserSchema.statics.findByCredentials = async function (emailID, password) {
    const user = await mongoose.model('user').findOne({ emailID })
    if (!user) throw new Error('user not found..!')
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('invalid password..!')
    user.lastlogin = Date.now()
    await user.save()
    return { name: user.name, _id: user._id }
}

// generate token
UserSchema.methods.generateAuthToken = async function () {
    const secret_key = process.env.UserAuth_SECRETKEY
    const user = this
    const token = jwt.sign({ id: user._id.toString(), emailID: user.emailID.toString(), logintime: Date.now() }, secret_key, { expiresIn: 18000 })
    user.token.push(token)
    await user.save()
    return token
}


const user = mongoose.model('user', UserSchema)
module.exports = {
    user
}