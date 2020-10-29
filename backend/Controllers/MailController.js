const mailAgenda = {};
const fs = require('fs-extra');
const path = require('path');
const hbs = require('handlebars');
const logger = require('../bin/logger');
const bin = require('../bin/funcionesGenerales');
const citaController = require("../Controllers/CitaController.js");
const usuarioController = require("../Controllers/UsuarioController");


var host = process.platform == 'win32' ? `http://${process.env.IP_HOST}:4200/#/` : `http://${process.env.IP_HOST}/#`

var correoOrigen = "daniielquiinteros@gmail.com"
var clave = "daQuin0818"

const compileMailers = async function (templateName, data) {
    const filepath = path.join(process.cwd(), 'Mails', `${templateName}.hbs`);
    const html = await fs.readFile(filepath, 'utf-8');
    return await hbs.compile(html)(data);
}

mailAgenda.sendMail = async (request, response) => {
    try {
        result = await enviarEmailCitaAgendada(request.body)
        if (result.status) {
            return response.status(200).send(result);
        } else {
            return response.status(200).send(result);
        }
    } catch (error) {
        return response.status(200).send({ status: false, message: "error in BD.", data: null });
    }
}

async function enviarEmailCitaAgendada(req) {
    return new Promise(async (resolve, reject) => {
        try {
            req.cit_fecha_agendada_formateada = bin.formatearFechaDescriptiva(req.cit_fecha_agendada)
            req.cit_nombre_profesor = 'Daniel Quintero'
            var html = await compileMailers('NuevaCita', {
                data: req
            });
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: correoOrigen,
                    pass: clave
                }
            });
            req.cit_profesores.forEach(element => {
                var mailOptions = {
                    from: correoOrigen,
                    to: element,
                    subject: 'Agendapp: ' + req.cit_nombre,
                    html: html
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        logger.error(error.stack);
                        resolve({ status: false, message: "Mail error.", data: null });
                    }
                });
            });
            resolve({ status: true, message: "Mail enviado.", data: null });
        } catch (error) {
            resolve({ status: false, message: "Catch error.", data: null });
            logger.error(error.stack);
        }
    });
}


mailAgenda.validarRecordatorioCita = async () => {
    return new Promise(async (resolve, reject) => {
        let citas = await citaController.recordarCitas()
        for (let index = 0; index < citas.data.length; index++) {
            const element = citas.data[index];
            let data = element
            data.email_imagen = bin.obtenerImagenEmail(3)
            data.email_texto = 'paso a recordarte que tienes una cita la próxima semana.'
            data.cit_fecha_agendada_formateada = bin.formatearFechaDescriptiva(element.cit_fecha_agendada)
            let plantilla = 'NuevaCita'
            let subject = 'Agendapp: ' + element.cit_nombre

            for (let aux = 0; aux < element.cit_profesores_extended.length; aux++) {
                const profesor = element.cit_profesores_extended[aux];
                data.cit_destinatario = profesor.pro_nombre + ' ' + profesor.pro_apellido + ','
                await enviarEmail(data, plantilla, subject, profesor.pro_correo.toLowerCase());
            }
        }
        resolve(citas);
    });
}



async function enviarEmail(data, plantilla, subject, destinatario) {
    return new Promise(async (resolve, reject) => {
        try {
            var html = await compileMailers(plantilla, {
                data: data
            });
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: correoOrigen,
                    pass: clave
                }
            });
            var mailOptions = {
                from: correoOrigen,
                to: destinatario,
                subject: subject,
                html: html
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    logger.error(error.stack);
                    resolve({ status: false, message: "Mail error.", data: null });
                }
                resolve({ status: true, message: "Mail enviado.", data: info });
            });
        } catch (error) {
            resolve({ status: false, message: "Catch error.", data: null });
            logger.error(error.stack);
        }
    });
}


mailAgenda.resetClave = async (request, response) => {
    try {
        result = await ResetClaveMethod(request.body)
        response.status(200).send(result);
    } catch (error) {
        return response.status(200).send({ status: false, message: "error in BD.", data: null });
    }
}


async function ResetClaveMethod(request) {
    return new Promise(async (resolve, reject) => {
        try {

            let result = await usuarioController.resetPassword(request);
            let data = result.data
            let plantilla = 'ResetClave'
            let subject = 'Agendapp: Recupera tu contraseña'
            let destinatario = request.usu_login.toLowerCase()
            let resultEnviarEmail = await enviarEmail(data, plantilla, subject, destinatario);

            resolve(resultEnviarEmail);

        } catch (error) {
            resolve({ status: false, message: "Catch error.", data: null });
            logger.error(error.stack);
        }
    });
}


mailAgenda.crearCitaEmail = async (data, plantilla, subject, destinatario) => {
    return await enviarEmail(data, plantilla, subject, destinatario)
}


//exports
module.exports = mailAgenda;