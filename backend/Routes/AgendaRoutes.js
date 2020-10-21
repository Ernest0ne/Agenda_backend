const express = require("express");
const router = express.Router();
const agendaController = require("../Controllers/AgendaController.js");
const md_authen = require("../Middlewares/Authenticator.js");


//Routes
router.get("/", md_authen.validateToken, agendaController.get);
router.get("/getById", md_authen.validateToken, agendaController.getById);
router.post("/", md_authen.validateToken, agendaController.save);
router.put("/", md_authen.validateToken, agendaController.update);
router.delete("/", md_authen.validateToken, agendaController.delete);


module.exports = router;