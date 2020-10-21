const { createLogger, format, transports } = require('winston');

module.exports = createLogger({
    format: format.combine(
        format.simple(),
        format.timestamp(), 
        format.printf(info => `[${new Date()}] ${info.level} ${info.message}`)
    ),
    transports: [
        new transports.File({
            maxsize: 5120000,
            maxFiles: 10,
            filename: `${__dirname}/../logs/log-api.log`
        }),
        new transports.Console({
            level: 'debug',
        })
    ]
})