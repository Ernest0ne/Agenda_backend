const agendaAgenda = {};
const conection = require('../database');
const logger = require('../bin/logger');

const moment = require('moment-timezone');
const zone = "America/Bogota"
const format = "DD-MM-YYYY HH:mm:ss";

//methods

agendaAgenda.save = async (request, response, next) => {

    const req = request.body;
    const date = moment().tz(zone).format(format);

    let registro = await validarRegistro(req.age_nombre, request.user.id);
    if (registro.status) {
        return response.status(200).send({ status: false, message: "Esta Agenda ya está registrada.", data: null });
    }

    const query = "insert into agenda (age_id, age_nombre, age_descripcion, age_usuario, age_fecha_creacion) values (now(),?,?,?,?) if not exists";
    const parameters = [req.age_nombre, req.age_descripcion, request.user.id, date];
    try {
        conection.execute(query, parameters, { prepare: true }, (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: err, data: null });
            } else if (result) {
                return response.status(200).send({ status: true, message: "Agenda creada.", data: null });
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }

}


async function validarRegistro(age_nombre, age_usuario) {
    const query = "select age_id from agenda where age_nombre=? and age_usuario=? allow filtering";
    try {
        return new Promise((resolve, reject) => {
            conection.execute(query, [age_nombre, age_usuario], (err, result) => {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, "message": "error in BD." });
                }
                else {
                    if (result.rows.length < 1) {
                        resolve({ status: false, "message": "No data in BD." });
                    } else {
                        let res = result.rows[0];
                        resolve({ status: true, "message": res['age_id'] });
                    }
                }
            });

        });
    }
    catch (error) {
        logger.error(error.stack);
        resolve({ status: false, "message": "Error in process." });
    }
}


agendaAgenda.get = (request, response) => {
    const query = "select * from agenda where age_usuario =? allow filtering";
    try {
        conection.execute(query, [request.user.id], (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: "error in BD.", data: null });
            } else {
                return response.status(200).send({ status: true, message: "Éxito.", data: result.rows });
            }
        });
    }
    catch (error) {
        logger.error(error.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
};


agendaAgenda.getById = (request, response) => {
    const req = request.headers;
    const query = "select * from agenda where age_id =? and age_usuario =? allow filtering";
    try {
        conection.execute(query, [req.age_id, request.user.id], (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: "error in BD.", data: null });
            } else {
                return response.status(200).send({ status: true, message: "Éxito.", data: result.rows });
            }
        });
    }
    catch (error) {
        logger.error(error.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
};


agendaAgenda.update = async (request, response, next) => {
    const req = request.body;
    let registro = await validarRegistro(req.age_nombre, request.user.id);
    if (registro.status && registro.message != req.age_id) {
        return response.status(200).send({ status: false, message: "Esta Agenda ya está registrada.", data: null });
    }

    const query = "update agenda set age_nombre = ?, age_descripcion = ? where age_id = ? if exists";
    const parameters = [req.age_nombre, req.age_descripcion, req.age_id];
    try {
        conection.execute(query, parameters, { prepare: true }, (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: err, data: null });
            } else if (result) {
                return response.status(200).send({ status: true, message: "Agenda actualizada.", data: null });
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
}

agendaAgenda.delete = (request, response) => {
    const req = request.headers;
    const query = "delete from agenda where age_id =?";
    try {
        conection.execute(query, [req.age_id], (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: "error in BD.", data: null });
            } else {
                return response.status(200).send({ status: true, message: "Agenda eliminada.", data: null });
            }
        });
    }
    catch (error) {
        logger.error(error.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
};

//exports
module.exports = agendaAgenda;
