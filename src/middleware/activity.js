const mongoose = require('mongoose')
const { _invaliddata } = require('../messages')

const AdminActivity = async ({ module, action, method, title, description, ip, from, emailID }) => {

    if (!module || !action || !method || !title || !ip || !from || !emailID) throw new Error(_invaliddata)

    ip = ip.substring(ip.lastIndexOf(':') + 1, ip.length)
    await mongoose.model('adminactivity')({ module, action, method, title, description, ip, from, emailID }).save()

}




const UserActivity = async ({ module, action, method, title, description, ip, from, emailID }) => {

    if (!module || !action || !method || !title || !ip || !from || !emailID) throw new Error(_invaliddata)

    ip = ip.substring(ip.lastIndexOf(':') + 1, ip.length)
    await mongoose.model('useractivity')({ module, action, method, title, description, ip, from, emailID }).save()

}



module.exports = {
    AdminActivity, UserActivity
}