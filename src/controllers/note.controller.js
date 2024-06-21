"use strict";

const NoteService = require("../services/note.service");
const { Created } = require("../../core/success.response");
class NoteController {
  createNote = async (req, res, next) => {
    new Created({
      message: "Tạo Sách Mới Thành Công",
      metadata: await NoteService.createNote(req.body),
    }).send(res);
  };
}

module.exports = new NoteController();
