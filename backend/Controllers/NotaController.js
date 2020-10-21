const notaAgenda = {};
const conection = require('../database');
const logger = require('../bin/logger');

const moment = require('moment-timezone');
const zone = "America/Bogota"
const format = "DD-MM-YYYY HH:mm:ss";
const date = moment().tz(zone).format(format);


//methods

notaAgenda.save = async (request, response, next) => {

    const req = request.body;

    let registro = await validarRegistro(req.not_nombre, request.user.id);
    if (registro.status) {
        return response.status(200).send({ status: false, message: "Esta nota ya está registrada.", data: null });
    }

    const query = "insert into nota (not_id, not_nombre, not_descripcion, not_usuario, not_fecha_creacion)"
        + "values (now(),?,?,?,?) if not exists";
    const parameters = [req.not_nombre, req.not_descripcion, request.user.id, date];
    try {
        conection.execute(query, parameters, { prepare: true }, (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: err, data: null });
            } else if (result) {
                return response.status(200).send({ status: true, message: "Nota creada.", data: null });
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }

}


async function validarRegistro(not_nombre, not_usuario) {
    const query = "select not_id from nota where not_nombre=? and not_usuario=? allow filtering";
    try {
        return new Promise((resolve, reject) => {
            conection.execute(query, [not_nombre, not_usuario], (err, result) => {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, "message": "error in BD." });
                }
                else {
                    if (result.rows.length < 1) {
                        resolve({ status: false, "message": "No data in BD." });
                    } else {
                        let res = result.rows[0];
                        resolve({ status: true, "message": res['not_id'] });
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


notaAgenda.get = (request, response) => {
    const query = "select * from nota where not_usuario =? allow filtering";
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


notaAgenda.getById = (request, response) => {
    const req = request.headers;
    const query = "select * from nota where not_id =? and not_usuario =? allow filtering";
    try {
        conection.execute(query, [req.not_id, request.user.id], (err, result) => {
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


notaAgenda.update = async (request, response, next) => {
    const req = request.body;
    let registro = await validarRegistro(req.not_nombre, request.user.id);
    if (registro.status && registro.message != req.not_id) {
        return response.status(200).send({ status: false, message: "Esta nota ya está registrada.", data: null });
    }

    const query = "update nota set not_nombre = ?, not_descripcion = ? where not_id = ? if exists";
    const parameters = [req.not_nombre, req.not_descripcion, req.not_id];
    try {
        conection.execute(query, parameters, { prepare: true }, (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: err, data: null });
            } else if (result) {
                return response.status(200).send({ status: true, message: "Nota actualizada.", data: null });
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
}

notaAgenda.delete = (request, response) => {
    const req = request.headers;
    const query = "delete from nota where not_id =?";
    try {
        conection.execute(query, [req.not_id], (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: "error in BD.", data: null });
            } else {
                return response.status(200).send({ status: true, message: "Nota eliminada.", data: null });
            }
        });
    }
    catch (error) {
        logger.error(error.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
};

//exports
module.exports = notaAgenda;
