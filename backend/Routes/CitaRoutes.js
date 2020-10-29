const express = require("express");
const router = express.Router();
const citaController = require("../Controllers/CitaController.js");
const md_authen = require("../Middlewares/Authenticator.js");


//Routes
router.get("/", md_authen.validateToken, citaController.get);
router.get("/getById", md_authen.validateToken, citaController.getById);
router.get("/getByEstado", md_authen.validateToken, citaController.getByEstado);
router.get("/getByAgenda", md_authen.validateToken, citaController.getByAgenda);
router.post("/", md_authen.validateToken, citaController.save);
router.put("/", md_authen.validateToken, citaController.update);
router.delete("/", md_authen.validateToken, citaController.delete);
router.post("/validateTime", md_authen.validateToken, citaController.validateTime);


module.exports = router;