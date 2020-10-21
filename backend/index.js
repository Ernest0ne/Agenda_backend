const app = require('./app');
const logger = require('./bin/logger');
const c = require('colors');
require('dotenv').config();

const server = app.listen(process.env.PORT || 3000, () => {
  const moment = require('moment-timezone');
  const zone = "America/Bogota"
  const format = "DD-MM-YYYY HH:mm:ss";
  const date = moment().tz(zone).format(format);
  
  logger.info("corriendo express en el puerto " + process.env.PORT || 3000 + " fecha: " + date);
  
  console.log(c.blue(`corriendo express`) + c.red(`${process.env.IP_HOST || 'localhost'}:${process.env.PORT || '3000'}`) + "fecha:" + c.yellow(date));
});

server.setTimeout(12000000);

require('./scheduledTask/recordatorioCita');

