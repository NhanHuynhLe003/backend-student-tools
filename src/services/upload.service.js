const { format } = require("date-fns");
const {
  s3,
  GetObjectCommand,
  PutObjectCommand,
} = require("../configs/config.s3");

// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const getSignedUrlCloudFront = require("@aws-sdk/cloudfront-signer")
  .getSignedUrl;

// đọc đuong dẫn ảnh
const fs = require("fs");
const path = require("path");

// Link CloudFront
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
    const convertHHMMSS = format(new Date(), "HHmmss");
    //Thời gian để ảnh hết hạn
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000); // url img hết hạn sau 24h mỗi ngày

    const imgName = `${nameStorage}/${convertDDMMYYYY}/${convertHHMMSS}-${file.originalname}`;

    //(*) lưu tên file ảnh vào database của BOOKS

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

  //=========================================================================================

  /**
   * @description Hàm xử lý ảnh lên S3 thông qua disk
   * @param {object} file - file ảnh cần upload, sử dụng multer để xử lý
   * @returns {object} - Trả về URL ảnh đã upload và kết quả upload lên S3
   */
  static async uploadSingleDiskImgToS3({ file, nameStorage = "books" }) {
    // Tạo tên folder ngày hiện tại upload ảnh
    const convertDDMMYYYY = format(new Date(), "dd-MM-yyyy");
    const convertHHMMSS = format(new Date(), "HHmmss");
    // Thời gian để ảnh hết hạn
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000); // url img hết hạn sau 24h mỗi ngày

    const imgName = `${nameStorage}/${convertDDMMYYYY}/${convertHHMMSS}-${file.originalname}`;

    // Đọc file từ disk
    const filePath = path.join(__dirname, "..", "uploads", file.filename);

    // fileContent dùng để lưu trữ buffer của file ảnh, vì upload disk không hỗ trợ sẵn buffer
    const fileContent = fs.readFileSync(filePath);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imgName,
      Body: fileContent, // sử dụng buffer từ disk
      ContentType: file.mimetype,
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

    // Xóa file sau khi upload xong để dọn dẹp
    // fs.unlinkSync(filePath);

    return {
      url: urlSignedCloudFront, // trả về thông tin ảnh, trong đó có url truy cập ảnh
      result,
    };
  }

  static async uploadMultipleImgToS3({ files, nameStorage = "books" }) {
    const convertDDMMYYYY = format(new Date(), "dd-MM-yyyy");
    const convertHHMMSS = format(new Date(), "HHmmss");
    //Thời gian để ảnh hết hạn sau 24h
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // mảng chứa kết quả upload ảnh và url ảnh đã upload
    const result = [];

    // mảng chứa url ảnh đã upload
    const urls = [];

    // duyệt qua từng file ảnh để upload
    for (let i = 0; i < files.length; i++) {
      const imgName = `${nameStorage}/${convertDDMMYYYY}/${convertHHMMSS}-${files[i].originalname}`;
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: imgName,
        Body: files[i].buffer,
        ContentType: "image/jpeg",
      });

      // upload ảnh lên S3
      const res = await s3.send(command);
      const ImgCloudFrontUrl = `${urlImgCloudFront}/${imgName}`;

      // tạo url có chữ ký bảo mật, hạn chế truy cập ảnh trái phép từ CloudFront
      const urlSignedCloudFront = getSignedUrlCloudFront({
        url: ImgCloudFrontUrl,
        keyPairId: process.env.CLOUDFRONT_PUBLICKEY,
        dateLessThan: expiredTimeUrlImg,
        privateKey: process.env.CLOUDFRONT_PRIVATEKEY,
      });

      // url ảnh và thông tin của ảnh đã upload sẽ được lưu vào mảng urls
      urls.push(urlSignedCloudFront);
      result.push(res);
    }
    return {
      urls,
      result,
    };
  }

  static async uploadMultipleDiskImgToS3({ files, nameStorage = "books" }) {
    const convertDDMMYYYY = format(new Date(), "dd-MM-yyyy");
    const convertHHMMSS = format(new Date(), "HHmmss");
    //Thời gian để ảnh hết hạn sau 24h
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // mảng chứa kết quả upload ảnh và url ảnh đã upload
    const result = [];

    // mảng chứa url ảnh đã upload
    const urls = [];

    // duyệt qua từng file ảnh để upload
    for (let i = 0; i < files.length; i++) {
      const imgName = `${nameStorage}/${convertDDMMYYYY}/${convertHHMMSS}-${files[i].originalname}`;
      const filePath = path.join(__dirname, "..", "uploads", files[i].filename);

      // Đọc file từ disk sau đó chuyển sang dạng buffer
      const fileContent = fs.readFileSync(filePath);

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: imgName,
        Body: fileContent,
        ContentType: files[i].mimetype,
      });

      // upload ảnh lên S3
      const res = await s3.send(command);
      const ImgCloudFrontUrl = `${urlImgCloudFront}/${imgName}`;

      // tạo url có chữ ký bảo mật, hạn chế truy cập ảnh trái phép từ CloudFront
      const urlSignedCloudFront = getSignedUrlCloudFront({
        url: ImgCloudFrontUrl,
        keyPairId: process.env.CLOUDFRONT_PUBLICKEY,
        dateLessThan: expiredTimeUrlImg,
        privateKey: process.env.CLOUDFRONT_PRIVATEKEY,
      });

      // url ảnh và thông tin của ảnh đã upload sẽ được lưu vào mảng urls
      urls.push(urlSignedCloudFront);
      result.push(res);

      // Xóa file sau khi upload xong để dọn dẹp
      // fs.unlinkSync(filePath);
    }
    return {
      urls,
      result,
    };
  }
}

module.exports = UploadService;
