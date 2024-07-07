"use strict";

const studentModel = require("../models/student.model");

class UserService {
  static async getStudentBooksReading({ userId }) {
    const student = await studentModel.findById(userId);
    if (!student) {
      throw new Error("Không tìm thấy thông tin học sinh!");
    }

    return student.books_reading;
  }
}

module.exports = UserService;
