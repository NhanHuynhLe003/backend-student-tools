const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const app = express();
const bodyParser = require("body-parser");

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
