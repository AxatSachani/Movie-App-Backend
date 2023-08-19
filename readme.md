# Movie App

Movie and Series Management Application with Authentication, File Upload, and
API Features. The application should allow users to perform CRUD operations on movies and
series, including authentication, file upload, and other API features.

## Features

- Two different role Admin and User.
- Admin can create, update, read and delete the movies.
- User can read and sort, filter and search movie by title, genre.

## Installationlone the repository: `git https://github.com/AxatSachani/Movie-App-Backend.git`

1. Install dependencies: `npm install` (or any other package manager you're using)
3. Start the application: `npm start`
4. Connect with your local mongodb or create a cluster from [MongoDB](https://account.mongodb.com/account/login) and update in database file

## Extra Features

1. Bunny CDN: All movies media like poster, banner images all the media will store on cdn storage
   open cdn media link e.g `https://movieapp.b-cdn.net` + image path which is store in databse.
2. API Authantication : API Authanticationwith JWT token to secure the API endpoint and use for multiple role access.
3. Activity Log : Activity logs of actions performed by both users and admini![1692449580114](image/readme/1692449580114.png).
   This feature will be valuable for auditing, troubleshooting, and monitoring user behavior and admin activities.

## Technologies Used

- Nodejs and ExpressJS for the server-side.
- MongoDB database for the data storage .
