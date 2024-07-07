"use strict";

const NoteService = require("../services/note.service");
const { Created } = require("../../core/success.response");
class NoteController {
  createOriginNote = async (req, res, next) => {
    new Created({
      message: "Tạo Note Gốc Mới Thành Công",
      metadata: await NoteService.createOriginNote(req.body),
    }).send(res);
  };

  addChildNote = async (req, res, next) => {
    new Created({
      message: "Thêm Note mới Thành Công",
      metadata: await NoteService.addChildNote(req.body),
    }).send(res);
  };

  getNoteById = async (req, res, next) => {
    new Created({
      message: "Lấy Sách Thành Công",
      metadata: await NoteService.getNoteById(req.params),
    }).send(res);
  };

  getAllNotesByUser = async (req, res, next) => {
    new Created({
      message: "Lấy Tất Cả Sách Thành Công",
      metadata: await NoteService.getAllNotesByUser(req.params),
    }).send(res);
  };

  getNoteByName = async (req, res, next) => {
    new Created({
      message: "Lấy Sách Theo Tên Thành Công",
      metadata: await NoteService.getNoteByName(req.body),
    }).send(res);
  };

  updateNote = async (req, res, next) => {
    new Created({
      message: "Cập Nhật Sách Thành Công",
      metadata: await NoteService.updateNote({
        ...req.body,
        ...req.params,
      }),
    }).send(res);
  };

  deleteNote = async (req, res, next) => {
    new Created({
      message: "Xóa Sách Thành Công",
      metadata: await NoteService.deleteNote(req.params),
    }).send(res);
  };

  updateNoteLevel = async (req, res, next) => {
    new Created({
      message: "Cập Nhật Level Sách Thành Công",
      metadata: await NoteService.updateNoteLevel({
        ...req.body,
        ...req.params,
      }),
    }).send(res);
  };

  layNhungNoteOntapHomNay = async (req, res, next) => {
    new Created({
      message: "Lấy Note Hôm Nay Thành Công",
      metadata: await NoteService.layNhungNoteOntapHomNay(req.body),
    }).send(res);
  };

  getNoteByLevel = async (req, res, next) => {
    new Created({
      message: "Lấy Note Theo Level Thành Công",
      metadata: await NoteService.getNoteByLevel(req.params),
    }).send(res);
  };
}

module.exports = new NoteController();
