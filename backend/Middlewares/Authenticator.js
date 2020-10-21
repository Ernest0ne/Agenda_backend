"use strict"

const middlewares = [];
const jwt = require("jwt-simple");
const moment = require("moment");
const secret = "misterioso_secreto";
const conection = require('../database');
const logger = require('../bin/logger');

middlewares.ensureAuthGeneric = async (req, res, next) => {
    if (!req.headers.authenticator || !req.headers.view || !req.headers.ip || !req.headers.client) {
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: "fail" });
    };

    const token = req.headers.authenticator.replace(/['"]+/g, "");

    try {
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            logger.info(`token ha expirado ${payload}`);
            return res.status(200).send({ message: "token ha expirado", status: "fail" });
        }

        req.user = payload;
        if (payload.id) {
            let resultUser = await userExists(payload.id);
            if (resultUser) {
                next();
            }

        } else {
            res.status(200).send({ message: "false token", status: "fail" });
            return;
        }
    } catch (ex) {
        logger.error(ex);
        return res.status(200).send({ message: "token no valido", status: "fail" });
    }
};

middlewares.ensureAuthPost = async (req, res, next) => {
    if (!req.headers.authenticator || !req.headers.view || !req.headers.ip || !req.headers.client) {
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: "fail" });
    };

    const token = req.headers.authenticator.replace(/['"]+/g, "");

    try {
        var payload = jwt.decode(token, secret);
        let time = moment().unix();

        if (payload.exp <= time)
            return res.status(200).send({ message: "token ha expirado", status: "fail" });

        if (payload.id) {
            let resultUser = await userExists(payload.id);
            if (resultUser) {
                req.user = payload;
                return next();
            }
        }

        res.status(200).send({ message: "false token", status: "fail" });

    } catch (ex) {
        logger.error(ex);
        return res.status(200).send({ message: "token no valido", status: "fail" });
    }
};

middlewares.ensureAuthGet = async (req, res, next) => {
    if (!req.headers.authenticator || !req.headers.id) {
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: "fail", res: req.headers });
    };

    const token = req.headers.authenticator.replace(/['"]+/g, "");

    try {
        var payload = jwt.decode(token, secret);
        let time = moment().unix();

        if (payload.exp <= time) {
            return res.status(200).send({ message: "token ha expirado", status: "fail" });
        }

        if (payload.id) {
            let resultUser = await userExists(payload.id);
            if (resultUser) {
                req.user = payload;
                return next();
            }
        }

        res.status(200).send({ message: "false token", status: "fail" });

    } catch (ex) {
        logger.error(ex);
        return res.status(200).send({ message: "token no valido", status: "fail" });
    }
};

middlewares.ensureAuthGetAll = async (req, res, next) => {
    if (!req.headers.authenticator) {
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: "fail" });
    }
    const token = req.headers.authenticator.replace(/['"]+/g, "");

    try {
        var payload = jwt.decode(token, secret);
        let time = moment().unix();

        if (payload.exp <= time) {
            return res.status(200).send({ message: "el token expiro", status: "fail" });
        }

        if (payload.id) {
            let resultUser = await userExists(payload.id);
            if (resultUser) {
                req.user = payload;
                return next();
            }
        }

        return res.status(200).send({ message: "token no valido", status: "fail" });

    } catch (ex) {
        logger.error();
        return res.status(200).send({ message: "token no valido", status: "fail" });
    }
};

middlewares.ensureAuthGetAllAndroid = async (req, res, next) => {
    if (!req.headers.authenticator)
        return res.json({ message: "parametros de la cabecera incompletos", status: "fail" });

    const token = req.headers.authenticator.replace(/['"]+/g, "");

    try {
        var payload = jwt.decode(token, secret);
        let time = moment().unix();

        if (payload.exp <= time) return res.json({ message: "el token expiro", status: "fail" });

        if (payload.id) {
            let resultUser = await userExists(payload.id);
            if (resultUser) {
                req.user = payload;
                return next();
            }
        }

        return res.json({ message: "token no valido", status: "fail" });

    } catch (ex) {
        logger.error(ex);
        return res.json({ message: "token no valido", status: "fail" });
    }
};

middlewares.ensureAuthRegister = async (req, res, next) => {
    if (!req.headers.authenticator) {
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: "fail" });
    };
    try {
        var crypto = require('crypto');
        var hash = crypto.createHash('md5').update("polaris2019").digest("hex");
        if (req.headers.authenticator == String(hash)) {
            next();
        } else {
            res.status(200).send({ message: "false token", status: "fail" });
            return;
        }
    } catch (ex) {
        logger.error(ex);
        return res.status(200).send({ message: "token no valido", status: "fail" });
    }
};

middlewares.ensureAuthGetAllCommerce = async (req, res, next) => {
    if (!req.headers.authenticator) {
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: "fail" });
    }

    const query = "select * from user_commerce where usco_id = ?";
    const token = req.headers.authenticator.replace(/['"]+/g, "");
    try {
        var payload = jwt.decode(token, secret);
        if (payload.exp <= moment().unix()) {
            logger.info(`token ha expirado ${token}`);
            logger.info(`${payload}`);
            res.status(200).send({ message: "token ha expirado", status: "fail" });
            return;
        }
        req.user = payload;
        if (payload.id) {
            let resultUser = await queryUser(query, payload.id);
            if (resultUser) {
                next();
            }
        } else {
            res.status(200).send({ message: "false token", status: "fail" });
            return;
        }
    } catch (ex) {
        logger.error(ex);
        res.status(200).send({ message: "token no valido", status: "fail" });
        return;
    }
};

/**
 * Meddleware para el manejo de sesión, validación de tokens y manejo de redis 
 */
// !req.headers.authenticator
// ensureAuthGetAll => ensureAuthGetAllAndroid
middlewares.validateSesion = async (req, res, next) => {
    if (!req.headers.authenticator)
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: "fail" });

    const token = req.headers.authenticator.replace(/['"]+/g, "");

    try {
        var payload = jwt.decode(token, secret);
        let time = moment().unix();

        if (payload.exp <= time) return res.status(200).send({ message: "el token expiro", status: "fail" });

        if (payload.id) {
            req.user = payload;
            return next();
        }

        return res.status(200).send({ message: "token no valido", status: "fail", data: "No" });
    } catch (ex) {
        console.log(ex);
        console.log(token);
        console.log(ex);
        console.log("token no valido");
        return res.status(200).send({ message: "token no valido", status: "fail", data: "Entro por el catch" });
    }
}

// !req.headers.view || !req.headers.ip || !req.headers.client
// ensureAuthGeneric => ensureAuthPost
middlewares.validateHeadersExtras = (req, res, next) => {
    if (!req.headers.view || !req.headers.ip || !req.headers.client)
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: "fail" });
    next();
}

