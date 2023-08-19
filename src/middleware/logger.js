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
    next()
}
const APIInfo = (msg, method) => {
    let color = 'blueBright'
    if (method.toLowerCase() == 'post') color = 'yellowBright'
    if (method.toLowerCase() == 'get') color = 'greenBright'
    if (method.toLowerCase() == 'patch') color = 'cyanBright'
    if (method.toLowerCase() == 'delete') color = 'redBright'
    console.log(chalk.italic('call :'), chalk[color](msg))
};

module.exports = {
    APILOG: APILOG,
    APIInfo: APIInfo
}