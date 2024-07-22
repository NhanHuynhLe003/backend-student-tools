"use strict";

const NoteService = require("../services/note.service");
const { Created, SuccessResponse } = require("../../core/success.response");
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
    new SuccessResponse({
      message: "Lấy Sách Thành Công",
      metadata: await NoteService.getNoteById(req.params),
    }).send(res);
  };

  getAllNotesByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy Tất Cả Sách Thành Công",
      metadata: await NoteService.getAllNotesByUser({
        note_userId: req.params.note_userId,
        ...req.query,
      }),
    }).send(res);
  };

  getNoteByName = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy Sách Theo Tên Thành Công",
      metadata: await NoteService.getNoteByName(req.body),
    }).send(res);
  };

  layNhungNoteGocAdmin = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy Tòan Bộ Note Gốc Thành Công",
      metadata: await NoteService.layNhungNoteGocAdmin(req.query),
    }).send(res);
  };

  updateNote = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập Nhật Sách Thành Công",
      metadata: await NoteService.updateNote({
        id: req.params.id,
        payload: req.body,
      }),
    }).send(res);
  };

  deleteNote = async (req, res, next) => {
    new SuccessResponse({
      message: "Xóa Sách Thành Công",
      metadata: await NoteService.deleteNote({
        id: req.params.id,
        note_userId: req.query.note_userId,
      }),
    }).send(res);
  };

  getNotesDeletedByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy Sách Đã Xóa Thành Công",
      metadata: await NoteService.getNotesDeletedByUser({
        note_userId: req.params.userId,
      }),
    }).send(res);
  };

  getNotesDeletedByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy Sách Đã Xóa Thành Công",
      metadata: await NoteService.getNotesDeletedByUser({
        userId: req.params.userId,
      }),
    }).send(res);
  };

  updateNoteLevel = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập Nhật Level Sách Thành Công",
      metadata: await NoteService.updateNoteLevel({
        ...req.body,
        ...req.params,
      }),
    }).send(res);
  };

  layNhungNoteOntapHomNay = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy Note Hôm Nay Thành Công",
      metadata: await NoteService.layNhungNoteOntapHomNay({
        note_userId: req.params.note_userId,
        note_parentId: req.query.note_parentId,
      }),
    }).send(res);
  };
  layNhungNoteGocUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy Note Gốc Thành Công",
      metadata: await NoteService.layNhungNoteGocUser({
        note_userId: req.params.userId,
        ...req.query,
      }),
    }).send(res);
  };

  handleRestoreNote = async (req, res, next) => {
    new SuccessResponse({
      message: "Khôi Phục Note Thành Công",
      metadata: await NoteService.handleRestoreNote({
        id: req.params.id,
        note_userId: req.query.userId,
      }),
    }).send(res);
  };

  handleDeleteNote = async (req, res, next) => {
    new SuccessResponse({
      message: "Xóa Note Thành Công",
      metadata: await NoteService.handleDeleteNote({
        id: req.params.id,
        note_userId: req.query.userId,
      }),
    }).send(res);
  };

  getNoteByLevel = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy Note Theo Level Thành Công",
      metadata: await NoteService.getNoteByLevel(req.params),
    }).send(res);
  };
}

module.exports = new NoteController();