// !req.headers.id
// ensureAuthGet
middlewares.validateHeaderId = (req, res, next) => {
    if (!req.headers.id)
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: "fail", res: req.headers });
    next();
}

async function userExists(user_id) {
    try {
        const query = "select * from user where user_identification = ?";
        return new Promise((resolve, reject) => {
            conection.execute(query, [user_id], (err, result) => {
                if (err) {
                    logger.error(err);
                    reject(false);
                } else {
                    if (result.rows.length > 0) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                }
            });
        });
    } catch (error) {
        logger.error(error);
        res.status(200).send({ message: "invalid token", status: "fail" });
        return;
    }
};

async function queryUser(query, user_id) {
    try {
        return new Promise((resolve, reject) => {
            conection.execute(query, [user_id], (err, result) => {
                if (err) {
                    reject(false);
                } else {
                    if (result.rows.length > 0) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                }
            });
        });
    } catch (error) {
        console.log(error);
        res.status(200).send({ message: "invalid token", status: "fail" });
        return;
    }
};



middlewares.validateToken = async (req, res, next) => {
    if (!req.headers.authenticator) {
        return res.status(200).send({ message: "la peticion no tiene completa la cabecera de autentificacion", status: false });
    };
    const token = req.headers.authenticator.replace(/['"]+/g, "");
    try {
        var payload = jwt.decode(token, secret);
        let time = moment().unix();
        if (payload.exp <= time)
            return res.status(200).send({ message: "token ha expirado", status: false });
        if (payload.id) {
            let resultUser = await validateUser(payload.id);
            if (resultUser) {
                req.user = payload;
                return next();
            }
        }
        return res.status(200).send({ message: "false token", status: false });
    } catch (ex) {
        logger.error(ex);
        return res.status(200).send({ message: "token no valido", status: false });
    }
};

async function validateUser(user_id) {
    try {
        const query = "select * from usuario where usu_id = ?";
        return new Promise((resolve, reject) => {
            conection.execute(query, [user_id], (err, result) => {
                if (err) {
                    logger.error(err);
                    reject(false);
                } else {
                    if (result.rows.length > 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            });
        });
    } catch (error) {
        logger.error(error);
        res.status(200).send({ message: "invalid token", status: false });
        return;
    }
};




module.exports = middlewares;