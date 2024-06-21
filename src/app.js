const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const app = express();
const bodyParser = require("body-parser");
const { deleteFilesInDirectory } = require("./utils");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

//CORS chỉ cho phép nguồn sau truy cập vào BE
const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },

    // CORS cho phép nhận cookie từ request của client
    credentials: true,
  })
);

// Khởi tạo middleware
app.use(morgan("dev")); //in ra log của user khi chạy request
app.use(helmet()); // bảo mật ứng dụng

app.use(compression()); //nén dữ liệu tránh tiêu tốn băng thông khi gửi request

// response trả về dạng json
app.use(express.json());
bodyParser.urlencoded({
  extended: true,
});
// khởi tạo dbs
require("./db/init.mongodb");

// khởi tạo routes
app.use("/", require("./routes"));

// Hàm dọn rác cron => Xóa ảnh đã upload lên s3 sau 24 giờ(0h0p mỗi ngày)
cron.schedule("0 0 * * *", () => {
  //cron.schedule(* * * * * (phút, giờ, ngày trong tháng, tháng, ngày trong tuần))
  // (45 16 * * *): Chạy vào lúc 16:45 mỗi ngày.
  // (0 0 * * *): Chạy vào lúc 00:00 mỗi ngày.
  // (*/5 * * * *): Chạy mỗi 5 phút.

  // directory mặc định sẽ lấy folder trong src nên không cần truyền đường dẫn src
  const directory = path.join(__dirname, "uploads");
  try {
    deleteFilesInDirectory(directory);
    console.log("Đã xóa tất cả file trong thư mục src/uploads");
  } catch (err) {
    console.error(err);
  }
});

// xử lý lỗi 404
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// xử lý các lỗi khác, nếu không có thì trả về lỗi server(500)
app.use((error, req, res, next) => {
  const statusRes = error.status || 500;
  return res.status(statusRes).json({
    status: "error",
    code: statusRes,
    stack: error.stack,
    message: error.message || "Internal Server Error",
  });
});
module.exports = app;
