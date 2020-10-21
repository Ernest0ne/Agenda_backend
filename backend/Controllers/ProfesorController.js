const profesorAgenda = {};
const conection = require('../database');
const logger = require('../bin/logger');

const moment = require('moment-timezone');
const zone = "America/Bogota"
const format = "DD-MM-YYYY HH:mm:ss";
const date = moment().tz(zone).format(format);


//methods

profesorAgenda.save = async (request, response, next) => {

    const req = request.body;

    let registro = await validarRegistro(req.pro_correo, request.user.id);
    if (registro.status) {
        return response.status(200).send({ status: false, message: "Este correo ya está registrado.", data: null });
    }

    const query = "insert into profesor (pro_id, pro_nombre, pro_apellido, pro_correo, pro_facultad, pro_departamento, pro_usuario, pro_fecha_creacion)"
        + "values (now(),?,?,?,?,?,?,?) if not exists";
    const parameters = [req.pro_nombre, req.pro_apellido, req.pro_correo, req.pro_facultad, req.pro_departamento, request.user.id, date];
    try {
        conection.execute(query, parameters, { prepare: true }, (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: err, data: null });
            } else if (result) {
                return response.status(200).send({ status: true, message: "Profesor creado.", data: null });
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }

}


async function validarRegistro(pro_correo, pro_usuario) {
    const query = "select pro_id from profesor where pro_correo=? and pro_usuario=? allow filtering";
    try {
        return new Promise((resolve, reject) => {
            conection.execute(query, [pro_correo, pro_usuario], (err, result) => {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, "message": "error in BD." });
                }
                else {
                    if (result.rows.length < 1) {
                        resolve({ status: false, "message": "No data in BD." });
                    } else {
                        let res = result.rows[0];
                        resolve({ status: true, "message": res['pro_id'] });
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


profesorAgenda.get = (request, response) => {
    const query = "select * from profesor where pro_usuario =? allow filtering";
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


profesorAgenda.getById = (request, response) => {
    const req = request.headers;
    const query = "select * from profesor where pro_id =? and pro_usuario =? allow filtering";
    try {
        conection.execute(query, [req.pro_id, request.user.id], (err, result) => {
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


profesorAgenda.update = async (request, response, next) => {
    const req = request.body;
    let registro = await validarRegistro(req.pro_nombre, request.user.id);
    if (registro.status && registro.message != req.pro_id) {
        return response.status(200).send({ status: false, message: "Esta correo ya está registrado.", data: null });
    }

    const query = "update profesor set pro_nombre = ?, pro_apellido = ?, pro_facultad = ?, pro_departamento = ?, pro_correo = ? where pro_id = ? if exists";
    const parameters = [req.pro_nombre, req.pro_apellido, req.pro_facultad, req.pro_departamento, req.pro_correo, req.pro_id];
    try {
        conection.execute(query, parameters, { prepare: true }, (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: err, data: null });
            } else if (result) {
                return response.status(200).send({ status: true, message: "Profesor actualizado.", data: null });
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
}

profesorAgenda.delete = (request, response) => {
    const req = request.headers;
    const query = "delete from profesor where pro_id =?";
    try {
        conection.execute(query, [req.pro_id], (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: "error in BD.", data: null });
            } else {
                return response.status(200).send({ status: true, message: "Profesor eliminado.", data: null });
            }
        });
    }
    catch (error) {
        logger.error(error.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
};



profesorAgenda.getAllByIds = async (ids) => {
    return await getByIds(ids)
};


async function getByIds(ids) {
    const query = "select * from profesor where pro_id IN?";
    return new Promise((resolve, reject) => {
        try {
            conection.execute(query, [ids], (err, result) => {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, message: "error in BD.", data: null });
                } else {
                    resolve({ status: true, message: "Éxito.", data: result.rows });
                }
            });
        }
        catch (error) {
            logger.error(error.stack);
            resolve({ status: false, message: "Not Acceptable.", data: null });
        }
    });
}


//exports
module.exports = profesorAgenda;
