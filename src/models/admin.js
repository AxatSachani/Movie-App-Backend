const { Schema, default: mongoose } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const AdminSchema = new Schema(
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
AdminSchema.pre('save', async function (next) {
    const admin = this
    if (admin.isModified('password')) admin.password = await bcrypt.hash(admin.password, 8)
    next()
})

// verify credential for login
AdminSchema.statics.findByCredentials = async function (emailID, password) {
    const admin = await mongoose.model('admin').findOne({ emailID })
    if (!admin) throw new Error('admin not found..!')
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) throw new Error('invalid password..!')
    admin.lastlogin = Date.now()
    await admin.save()
    return admin //.username, admin.emailID, admin.role,admin._id
}

// generate token
AdminSchema.methods.generateAuthToken = async function () {
    const secret_key = process.env.AdminAuth_SECRETKEY
    const admin = this
    const token = jwt.sign({ id: admin.emailID.toString() }, secret_key, { expiresIn: 18000 })
    admin.token.push(token)
    await admin.save()
    return token
}


const Admin = mongoose.model('admin', AdminSchema)
module.exports = {
    Admin
}