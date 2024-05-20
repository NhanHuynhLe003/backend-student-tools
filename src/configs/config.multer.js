const multer = require("multer");

// Cấu hình multer để upload file thông qua bộ nhớ(ram), tuy hơi tốn kém nhưng sử dụng được buffer
const uploadMemory = multer({
  storage: multer.memoryStorage(), // lưu file vào bộ nhớ
});

// Cấu hình multer để upload file thông qua ổ đĩa, tốc độ nhanh hơn so với upload thông qua bộ nhớ
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./src/uploads/"); // đường dẫn lưu file
  },
  filename: function(req, file, cb) {
    const fileNameSaveServer = `${Date.now()}-${file.originalname}`;
    console.log("[FILENAME::::::]", fileNameSaveServer);
    cb(null, fileNameSaveServer); // tên file
  },
});
const uploadDisk = multer({ storage: storage });

module.exports = {
  uploadDisk,
  uploadMemory,
};
