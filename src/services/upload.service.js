const { format } = require("date-fns");
const {
  s3,
  GetObjectCommand,
  PutObjectCommand,
} = require("../configs/config.s3");

const { NotFoundError, BadRequestError } = require("../../core/error.response");
const getSignedUrlCloudFront = require("@aws-sdk/cloudfront-signer")
  .getSignedUrl;

// đọc đuong dẫn ảnh
const fs = require("fs");
const path = require("path");
const ImageModel = require("../models/image.model");

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
    //Thời gian để ảnh hết hạn
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000); // url img hết hạn sau 24h mỗi ngày

    const imgName = `${nameStorage}/${convertDDMMYYYY}/${file.originalname}`;

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
    // Thời gian để ảnh hết hạn
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000); // url img hết hạn sau 24h mỗi ngày tính từ thời hạn cuối của ảnh

    const imgName = `${nameStorage}/${convertDDMMYYYY}/${file.originalname}`;

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

    //(*) lưu file ảnh vào mongodb => Mục đích: dùng để get ảnh khi ảnh hết hạn
    const image = new ImageModel({
      keyName: imgName,
      signedUrl: urlSignedCloudFront,
      expiration: expiredTimeUrlImg,
      storage: nameStorage,
    });
    const resImageDb = await image.save();

    return {
      url: urlSignedCloudFront, // trả về thông tin ảnh, trong đó có url truy cập ảnh
      imageInfo: resImageDb, // Chủ yếu để lấy id ảnh gắn qua cho book
      result,
    };
  }

  static async uploadMultipleImgToS3({ files, nameStorage = "books" }) {
    const convertDDMMYYYY = format(new Date(), "dd-MM-yyyy");
    //Thời gian để ảnh hết hạn sau 24h
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // mảng chứa kết quả upload ảnh và url ảnh đã upload
    const result = [];

    // mảng chứa url ảnh đã upload
    const urls = [];

    // mảng chứa thông tin ảnh đã upload trong db
    const images = [];

    // duyệt qua từng file ảnh để upload
    for (let i = 0; i < files.length; i++) {
      const imgName = `${nameStorage}/${convertDDMMYYYY}/${files[i].originalname}`;
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

      //(*) lưu file ảnh vào mongodb => Mục đích: dùng để get ảnh khi ảnh hết hạn
      const image = new ImageModel({
        keyName: imgName,
        signedUrl: urlSignedCloudFront,
        expiration: expiredTimeUrlImg,
        storage: nameStorage,
      });
      const resImageDb = await image.save();
      images.push(resImageDb);
      // url ảnh và thông tin của ảnh đã upload sẽ được lưu vào mảng urls
      urls.push(urlSignedCloudFront);
      result.push(res);
    }
    return {
      urls,
      result,
      images,
    };
  }

  static async uploadMultipleDiskImgToS3({ files, nameStorage = "books" }) {
    const convertDDMMYYYY = format(new Date(), "dd-MM-yyyy");
    //Thời gian để ảnh hết hạn sau 24h
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // mảng chứa kết quả upload ảnh và url ảnh đã upload
    const result = [];

    // mảng chứa url ảnh đã upload
    const urls = [];

    // duyệt qua từng file ảnh để upload
    for (let i = 0; i < files.length; i++) {
      const imgName = `${nameStorage}/${convertDDMMYYYY}/${files[i].originalname}`;
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

  static async checkAndGetImageS3ById({ imageId }) {
    //tìm ảnh bằng _id trong database

    const image = await ImageModel.findById(imageId);
    if (!image) {
      throw new NotFoundError(
        "Không tìm thấy ảnh trong hệ thống, vui lòng kiểm tra lại!"
      );
    }

    //Lấy ra thời gian hiện tại để so sánh với thời gian ảnh trong database
    const currentTime = new Date();

    //Nếu thời gian sử dụng ảnh vẫn còn => trả về URL ảnh đã ký
    if (image.expiration > currentTime) {
      return image;
    }

    // Xử lý khi thời gian ảnh hết hạn => ký chữ ký mới cho ảnh
    const ImgCloudFrontUrl = `${urlImgCloudFront}/${image.keyName}`;

    //Thời gian để ảnh hết hạn trong vòng 24h
    const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Ký chữ ký mới cho ảnh
    const urlSignedCloudFront = getSignedUrlCloudFront({
      url: ImgCloudFrontUrl,
      keyPairId: process.env.CLOUDFRONT_PUBLICKEY,
      dateLessThan: expiredTimeUrlImg,
      privateKey: process.env.CLOUDFRONT_PRIVATEKEY,
    });

    //Lưu lại URL ảnh đã ký mới vào database
    image.signedUrl = urlSignedCloudFront;
    image.expiration = expiredTimeUrlImg;
    await image.save();

    return image;
  }

  static async checkAndGetImageS3ByStorage({ nameStorage }) {
    const images = await ImageModel.find({ storage: nameStorage });
    if (!images) throw BadRequestError("Tên kho chứa ảnh không hợp lệ !");

    // Lấy ra thời gian hiện tại để so sánh với thời gian ảnh trong database
    const currentTime = new Date();

    // Kiểm tra từng image trong database rồi update lại signedUrl và expiration

    const checkedImagesPromises = images.map(async (image) => {
      // Nếu thời gian sử dụng ảnh vẫn còn => trả về null vì sẽ ko cập nhật ảnh đó
      if (image.expiration > currentTime) {
        return null;
      }

      // Xử lý khi thời gian ảnh hết hạn => ký chữ ký mới cho ảnh
      const ImgCloudFrontUrl = `${urlImgCloudFront}/${image.keyName}`;
      const expiredTimeUrlImg = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Ký chữ ký mới cho ảnh
      const urlSignedCloudFront = getSignedUrlCloudFront({
        url: ImgCloudFrontUrl,
        keyPairId: process.env.CLOUDFRONT_PUBLICKEY,
        dateLessThan: expiredTimeUrlImg,
        privateKey: process.env.CLOUDFRONT_PRIVATEKEY,
      });

      // Lưu lại URL ảnh đã ký mới vào database
      image.signedUrl = urlSignedCloudFront;
      image.expiration = expiredTimeUrlImg;
      await image.save();

      return image;
    });

    // Chạy song song get tất cả ảnh trong database
    const checkedImages = await Promise.all(checkedImagesPromises);
    return checkedImages.filter((img) => img !== null);
  }
}

module.exports = UploadService;
