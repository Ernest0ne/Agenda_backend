const citaAgenda = {};
const conection = require('../database');
const logger = require('../bin/logger');

const moment = require('moment-timezone');
const zone = "America/Bogota"
const format = "DD-MM-YYYY HH:mm:ss";

const profesorController = require("../Controllers/ProfesorController.js");
const bin = require('../bin/funcionesGenerales');



//methods

citaAgenda.save = async (request, response, next) => {

    const req = request.body;
    const date = moment().tz(zone).format(format);

    let registro = await validarRegistro(req.cit_nombre, request.user.id, req.cit_fecha_agendada);
    if (registro.status) {
        return response.status(200).send({ status: false, message: "Esta Cita ya está registrada.", data: null });
    }

    const query = "insert into cita (cit_id, cit_nombre, cit_descripcion, cit_estado, cit_calificacion, cit_comentario, cit_profesores, "
        + "cit_agenda, cit_usuario, cit_fecha_creacion, cit_fecha_agendada, cit_hora_inicio, cit_hora_fin, cit_lugar) values (now(),?,?,?,?,?,?,?,?,?,?,?,?,?) if not exists";
    const parameters = [req.cit_nombre, req.cit_descripcion, req.cit_estado, req.cit_calificacion, req.cit_comentario,
    req.cit_profesores, req.cit_agenda, request.user.id, date, req.cit_fecha_agendada, req.cit_hora_inicio, req.cit_hora_fin, req.cit_lugar];
    try {
        conection.execute(query, parameters, { prepare: true }, (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: err, data: null });
            } else if (result) {
                EnviarEmailCrearCita(req);
                return response.status(200).send({ status: true, message: "Cita creada.", data: null });
            }
        });
    } catch (ex) {
        logger.error(ex.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }

}


