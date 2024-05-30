"use strict";

const NoteService = require("../services/note.service");
const { SuccessResponse } = require("../../core/success.response");

class NoteController {
  sayHello = async (req, res, next) => {
    new SuccessResponse({
      message: "Say Hello !",
      metadata: await NoteService.sayHello({ dataInfo: req.body.payload }),
    }).send(res);
  };
}

module.exports = new NoteController();
