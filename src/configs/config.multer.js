const multer = require("multer");

// Cấu hình multer để upload file thông qua bộ nhớ(ram), tuy hơi tốn kém nhưng sử dụng được buffer
const uploadMemory = multer({
  storage: multer.memoryStorage(), // lưu file vào bộ nhớ
});

// Cấu hình multer để upload file thông qua ổ đĩa, tốc độ nhanh hơn so với upload thông qua bộ nhớ
const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./src/uploads/"); // tham số 2 là đường dẫn lưu file
    },
    fileName: (req, file, cb) => {
      cb(null, `${Date.now()} - ${file.originalname}`); // tham số 2 là tên file
    },
  }),
});

module.exports = {
  uploadDisk,
  uploadMemory,
};
