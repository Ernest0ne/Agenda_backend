"use strict"

const jwt = require("jwt-simple");
const moment = require("moment");
const secret = "misterioso_secreto";

exports.createToken = (usuario) => {
    const payload = {
        id: usuario.usu_id,
        name: usuario.usu_nombre,
        email: usuario.usu_fecha_creacion,
        iat: moment().unix(),
        exp: moment().add(9, "hours").unix()
    }
    return jwt.encode(payload, secret);
};

exports.createTokenCommerce = (user) => {
    const payload = {
        id: user.usco_id,
        name: user.usco_name,
        phone: user.usco_phone,
        cellphone: user.usco_cellphone,
        iat: moment().unix(),
        exp: moment().add(9, "hours").unix()
    }
    return jwt.encode(payload, secret);
};