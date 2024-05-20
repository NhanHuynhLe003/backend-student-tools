const express = require("express");
const UploadController = require("../../controllers/upload.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");
const { uploadMemory, uploadDisk } = require("../../configs/config.multer");

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);

//kiểm tra và lấy image by id
router.get(
  "/img/:id",
  asyncHandleError(UploadController.checkAndGetImageS3ById)
);

//kiểm tra và lấy image bằng storage
router.get(
  "/imgs",
  asyncHandleError(UploadController.checkAndGetImageS3ByStorage)
);

//upload img (MEMORY)
router.post(
  "/img",
  uploadMemory.single("uploadFileKey"), //tên phải giống với key của form-data, ở đây bên postman là uploadFileKey
  asyncHandleError(UploadController.uploadSingleImgToS3)
);

//upload img (DISK)
router.post(
  "/d-img",
  uploadDisk.single("uploadFileKey"), //tên phải giống với key của form-data, ở đây bên postman là uploadFileKey
  asyncHandleError(UploadController.uploadSingleDiskImgToS3)
);

//upload multi img

router.post(
  "/imgs",
  uploadMemory.array("uploadFileKey", 5),
  asyncHandleError(UploadController.uploadMultipleImgToS3)
);

//upload multi img (DISK)
router.post(
  "/d-imgs",
  uploadDisk.array("uploadFileKey", 5), // tối đa 5 file
  asyncHandleError(UploadController.uploadMultipleDiskImgToS3)
);

module.exports = router;