async function validarRegistro(cit_nombre, cit_usuario, cit_fecha_agendada) {
    const query = "select cit_id from cita where cit_nombre=? and cit_usuario=? and cit_fecha_agendada=? allow filtering";
    try {
        return new Promise((resolve, reject) => {
            conection.execute(query, [cit_nombre, cit_usuario, cit_fecha_agendada], (err, result) => {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, "message": "error in BD." });
                }
                else {
                    if (result.rows.length < 1) {
                        resolve({ status: false, "message": "No data in BD." });
                    } else {
                        let res = result.rows[0];
                        resolve({ status: true, "message": res['cit_id'] });
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


citaAgenda.get = (request, response) => {
    const query = "select * from cita where cit_usuario =? allow filtering";
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


citaAgenda.getById = async (request, response) => {
    response.status(200).send(await getByIdMethod(request));
};


citaAgenda.getByEstado = async (request, response) => {
    response.status(200).send(await getByEstadoMethod(request));
};


citaAgenda.getByAgenda = async (request, response) => {

    //Se creo el siguiente index para poder buscar por id de agenda
    //CREATE INDEX ON cita (keys(cit_agenda));
    //la sentencia CONTAINS busca algun valor dentro del mapa que conincida con la id de la agenda
    await validarCitasPerdidas();
    const req = request.headers;
    const query = "select * from cita where cit_agenda CONTAINS? and cit_usuario =? allow filtering";
    try {
        conection.execute(query, [req.cit_age_id, request.user.id], { prepare: true }, (err, result) => {
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


citaAgenda.update = async (request, response, next) => {
    const req = request.body;
    let registro = await validarRegistro(req.cit_nombre, request.user.id, req.cit_fecha_agendada);
    if (registro.status && registro.message != req.cit_id) {
        return response.status(200).send({ status: false, message: "Esta Cita ya está registrada.", data: null });
    }
    EnviarEmailActualizarCita(req)
    response.status(200).send(await updateCitaMethod(req));
}

citaAgenda.delete = async (request, response) => {
    let result = await getByIdMethod(request);
    if (!result.status) {
        return response.status(200).send(result);
    }
    EnviarEmailEliminarCita(result.data[0])
    const req = request.headers;
    const query = "delete from cita where cit_id =?";
    try {
        conection.execute(query, [req.cit_id], (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: "error in BD.", data: null });
            } else {
                return response.status(200).send({ status: true, message: "Cita eliminada.", data: null });
            }
        });
    }
    catch (error) {
        logger.error(error.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
};

citaAgenda.validateTime = async (request, response) => {
    const req = request.body;
    const query = "select * from cita where cit_fecha_agendada = ? allow filtering";
    const parameters = [req.cit_fecha_agendada];
    try {
        conection.execute(query, parameters, async (err, result) => {
            if (err) {
                logger.error(err.stack);
                return response.status(200).send({ status: false, message: "error in BD.", data: null });
            } else {
                let data = result.rows;
                let citas = await validarFechasCita(req, data);
                return response.status(200).send({ status: true, message: "Éxito.", data: citas });
            }
        });
    }
    catch (error) {
        logger.error(error.stack);
        response.status(200).send({ status: false, message: "Not Acceptable.", data: null });
    }
};



async function validarFechasCita(req, data) {
    let fechaInicioReq = moment(req.cit_fecha_agendada, "DD-MM-YYYY").set(
        {
            "hour": req.cit_hora_inicio.split(":")[0],
            "minute": req.cit_hora_inicio.split(":")[1]
        })
    let fechaFinReq = moment(req.cit_fecha_agendada, "DD-MM-YYYY").set(
        {
            "hour": req.cit_hora_fin.split(":")[0],
            "minute": req.cit_hora_fin.split(":")[1]
        })
    return new Promise((resolve, reject) => {
        let citas = [];
        data.forEach(element => {
            let fechaInicio = moment(element.cit_fecha_agendada, "DD-MM-YYYY").set(
                {
                    "hour": element.cit_hora_inicio.split(":")[0],
                    "minute": element.cit_hora_inicio.split(":")[1]
                })

            let fechaFin = moment(element.cit_fecha_agendada, "DD-MM-YYYY").set(
                {
                    "hour": element.cit_hora_fin.split(":")[0],
                    "minute": element.cit_hora_fin.split(":")[1]
                })

            if ((fechaInicioReq.isSameOrBefore(fechaFin) && fechaInicioReq.isSameOrAfter(fechaInicio))
                || (fechaFinReq.isSameOrBefore(fechaFin) && fechaFinReq.isSameOrAfter(fechaInicio))
                || (fechaInicioReq.isSameOrBefore(fechaInicio) && fechaFinReq.isSameOrAfter(fechaFin))
                || (fechaInicioReq.isSameOrAfter(fechaInicio) && fechaFinReq.isSameOrBefore(fechaFin))) {
                citas.push(element);
            }
        });
        resolve({ data: citas });
    });
}



citaAgenda.recordarCitas = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await getAll();
            let citas = [];
            if (result.status) {
                for (let index = 0; index < result.data.length; index++) {
                    const element = result.data[index];
                    let fechaAgendada = moment(element.cit_fecha_agendada, "DD-MM-YYYY")
                    let fechaActual = moment().tz(zone);
                    if (fechaAgendada.diff(fechaActual, 'days') === 6) {
                        let profesores = await profesorController.getAllByIds(element.cit_profesores);
                        element.cit_profesores_extended = profesores.data
                        await citas.push(element);
                    }
                }
                resolve({ status: true, message: "Exito.", data: citas });
            }

        } catch (error) {
            logger.error(error.stack);
            resolve({ status: false, message: "Not Acceptable.", data: null });
        }
    });
}


async function getAll() {
    const query = "select * from cita";
    return new Promise((resolve, reject) => {
        try {
            conection.execute(query, [], (err, result) => {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, message: "error in BD.", data: null });
                } else {
                    resolve({ status: true, message: "Éxito.", data: result.rows });
                }
            });
        } catch (error) {
            logger.error(error.stack);
            resolve({ status: false, message: "Not Acceptable.", data: null });
        }
    });
}

async function getByIdMethod(request) {
    const req = request.headers;
    const query = "select * from cita where cit_id =? and cit_usuario =? allow filtering";
    return new Promise((resolve, reject) => {
        try {
            conection.execute(query, [req.cit_id, request.user.id], (err, result) => {
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

async function getByEstadoMethod(request) {
    const req = request.headers;
    const query = "select * from cita where cit_estado =? and cit_usuario =? allow filtering";
    return new Promise((resolve, reject) => {
        try {
            conection.execute(query, [req.cit_estado, request.user.id], (err, result) => {
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


async function EnviarEmailCrearCita(cita) {
    return new Promise(async (resolve, reject) => {
        let profesores = await profesorController.getAllByIds(cita.cit_profesores);
        for (let index = 0; index < profesores.data.length; index++) {
            const element = profesores.data[index];
            let data = cita
            data.email_imagen = bin.obtenerImagenEmail(1)
            data.email_texto = 'te invito al siguiente evento.'
            data.cit_fecha_agendada_formateada = bin.formatearFechaDescriptiva(cita.cit_fecha_agendada)
            let plantilla = 'NuevaCita'
            let subject = 'Agendapp: ' + cita.cit_nombre
            data.cit_destinatario = element.pro_nombre + ' ' + element.pro_apellido + ','
            let destinatario = element.pro_correo.toLowerCase()
            const mailController = require("../Controllers/MailController.js");
            let result = await mailController.crearCitaEmail(data, plantilla, subject, destinatario)
        }
        resolve({ status: true, message: "Éxito.", data: null });
    });
}

async function EnviarEmailActualizarCita(cita) {
    return new Promise(async (resolve, reject) => {
        if (cita.cit_estado === 'AGENDADA') {
            let profesores = await profesorController.getAllByIds(cita.cit_profesores);
            for (let index = 0; index < profesores.data.length; index++) {
                const element = profesores.data[index];
                let data = cita
                data.email_imagen = bin.obtenerImagenEmail(2)
                data.email_texto = 'este evento ha tenido algunos cambios, a continuación esta la informacion actualizada.'
                data.cit_fecha_agendada_formateada = bin.formatearFechaDescriptiva(cita.cit_fecha_agendada)
                let plantilla = 'NuevaCita'
                let subject = 'Agendapp: ' + cita.cit_nombre
                data.cit_destinatario = element.pro_nombre + ' ' + element.pro_apellido + ','
                let destinatario = element.pro_correo.toLowerCase()
                const mailController = require("../Controllers/MailController.js");
                let result = await mailController.crearCitaEmail(data, plantilla, subject, destinatario)
            }
        }
        resolve({ status: true, message: "Éxito.", data: null });
    });
}


async function EnviarEmailEliminarCita(cita) {
    return new Promise(async (resolve, reject) => {
        if (cita.cit_estado === 'AGENDADA') {
            let profesores = await profesorController.getAllByIds(cita.cit_profesores);
            for (let index = 0; index < profesores.data.length; index++) {
                const element = profesores.data[index];
                let data = cita
                data.email_imagen = bin.obtenerImagenEmail(4)
                data.email_texto = 'este evento ha sido cancelado.'
                data.cit_fecha_agendada_formateada = bin.formatearFechaDescriptiva(cita.cit_fecha_agendada)
                let plantilla = 'NuevaCita'
                let subject = 'Agendapp: ' + cita.cit_nombre
                data.cit_destinatario = element.pro_nombre + ' ' + element.pro_apellido + ','
                let destinatario = element.pro_correo.toLowerCase()
                const mailController = require("../Controllers/MailController.js");
                let result = await mailController.crearCitaEmail(data, plantilla, subject, destinatario)
            }
        }
        resolve({ status: true, message: "Éxito.", data: null });
    });
}

async function updateCitaMethod(req) {
    return new Promise(async (resolve, reject) => {
        const query = "update cita set cit_nombre = ?, cit_descripcion = ?, cit_estado = ?, cit_fecha_agendada = ?, " +
            "cit_profesores = ?, cit_calificacion = ?, cit_comentario = ?, cit_hora_inicio = ?, cit_hora_fin = ?, cit_lugar = ? where cit_id = ? if exists";
        const parameters = [req.cit_nombre, req.cit_descripcion, req.cit_estado, req.cit_fecha_agendada, req.cit_profesores,
        req.cit_calificacion, req.cit_comentario, req.cit_hora_inicio, req.cit_hora_fin, req.cit_lugar, req.cit_id];
        try {
            conection.execute(query, parameters, { prepare: true }, (err, result) => {
                if (err) {
                    logger.error(err.stack);
                    resolve({ status: false, message: err, data: null });
                } else if (result) {
                    resolve({ status: true, message: "Cita actualizada.", data: null });
                }
            });
        } catch (ex) {
            logger.error(ex.stack);
            resolve({ status: false, message: "Not Acceptable.", data: null });
        }
    });
}



async function validarCitasPerdidas() {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await getAll();
            let citas = [];
            if (result.status) {
                for (let index = 0; index < result.data.length; index++) {
                    const element = result.data[index];
                    let fechaAgendada = moment(element.cit_fecha_agendada, "DD-MM-YYYY").set(
                        {
                            "hour": element.cit_hora_inicio.split(":")[0],
                            "minute": element.cit_hora_inicio.split(":")[1]
                        })
                    let fechaActual = moment().tz(zone);
                    if (fechaAgendada.isSameOrBefore(fechaActual) && element.cit_estado === 'AGENDADA') {
                        element.cit_estado = 'PERDIDA'
                        await updateCitaMethod(element)
                    }
                }
                resolve({ status: true, message: "Exito.", data: citas });
            }
        } catch (error) {
            logger.error(error.stack);
            resolve({ status: false, message: "Not Acceptable.", data: null });
        }
    });
}

citaAgenda.filter = async (request, response) => {
    response.status(200).send(await filterMethod(request));
};

async function filterMethod(request) {
    return new Promise((resolve, reject) => {
        const req = request.headers;
        let query = "select * from cita where cit_agenda CONTAINS? and cit_usuario =? ";
        if (req.cit_estado) query += 'and cit_estado =? '
        query += 'allow filtering'

        let parameters = [req.cit_agenda, request.user.id]
        if (req.cit_estado) parameters.push(req.cit_estado)

        try {
            conection.execute(query, parameters, { prepare: true }, (err, result) => {
                if (err) {
                    logger.error(err.stack);
                    console.log(err.stack);
                    resolve({ status: false, message: "error in BD.", data: null });
                } else {
                    let citas = [];
                    if (req.cit_fecha_agendada_inicio && req.cit_fecha_agendada_fin) {
                        let fechaAgendadaInicio = moment(req.cit_fecha_agendada_inicio, "DD-MM-YYYY")
                        let fechaAgendadaFin = moment(req.cit_fecha_agendada_fin, "DD-MM-YYYY")
                        for (let index = 0; index < result.rows.length; index++) {
                            const element = result.rows[index];
                            let fechaAgendada = moment(element.cit_fecha_agendada, "DD-MM-YYYY")
                            if (fechaAgendada.isSameOrBefore(fechaAgendadaFin) && fechaAgendada.isSameOrAfter(fechaAgendadaInicio)) {
                                citas.push(element)
                            }
                        }
                    } else {
                        citas = result.rows
                    }
                    resolve({ status: true, message: "Éxito.", data: citas });
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
module.exports = citaAgenda;
