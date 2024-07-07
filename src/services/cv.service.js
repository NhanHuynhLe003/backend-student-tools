"use strict";

const CvModel = require("../models/cv.model");

class CvService {
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

    const foundCv = await CvModel.findOne({ _id: cvId, cvUserId: userId });
    if (!foundCv) throw new Error("Không tìm thấy cv !");

    // Lấy số lượng tính khoảng cách mới giữa các bảng
    const boardCvLen = foundCv.boards.length;

    const newBoard = {
      cvId,
      cvUserId: userId,
      name: "Untitled",
      position: { top: boardCvLen * 80, left: 0 },
      listDataItem: [],
    };

    const res = await CvModel.updateOne(
      { _id: cvId, cvUserId: userId },
      { $push: { boards: newBoard } },
      { upsert: true, new: true }
    );
    return res;
  };

  static addItemIntoBoard = async (payload) => {
    const { cvId, userId, boardId, item } = payload;

    const foundCv = await CvModel.findOne({ _id: cvId, cvUserId: userId });
    if (!foundCv) throw new Error("Không tìm thấy cv !");

    const foundBoard = foundCv.boards.find((board) => {
      console.log("board._id", board._id.toString(), boardId.toString());
      return board._id.toString() === boardId.toString();
    });

    console.log("Found board", foundBoard, boardId);
    if (!foundBoard) throw new Error("Không tìm thấy board !");

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
        upsert: true, // Nếu không tìm thấy thì không tạo mới
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

  static getCvById = async ({ cvId, userId }) => {
    const res = await CvModel.findOne({
      _id: cvId,
      isDelete: false,
      cvUserId: userId,
    });
    return res;
  };

  static getAllCvsByAdmin = async () => {
    const res = await CvModel.find({ isDelete: false });
    return res;
  };

  static getCvPublished = async () => {
    const res = await CvModel.find({ status: "public", isDelete: false });
    return res;
  };
}

module.exports = CvService;
