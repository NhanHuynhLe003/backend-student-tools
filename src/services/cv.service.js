"use strict";

const CvModel = require("../models/cv.model");
const cvStudentModel = require("../models/cvStudent.model");
const studentModel = require("../models/student.model");
const { NotFoundError } = require("../../core/error.response");

class CvService {
  static getImgsByUserId = async ({ userId }) => {};

  // Tạo bảng trống cho CV đầu tiên của user
  static createEmptyCv = async ({ userId }) => {
    const newCv = await CvModel.create({
      cvUserId: userId,
      title: "Untitled",
      thumbnail: "",
      boards: [],
      status: "private",
    });

    const boards = {
      cvId: newCv._id,
      cvUserId: newCv.cvUserId,
      name: "Untitled",
      position: { top: 0, left: 0 },
      listDataItem: [],
    };

    newCv.boards.push(boards);
    await newCv.save();

    return newCv;
  };

  static addBoardIntoCv = async (payload) => {
    const { cvId, userId } = payload;

    console.log("CvId:::", cvId, "userId:::", userId);

    const foundCv = await CvModel.findOne({ _id: cvId, cvUserId: userId });
    if (!foundCv) throw new NotFoundError("Không tìm thấy cv !");

    // Lấy số lượng tính khoảng cách mới giữa các bảng
    const boardCvLen = foundCv.boards.length;

    const newBoard = {
      cvId,
      cvUserId: userId,
      name: "Untitled",
      position: { top: boardCvLen * 80, left: 0 },
      listDataItem: [],
    };

    const res = await CvModel.findOneAndUpdate(
      { _id: cvId, cvUserId: userId },
      { $push: { boards: newBoard } },
      { upsert: true, new: true }
    );
    return res;
  };

  static addItemIntoBoard = async (payload) => {
    const { cvId, userId, boardId, item } = payload;

    const foundCv = await CvModel.findOne({ _id: cvId, cvUserId: userId });
    if (!foundCv) throw new NotFoundError("Không tìm thấy cv !");

    const foundBoard = foundCv.boards.find((board) => {
      console.log("board._id", board._id.toString(), boardId.toString());
      return board._id.toString() === boardId.toString();
    });

    console.log("Found board", foundBoard, boardId);
    if (!foundBoard) throw new NotFoundError("Không tìm thấy board !");

    foundBoard.listDataItem.push(item);
    await foundCv.save({ upsert: true, new: true });

    return foundCv;
  };

  static updateCv = async (payload) => {
    const { cvId, userId } = payload;
    const res = await CvModel.findOneAndUpdate(
      { _id: cvId, cvUserId: userId },
      payload,
      {
        upsert: true,
        new: true,
      }
    );
    return res;
  };

  static deleteCv = async ({ cvId, userId }) => {
    const res = await CvModel.findOneAndUpdate(
      { _id: cvId, cvUserId: userId },
      { isDelete: true },
      {
        upsert: false,
        new: true,
      }
    );
    return res;
  };

  static getCvsByUserId = async ({ userId, skip = 0, limit = 20 }) => {
    const total = await CvModel.countDocuments({
      cvUserId: userId,
      isDelete: false,
    }).exec();
    const res = await CvModel.find({ cvUserId: userId, isDelete: false })
      .skip(skip)
      .limit(limit);
    return {
      total: total,
      result: res,
    };
  };

  static getCvById = async ({ cvId }) => {
    const res = await CvModel.findOne({
      _id: cvId,
      isDelete: false,
    });
    return res;
  };

  static getCvByIdAndUserId = async ({ cvId, userId }) => {
    const res = await CvModel.findOne({
      _id: cvId,
      cvUserId: userId,
      isDelete: false,
    });
    return res;
  };

  static getAllCvsByAdmin = async ({ skip = 0, limit = 20 }) => {
    const total = await CvModel.countDocuments({ isDelete: false }).exec();
    const res = await CvModel.find({ isDelete: false })
      .populate("cvUserId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return {
      total: total,
      result: res,
    };
  };

  static getCvPublished = async () => {
    const res = await CvModel.find({ status: "public", isDelete: false });
    return res;
  };

  static sendCvToStudent = async ({ cvId, userId, studentClass, cvData }) => {
    // 1. Lấy danh sách học sinh theo lớp học
    const students = await studentModel.find({ classStudent: studentClass });

    if (!students || students.length === 0) {
      throw new NotFoundError("Không tìm thấy lớp học!");
    }

    // 2. Tạo CV mới cho từng học sinh với cvData
    const cvPromises = students.map((student) => {
      if (student._id.toString() === userId.toString()) return null;

      return CvModel.create({
        ...cvData,
        cvParentId: cvId,
        cvUserId: student._id,
        cvParentUserId: userId,
        status: "private",
        isDragDisabled: true,
      });
    });

    const createdCvs = await Promise.all(cvPromises);

    console.log(
      "cvId:",
      cvId,
      "userId:",
      userId,
      "studentClass:",
      studentClass,
      "cvData:",
      cvData
    );

    return createdCvs;
  };
}

module.exports = CvService;
