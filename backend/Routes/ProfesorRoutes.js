const express = require("express");
const router = express.Router();
const profesorController = require("../Controllers/ProfesorController.js");
const md_authen = require("../Middlewares/Authenticator.js");


//Routes
router.get("/", md_authen.validateToken, profesorController.get);
router.get("/getById", md_authen.validateToken, profesorController.getById);
router.post("/", md_authen.validateToken, profesorController.save);
router.put("/", md_authen.validateToken, profesorController.update);
router.delete("/", md_authen.validateToken, profesorController.delete);


module.exports = router;