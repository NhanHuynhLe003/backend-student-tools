"use strict";

const UserService = require("../services/user.service");
const { Created, SuccessResponse } = require("../../core/success.response");
class UserController {
  getStudentBooksReading = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách các quyển sách học sinh đang đọc thành công !",
      metadata: await UserService.getStudentBooksReading(req.params),
    }).send(res);
  };

  getStudentBooksReaded = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách các quyển sách học sinh đang đọc thành công !",
      metadata: await UserService.getStudentBooksReaded(req.params),
    }).send(res);
  };

  updateUserInformation = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật thông tin học sinh thành công !",
      metadata: await UserService.updateUserInformation({
        userId: req.params.userId,
        payload: req.body,
      }),
    }).send(res);
  };

  getStudentInformation = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy thông tin học sinh thành công !",
      metadata: await UserService.getStudentInformation({
        userId: req.params.userId,
      }),
    }).send(res);
  };

  getAllStudentByAdmin = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách học sinh thành công !",
      metadata: await UserService.getAllStudentByAdmin(),
    }).send(res);
  };

  listRankStudentReadedBooks = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách học sinh đọc sách nhiều nhất thành công !",
      metadata: await UserService.listRankStudentReadedBooks({ ...req.query }),
    }).send(res);
  };
}

module.exports = new UserController();
