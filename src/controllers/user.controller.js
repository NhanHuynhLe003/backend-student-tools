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
}

module.exports = new UserController();
