const { BadRequestError } = require("../../core/error.response");
const { SuccessResponse } = require("../../core/success.response");
const UploadService = require("../services/upload.service");
const { convertObjectId } = require("../utils");

class UploadController {
  checkAndGetImageS3ByStorageAndUserId = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách ảnh từ s3 thành công !",
      metadata: await UploadService.checkAndGetImageS3ByStorageAndUserId({
        nameStorage: req.query.nameStorage,
        userId: req.params.userId,
      }),
    }).send(res);
  };

  uploadSingleImgInfinity = async (req, res, next) => {
    const { file } = req;

    if (!file) {
      throw new BadRequestError("Missing File Upload!");
    }

    new SuccessResponse({
      message: "Upload ảnh lên s3 thành công ! ",
      metadata: await UploadService.uploadSingleImgInfinity({
        file,
        nameStorage: req.query.nameStorage,
        userId: req.user.userId,
      }),
    }).send(res);
  };

  /**
   * @description Upload ảnh lên s3 bằng memory
   * @param {*} req
   * @param {String} req.nameStorage - tên kho chứa ảnh
   * @param {*} req.file - file ảnh cần upload
   */
  uploadSingleImgToS3 = async (req, res, next) => {
    const { file } = req;

    if (!file) {
      throw new BadRequestError("Missing File Upload!");
    }

    new SuccessResponse({
      message: "Upload ảnh lên s3 thành công ! ",
      metadata: await UploadService.uploadSingleImgToS3({
        file,
        nameStorage: req.query.nameStorage,
      }),
    }).send(res);
  };

  /**
   * @description Upload ảnh lên s3 bằng disk
   * @param {*} req
   * @param {String} req.nameStorage - tên kho chứa ảnh
   * @param {*} req.file - file ảnh cần upload
   */
  uploadSingleDiskImgToS3 = async (req, res, next) => {
    const { file } = req;

    if (!file) {
      throw new BadRequestError("Missing File Upload!");
    }

    new SuccessResponse({
      message: "Upload ảnh đơn lên s3 thành công ! ",
      metadata: await UploadService.uploadSingleDiskImgToS3({
        file,
        nameStorage: req.query.nameStorage,
        userId: req.user.userId,
      }),
    }).send(res);
  };

  /**
   *@description Upload multiple images to S3
   *@param {Object} req
   *@param {String} req.nameStorage - tên kho chứa ảnh
   *@param {Array} req.files - danh sách files ảnh cần upload
   */
  uploadMultipleImgToS3 = async (req, res, next) => {
    const { files } = req;

    if (!files) {
      throw new BadRequestError("Missing Files Upload!");
    }

    new SuccessResponse({
      message: "Upload danh sách ảnh lên s3 thành công ! ",
      metadata: await UploadService.uploadMultipleImgToS3({
        files,
        nameStorage: req.query.nameStorage,
      }),
    }).send(res);
  };

  uploadMultipleDiskImgToS3 = async (req, res, next) => {
    const { files } = req;

    if (!files) {
      throw new BadRequestError("Missing Files Upload!");
    }

    new SuccessResponse({
      message: "Upload danh sách ảnh lên s3 thành công ! ",
      metadata: await UploadService.uploadMultipleDiskImgToS3({
        files,
        nameStorage: req.query.nameStorage,
      }),
    }).send(res);
  };

  checkAndGetImageS3ById = async (req, res, next) => {
    const { id } = req.params;

    new SuccessResponse({
      message: "Lấy ảnh từ s3 thành công !",
      metadata: await UploadService.checkAndGetImageS3ById({
        imageId: convertObjectId(id),
      }),
    }).send(res);
  };

  checkAndGetImageS3ByStorage = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách ảnh từ s3 thành công !",
      metadata: await UploadService.checkAndGetImageS3ByStorage({
        nameStorage: req.query.nameStorage,
      }),
    }).send(res);
  };
}

module.exports = new UploadController();
