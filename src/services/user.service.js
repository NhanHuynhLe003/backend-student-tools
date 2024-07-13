"use strict";

const { NotFoundError } = require("../../core/error.response");
const studentModel = require("../models/student.model");

class UserService {
  static async getStudentBooksReading({ userId }) {
    const student = await studentModel.findById(userId);
    if (!student) {
      throw new NotFoundError("Không tìm thấy thông tin học sinh!");
    }

    return student.books_reading;
  }

  static async getStudentBooksReaded({ userId }) {
    const student = await studentModel.findById(userId);
    if (!student) {
      throw new NotFoundError("Không tìm thấy thông tin học sinh!");
    }

    return student.books_readed;
  }
}

module.exports = UserService;
