const normalizedPath = require('path').join(__dirname, 'models');
require('fs-extra').readdirSync(normalizedPath).forEach(file => require('./models/' + file))



//admin route





//user route



module.exports = [
    //admin routes

    // user route
]