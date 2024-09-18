const express = require("express");
const MailController = require("../../controllers/mail.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

router.post("", asyncHandleError(MailController.sendMail));

router.use(authentication);

module.exports = router;
