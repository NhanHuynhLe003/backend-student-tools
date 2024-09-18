"use strict";

const MailService = require("../services/mail.service");
const { Created, SuccessResponse } = require("../../core/success.response");
class MailController {
  sendMail = async (req, res, next) => {
    new SuccessResponse({
      message: "Gửi Email Thành Công!",
      metadata: await MailService.sendEmail(req.body),
    }).send(res);
  };
}

module.exports = new MailController();
