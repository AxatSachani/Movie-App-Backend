const express = require('express')
const { APILOG, APIInfo } = require('../../middleware/logger')
const { userAuth } = require('../../middleware/auth')
const { default: mongoose } = require('mongoose')
const router = express.Router()


//movie list




module.exports = router