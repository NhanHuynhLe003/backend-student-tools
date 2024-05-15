"use strict";

const TrashService = require("../services/trash.service");
const { Created } = require("../../core/success.response");
class TrashController {
  findAllTrash = async (req, res, next) => {
    new Created({
      message: "Tìm tất cả trash thành công",
      metadata: await TrashService.findAllTrash(),
    }).send(res);
  };

  findBookTrashById = async (req, res, next) => {
    new Created({
      message: "Tìm trash theo id thành công",
      metadata: await TrashService.findBookTrashById(req.params),
    }).send(res);
  };

  findAdminDeleteBook = async (req, res, next) => {
    new Created({
      message: "Tìm trash theo admin id thành công",
      metadata: await TrashService.findAdminDeleteBook(req.params),
    }).send(res);
  };

  restoreBook = async (req, res, next) => {
    new Created({
      message: "Khôi phục sách thành công",
      metadata: await TrashService.restoreBook(req.params),
    }).send(res);
  };

  deleteBookInTrash = async (req, res, next) => {
    new Created({
      message: "Xóa sách mãi mãi",
      metadata: await TrashService.deleteBookInTrash(req.params),
    }).send(res);
  };

  autoDeleteBookInTrash = async (req, res, next) => {
    new Created({
      message: "Đã xóa sách tự động",
      metadata: await TrashService.autoDeleteBookInTrash(),
    }).send(res);
  };
}

module.exports = new TrashController();
