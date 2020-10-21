const mailController = {};
const fs = require('fs-extra');
const path = require('path');
const hbs = require('handlebars');
const logger = require('../bin/logger');
const bin = require('../bin/funcionesGenerales');
const citaController = require("../Controllers/CitaController.js");


var host = process.platform == 'win32' ? `http://${process.env.IP_HOST}:4200/#/` : `http://${process.env.IP_HOST}/#`

var correoOrigen = "daniielquiinteros@gmail.com"
var clave = "daQuin0818"

const compileMailers = async function (templateName, data) {
    const filepath = path.join(process.cwd(), 'Mails', `${templateName}.hbs`);
    const html = await fs.readFile(filepath, 'utf-8');
    return await hbs.compile(html)(data);
}

mailController.sendMail = async (request, response) => {
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


mailController.validarRecordatorioCita = async () => {

    let citas = await citaController.recordarCitas()

    citas.data.forEach(element => {
        console.log(element);
    });

}



async function enviarEmailRecordatorioCita(req) {
    return new Promise(async (resolve, reject) => {
        try {
            req.cit_fecha_agendada_formateada = bin.formatearFechaDescriptiva(req.cit_fecha_agendada)
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
                    subject: 'Tienes una nueva cita: ' + req.cit_nombre,
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




//exports
module.exports = mailController;