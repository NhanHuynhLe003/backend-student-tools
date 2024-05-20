const { format } = require("date-fns");
const {
  s3,
  GetObjectCommand,
  PutObjectCommand,
} = require("../configs/config.s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const getSignedUrlCloudFront = require("@aws-sdk/cloudfront-signer")
  .getSignedUrl;
const urlImgCloudFront = process.env.CLOUDFRONT_URL;

class UploadService {
  /**
   * @description Hàm xử lý upload ảnh đơn lên S3 có kết hợp với CloudFront(Có xác thực chữ ký, bảo mật URL)
   * @param {object} file - file ảnh cần upload, sử dụng multer để xử lý
   * @returns {object} - Trả về URL ảnh đã upload và kết quả upload lên S3
   */
  static async uploadSingleImgToS3({ file, nameStorage = "books" }) {
    //tạo tên folder ngày hiện tại upload ảnh
    const convertDDMMYYYY = format(new Date(), "dd-MM-yyyy");

    //Thời gian để ảnh hết hạn
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000); // url img hết hạn sau 24h mỗi ngày

    const imgName = `${nameStorage}/${convertDDMMYYYY}/${uuidv4()}-${
      file.originalname
    }`;
    //vd: books/01-01-2024/1234-5678-1234-5678-anh0001.png
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imgName,
      Body: file.buffer, // chỉ có upload dưới dạng memory mới lưu được với buffer, disk thì không, buffer là dạng binary của ảnh
      ContentType: "image/jpeg",
    });

    const result = await s3.send(command);
    const ImgCloudFrontUrl = `${urlImgCloudFront}/${imgName}`;

    // Hàm dùng để tạo ra URL có chữ ký bảo mật, hạn chế truy cập ảnh trái phép từ CloudFront
    const urlSignedCloudFront = getSignedUrlCloudFront({
      url: ImgCloudFrontUrl,
      keyPairId: process.env.CLOUDFRONT_PUBLICKEY, // name publickey của CloudFront đã tạo
      dateLessThan: expiredTimeUrlImg, // url img hết hạn sau 2h
      privateKey: process.env.CLOUDFRONT_PRIVATEKEY, // privatekey của user tạo bằng rsa
    });

    return {
      url: urlSignedCloudFront, // trả về thông tin ảnh, trong đó có url truy cập ảnh
      result,
    };
  }
}

module.exports = UploadService;
