"use strict";

const { Created, SuccessResponse } = require("../../core/success.response");
const CvService = require("../services/cv.service");
class CvController {
  createEmptyCv = async (req, res, next) => {
    new Created({
      message: "Tạo Cv mới thành công !",
      metadata: await CvService.createEmptyCv(req.body),
    }).send(res);
  };

  updateCv = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật Cv thành công !",
      metadata: await CvService.updateCv(req.body),
    }).send(res);
  };

  deleteCv = async (req, res, next) => {
    new SuccessResponse({
      message: "Xóa Cv thành công !",
      metadata: await CvService.deleteCv(req.body),
    }).send(res);
  };

  getCvsByUserId = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách Cv thành công !",
      metadata: await CvService.getCvsByUserId({
        userId: req.params.userId,
        ...req.query,
      }),
    }).send(res);
  };

  getCvById = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy thông tin Cv thành công !",
      metadata: await CvService.getCvById(req.body),
    }).send(res);
  };

  getAllCvsByAdmin = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách Cv thành công !",
      metadata: await CvService.getAllCvsByAdmin(),
    }).send(res);
  };

  getCvPublished = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách Cv đã công bố thành công !",
      metadata: await CvService.getCvPublished(),
    }).send(res);
  };

  addItemIntoBoard = async (req, res, next) => {
    new Created({
      message: "Thêm item vào board thành công !",
      metadata: await CvService.addItemIntoBoard(req.body),
    }).send(res);
  };

  addBoardIntoCv = async (req, res, next) => {
    new Created({
      message: "Thêm board vào Cv thành công !",
      metadata: await CvService.addBoardIntoCv(req.body),
    }).send(res);
  };
}

module.exports = new CvController();
