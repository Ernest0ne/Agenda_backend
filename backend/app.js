const express = require("express");
const app = express();
const cors = require("cors");
const dir = process.platform == 'win32' ? 'C:/polaris' : '/opt/polaris';
const morgan = require("morgan");
const logger = require('./bin/logger');

app.use(morgan("dev"));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    logger.info(`Service ${req.protocol}://${req.get('host')}${req.originalUrl} method: ${req.method} ip: ${req.ip}`);
    next();
});

// var whitelist = ['http://181.52.84.254:8081', 'http://54.196.144.54', 'http://54.196.144.54:8080', 'http://localhost:4200' ]
app.use(cors({
    limit: '500mb',
    extended: true,
    origin: [`http://${process.env.HOST_FRONTEND}`, `http://${process.env.HOST_FRONTEND_MEDIANET}`, "http://localhost:4200"],
    exposedHeaders: ['to-token-refresh', 'ids', 'usercodeid', 'authenticator', 'usercode', 'Pragma', 'Cache-Control', 'cache-control', 'pragma'],
}));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true }))

app.use('/static', express.static('Reports/resources'));
app.use('/photos', express.static(dir));
app.use('/downloads', express.static('Resources'));
app.use('/AppImages', express.static('AppImages'));




app.use("/Agenda/Usuario", require("./Routes/UsuarioRoutes.js"));
app.use("/Agenda/Agenda", require("./Routes/AgendaRoutes.js"));
app.use("/Agenda/Profesor", require("./Routes/ProfesorRoutes.js"));
app.use("/Agenda/Cita", require("./Routes/CitaRoutes.js"));
app.use("/Agenda/Nota", require("./Routes/NotaRoutes.js"));
app.use("/Agenda/Mail", require("./Routes/MailRoutes.js"));




module.exports = app;