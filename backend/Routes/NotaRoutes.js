const express = require("express");
const router = express.Router();
const notaController = require("../Controllers/NotaController.js");
const md_authen = require("../Middlewares/Authenticator.js");


//Routes
router.get("/", md_authen.validateToken, notaController.get);
router.get("/getById", md_authen.validateToken, notaController.getById);
router.post("/", md_authen.validateToken, notaController.save);
router.put("/", md_authen.validateToken, notaController.update);
router.delete("/", md_authen.validateToken, notaController.delete);


module.exports = router;