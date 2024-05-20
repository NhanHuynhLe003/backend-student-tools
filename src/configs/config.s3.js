const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

// Các cấu hình kết nối S3
const s3Config = {
  region: process.env.S3_REGION, // khu vực lưu trữ S3
  // Thông tin xác thực để kết nối S3
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_S3,
    secretAccessKey: process.env.SECRET_KEY_S3,
  },
};

const s3 = new S3Client(s3Config);

module.exports = {
  s3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
};
