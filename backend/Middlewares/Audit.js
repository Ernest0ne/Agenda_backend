"use strict"
const conection = require("../database.js");
const moment = require("moment");
const logger = require('../bin/logger');

exports.ensureAuth = (req) => {
    try {
        const date = moment().format("LLL");
        const ip = req.headers.ip.replace(/['"]+/g, "");
        const view = req.headers.view.replace(/['"]+/g, "");
        const action = req.action;
        const user = req.user.code;
        const before = req.before;
        const after = req.after;
        const client = req.headers.client.replace(/['"]+/g, "");
        //cql
        const query = "insert into audit (audi_id,audi_action,audi_after,audi_before,audi_client,audi_date,audi_ip,audi_user,audi_view) values (now(),?,?,?,?,?,?,?,?)";
        //parameters
        const parametros = [action, after, before, client, date, ip, user, view];
        //execute
        conection.execute(query, parametros, { prepare: true }, (err, result) => {});
    } catch (ex) {
        logger.error(ex);
    }
};