const { Schema, default: mongoose } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const UserSchema = new Schema(
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
            required: true,
            validate(value) {
                if (value.length < 6) throw new Error('password must be contain atleast 6 characters')
                if (value.toLowerCase().includes('password')) throw new Error(`Password can not contain ${value}`)
                if (value.endsWith(' ')) throw new Error(`Password can not end with space (' ') `)
            }
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
    return user //.username, user.emailID, user.role,user._id
}

// generate token
UserSchema.methods.generateAuthToken = async function () {
    const secret_key = process.env.UserAuth_SECRETKEY
    const user = this
    const token = jwt.sign({ id: user.emailID.toString() }, secret_key, { expiresIn: 18000 })
    user.token.push(token)
    await user.save()
    return token
}


const user = mongoose.model('user', UserSchema)
module.exports = {
    user
}