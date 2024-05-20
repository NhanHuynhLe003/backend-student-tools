const express = require("express");
const UploadController = require("../../controllers/upload.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");
const { uploadMemory } = require("../../configs/config.multer");

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);
//upload img Book
router.post(
  "/book/img",
  uploadMemory.single("uploadFileKey"), //tên phải giống với key của form-data, ở đây bên postman là uploadFileKey
  asyncHandleError(UploadController.uploadSingleImgToS3)
);
module.exports = router;
