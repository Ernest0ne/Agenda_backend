const express = require("express");
const router = express.Router();
const mailController = require("../Controllers/MailController.js");
const md_authen = require("../Middlewares/Authenticator.js");

router.post("/sendMail", mailController.sendMail);

module.exports = router;