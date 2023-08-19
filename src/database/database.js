const mongoose = require('mongoose')
const { MongoClient } = require('mongodb')
const chalk = require('chalk')
const database = 'movies'
const url = `mongodb://127.0.0.1:27017/movies`
const client = new MongoClient(url)
client.connect()
const db = client.db(database);

let connect = false

mongoose.connect(url, {
    useNewUrlParser: true
})
    .catch(err => {
        if (err) throw new Error(err)
    })
    .then(() => {
        connect = true
        console.log(chalk.blue.bold(`'${database}' connected`));
    })

setTimeout(() => {
    if (!connect) {
        console.log(chalk.red('Error:'), (chalk.bgRed('database not connected')));
    }
}, 5000);

module.exports = { db }