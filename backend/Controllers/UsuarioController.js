const usuarioAgenda = {};
const jwt = require("../Services/Jwt.js");
//Importamos el modulo paraa encriptar las contraseñas
const bcrypt = require('bcrypt');
const conection = require('../database');
const logger = require('../bin/logger');

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


usuarioAgenda.logIn = async (req, res) => {
    var req = req.body;
    const query = "select * from usuario where usu_correo = ? ALLOW FILTERING";
    try {
        const parameters = [req.usu_login.toLowerCase()];
        conection.execute(query, parameters, function (err, result) {
            if (err) {
                logger.error(err.stack);
                res.status(200).send({ status: false, message: 'error', error: err });
            } else {
                if (result.rowLength > 0) {
                    bcrypt.compare(req.usu_clave, result.rows[0].usu_clave, (err, data) => {
                        if (data) {
                            let token = jwt.createToken(result.rows[0]);
                            res.status(200).send({
                                token: token,
                                message: "success",
                                nombre: result.rows[0].usu_nombre,
                                rol: result.rows[0].usu_rol,
                                status: true
                            });
                        } else {
                            res.status(200).send({ status: false, message: "Contraseña inválida" });
                        }
                    });
                } else {
                    res.status(200).send({ status: false, message: "Usuario inválido" });
                }
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        res.status(404).send({ status: false, error: "catch error" });
    }
};



//exports
module.exports = usuarioAgenda;
