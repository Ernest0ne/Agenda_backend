const express = require("express");
const router = express.Router();
const mailController = require("../Controllers/MailController.js");
const md_authen = require("../Middlewares/Authenticator.js");

router.post("/sendMail", mailController.sendMail);
router.post("/resetClave", mailController.resetClave);

module.exports = router;