const CronJob = require('./cron.js').CronJob;
const conection = require('../database');
const logger = require('../bin/logger');
const mailController = require("../Controllers/MailController.js");


/* const job = new CronJob('* * * * *', function () { */

const job = new CronJob('* * * * *', function () {

  const d = new Date();
  try {
    console.log("Entroo");
    mailController.validarRecordatorioCita()

  } catch (ex) {
    logger.error(ex.stack);
  }
});


job.start();
