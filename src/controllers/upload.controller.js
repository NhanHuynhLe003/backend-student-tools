const { BadRequestError } = require("../../core/error.response");
const { SuccessResponse } = require("../../core/success.response");
const UploadService = require("../services/upload.service");

class UploadController {
  uploadSingleImgToS3 = async (req, res, next) => {
    const { file } = req;

    if (!file) {
      throw new BadRequestError("Missing File Upload!");
    }
    console.log("FILE:::", file);
    new SuccessResponse({
      message: "Upload ảnh lên s3 thành công ! ",
      metadata: await UploadService.uploadSingleImgToS3({ file }),
    }).send(res);
  };
}

module.exports = new UploadController();
