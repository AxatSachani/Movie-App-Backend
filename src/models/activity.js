const { ObjectId } = require('mongodb')
const { Schema, default: mongoose } = require('mongoose')

const AdminActivitySchema = new Schema({
    module: String,
    action: String,
    method: String,
    title: String,
    description: String,
    ip: String,
    from: { type: ObjectId, ref: 'admin' },
    emailID: String,
    time: Number,
}, {
    collation: {
        locale: 'en',
        strength: 2
    },
    versionKey: false,
    timestamps: { currentTime: () => Date.now(), createdAt: 'time' }
})




const UserActivitySchema = new Schema({
    module: String,
    action: String,
    method: String,
    title: String,
    description: String,
    ip: String,
    from: { type: ObjectId, ref: 'user' },
    emailID: String,
    time: Number,
}, {
    collation: {
        locale: 'en',
        strength: 2
    },
    versionKey: false,
    timestamps: { currentTime: () => Date.now(), createdAt: 'time' }
})

const AdminActivity = mongoose.model('adminactivity', AdminActivitySchema)
const UserActivity = mongoose.model('useractivity', UserActivitySchema)

module.exports = {
    AdminActivity, UserActivity
}