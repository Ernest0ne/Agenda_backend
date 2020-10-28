const usuarioAgenda = {};
const jwt = require("../Services/Jwt.js");
//Importamos el modulo paraa encriptar las contraseñas
const bcrypt = require('bcrypt');
const conection = require('../database');
const logger = require('../bin/logger');
const bin = require('../bin/funcionesGenerales');

const moment = require('moment-timezone');
const zone = "America/Bogota"
const format = "DD-MM-YYYY HH:mm:ss";
const date = moment().tz(zone).format(format);


//methods

usuarioAgenda.save = (req, res, next) => {
    var req = req.body;
    const query = "insert into usuario (usu_id, usu_nombre, usu_apellido, usu_fecha_creacion, usu_clave, usu_correo, usu_tipo) values (now(),?,?,?,?,?,?) if not exists";
    try {
        bcrypt.hash(req.usu_clave, 10, function (err, hash) {
            if (err) {
                logger.error(err.stack);
                res.status(200).send({ status: false, message: 'encryption error' });
            } else {
                const parameters = [req.usu_nombre, req.usu_apellido, date, hash, req.usu_correo, req.usu_tipo];
                conection.execute(query, parameters, function (err2, result) {
                    if (err2) {
                        logger.error(err2.stack);
                        res.status(200).send({ status: false, message: err2 });
                        return;
                    } else {
                        if (Object.values(result.rows[0])[0]) {
                            res.status(200).send({ status: true, message: "success", applied: Object.values(result.rows[0])[0] });
                        } else {
                            res.status(200).send({ status: false, message: "error", applied: Object.values(result.rows[0])[0] });
                            return;
                        }
                    }
                });
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        res.status(200).send({ status: false, error: "catch error" });
    }
}

usuarioAgenda.update = async (request, response, next) => {
    const req = request.body;

    const query = "update usuario set usu_nombre = ?, usu_apellido = ? where usu_id = ? if exists";
    const parameters = [req.usu_nombre, req.usu_apellido, request.user.id];
    try {
        conection.execute(query, parameters, { prepare: true }, (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: err, data: null });
            } else if (result) {
                return response.status(200).send({ status: true, message: "Usuario actualizado.", data: null });
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
}


usuarioAgenda.logIn = async (req, res) => {
    var req = req.body;
    let result = await validateLogin(req);
    res.status(200).send(result);
};

async function validateLogin(req) {
    return new Promise(async (resolve, reject) => {
        try {
            const query = "select * from usuario where usu_correo = ? ALLOW FILTERING";
            const parameters = [req.usu_login.toLowerCase()];
            conection.execute(query, parameters, function (err, result) {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, message: 'error', error: err });
                } else {
                    if (result.rowLength > 0) {
                        bcrypt.compare(req.usu_clave, result.rows[0].usu_clave, (err, data) => {
                            if (data) {
                                let token = jwt.createToken(result.rows[0]);
                                delete result.rows[0].usu_clave
                                resolve({
                                    token: token,
                                    message: "success",
                                    usuario: result.rows[0],
                                    status: true
                                });
                            } else {
                                resolve({ status: false, message: "Contraseña inválida" });
                            }
                        });
                    } else {
                        resolve({ status: false, message: "Usuario inválido" });
                    }
                }
            });
        } catch (ex) {
            logger.error(ex.stack);
            return { status: false, error: "catch error" };
        }
    });
}

usuarioAgenda.updatePassword = async (req, res) => {
    var req = req.body;
    let result = await validateLogin(req);
    if (result.status === false) {
        res.status(200).send(result);
        return;
    }
    res.status(200).send(await updatePasswordMethod(req, result.usuario));
}


async function updatePasswordMethod(req, usuario) {
    return new Promise(async (resolve, reject) => {
        try {
            const query = "update usuario set usu_clave = ? where usu_id = ? if exists";
            bcrypt.hash(req.usu_clave_nueva, 10, function (err, hash) {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, message: 'encryption error' });
                } else {
                    const parameters = [hash, usuario.usu_id];
                    conection.execute(query, parameters, function (err2, result) {
                        if (err2) {
                            logger.error(err2.stack);
                            resolve({ status: false, message: err2 });
                            return;
                        } else {
                            if (Object.values(result.rows[0])[0]) {
                                resolve({ status: true, message: "Clave actualizada.", applied: Object.values(result.rows[0])[0] });
                            } else {
                                resolve({ status: false, message: "error", applied: Object.values(result.rows[0])[0] });
                                return;
                            }
                        }
                    });
                }
            });
        } catch (ex) {
            logger.error(ex.stack);
            return { status: false, error: "catch error" };
        }
    });
}


usuarioAgenda.resetPassword = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await getByCorreo(req);
            if (result.status === false) {
                resolve(result);
                return;
            }
            let resultgenerarTextoAleatorio = await bin.generarTextoAleatorio();
            if (resultgenerarTextoAleatorio.status == false) {
                resolve(resultgenerarTextoAleatorio);
            }

            let nuevaClave = resultgenerarTextoAleatorio.data
            nuevaClave = nuevaClave.substring(nuevaClave.length - 30, nuevaClave.length)

            req.usu_clave_nueva = nuevaClave;
            let resultUpdatePassword = await updatePasswordMethod(req, result.data)
            if (resultUpdatePassword.status === false) {
                resolve(resultUpdatePassword);
                return;
            }

            result.data.usu_clave_nueva = nuevaClave;
            resultUpdatePassword.data = result.data;

            resolve(resultUpdatePassword);
        } catch (ex) {
            logger.error(ex.stack);
            return { status: false, error: "catch error", data: null };
        }
    });
}



async function getByCorreo(req) {
    return new Promise(async (resolve, reject) => {
        try {
            const query = "select * from usuario where usu_correo = ? ALLOW FILTERING";
            const parameters = [req.usu_login.toLowerCase()];
            conection.execute(query, parameters, function (err, result) {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, message: "Error.", data: err });
                } else {
                    if (result.rowLength > 0) {
                        resolve({ status: true, message: "Éxito.", data: result.rows[0] });
                    } else {
                        resolve({ status: false, message: "Usuario inválido.", data: null });
                    }
                }
            });
        } catch (ex) {
            logger.error(ex.stack);
            return { status: false, error: "catch error", data: null };
        }
    });
}


//exports
module.exports = usuarioAgenda;
