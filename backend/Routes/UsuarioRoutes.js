const express = require("express");
const router = express.Router();
const usuarioController = require("../Controllers/UsuarioController.js");
const md_authen = require("../Middlewares/Authenticator.js");
const md_audit = require("../Middlewares/Audit.js");
const mailController = require('../Controllers/MailController.js');

//Routes
router.post("/", md_authen.validateToken, usuarioController.save);
router.post("/logIn", usuarioController.logIn);
router.post("/updatePassword", usuarioController.updatePassword);


module.exports = router;