const { createLogger, transports, config } = require('winston');
const moment = require('moment');
const chalk = require('chalk')


const LOG = createLogger({
    levels: config.syslog.levels,
    transports: [
        new transports.File({ filename: `./log/api/${moment(Date.now()).format('DD-MM-YYYY')}.log` })
    ]
});
const APILOG = (req, res, next) => {
    const { ip, url } = req
    LOG.info({ api: url, time: moment(Date.now()).format('DD/MM/YYYY h:mm:ss A'), timestamp: Date.now(), ip: ip.substring(ip.lastIndexOf(':') + 1, ip.length) })
}
const APIInfo = (msg, operation) => {
    let color = 'blueBright'
    if (operation == 'insert') color = 'yellowBright'
    if (operation == 'read') color = 'greenBright'
    if (operation == 'update') color = 'cyanBright'
    if (operation == 'delete') color = 'redBright'
    console.log(chalk.italic('call :'), chalk[color](msg))
};

module.exports = {
    APILOG: APILOG,
    APIInfo: APIInfo
}