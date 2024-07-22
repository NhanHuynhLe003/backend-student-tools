"use strict";

const { NotFoundError } = require("../../core/error.response");
const studentModel = require("../models/student.model");
const { removeUndefinedNullObject, nestedObjectConvert } = require("../utils");

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

  static async updateUserInformation({ userId, payload = {} }) {
    console.log("UUID:::", userId, "PAYLOAD:::", payload);

    //1. Xóa đi giá trị undefined, null trong object payload
    const objectParamas = removeUndefinedNullObject(payload);

    //2. đi sâu vào key có giá trị object (cấp 2 trở đi) trong payload truyền vào
    const convertParamsObj = nestedObjectConvert(objectParamas);

    console.log("CONVERTOBJ:::", convertParamsObj);

    // console.log("CONVERTOBJ:::", convertParamsObj);

    //3. Update dữ liệu
    const updateResponse = await studentModel.findByIdAndUpdate(
      userId,
      convertParamsObj,
      { new: true }
    );

    console.log("UPDATE RESPONSE:::", updateResponse);

    return updateResponse;
  }

  static async getStudentInformation({ userId }) {
    const student = await studentModel.findById(userId);
    if (!student) {
      throw new NotFoundError("Không tìm thấy thông tin học sinh!");
    }

    return student;
  }

  static async getAllStudentByAdmin() {
    const students = await studentModel.find();
    return {
      total: students.length,
      result: students,
    };
  }

  static async listRankStudentReadedBooks({ skip = 0, limit = 5 }) {
    return await studentModel
      .aggregate([
        {
          $match: {
            books_readed: { $exists: true, $not: { $size: 0 } },
          },
        },
        {
          $addFields: {
            books_readed_length: { $size: "$books_readed" },
          },
        },
        {
          $sort: { books_readed_length: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            books_readed_length: 0, // Loại bỏ trường books_readed_length khỏi kết quả cuối cùng
          },
        },
      ])
      .exec();
  }
}

module.exports = UserService;
