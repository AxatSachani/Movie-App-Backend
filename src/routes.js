const normalizedPath = require('path').join(__dirname, 'models');
require('fs-extra').readdirSync(normalizedPath).forEach(file => require('./models/' + file))



//admin route
const AdminRoute = require('./routes/admin/admin')
const AdminMovieRoute = require('./routes/admin/movie')




//user route
const UserRoute = require('./routes/user/user')
const UserMovieRoute = require('./routes/user/movie')



module.exports = [
    //admin routes
    AdminRoute, AdminMovieRoute,

    // user route
    UserRoute, UserMovieRoute
]