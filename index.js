const express = require('express')
const chalk = require('chalk')
const moment = require('moment')

require('dotenv').config()
require('./src/database/database')
require('./src/middleware/case')
const route = require('./src/routes')

const app = express()
app.use(express.json())


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,POST,PATCH')
    res.setHeader('Access-Control-Allow-Headers', '*')
    res.setHeader('Access-Control-Allow-Credentials', '*')
    next()
})


app.use(route)

const { HOST, PORT } = process.env
const time = moment(Date.now()).format('hh:mm:ss')


app.listen(PORT, () => {
    console.log(chalk.yellow('server on => '), chalk.magenta(`http://${HOST}:${PORT}`), chalk.red(time));
});



app.get('/', async (req, res) => {
    res.status(200).send({ code: 200, success: true, message: 'server connected..!' })
})


app.get('*', async (req, res) => {
    res.status(404).send({ code: 404, success: false, message: 'api not found..!' })
});
app.post('*', async (req, res) => {
    res.status(404).send({ code: 404, success: false, message: 'api not found..!' })
});
app.delete('*', async (req, res) => {
    res.status(404).send({ code: 404, success: false, message: 'api not found..!' })
});
app.patch('*', async (req, res) => {
    res.status(404).send({ code: 404, success: false, message: 'api not found..!' })
});


