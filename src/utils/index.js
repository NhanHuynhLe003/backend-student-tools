const lodash = require("lodash");
const { default: mongoose } = require("mongoose");
const { format } = require("date-fns");
const fs = require("fs");
const path = require("path");

const convertObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};

/**
 * Lọc thông tin data response.
 *
 * @param {Array} dataFields - Mảng chứa tên các trường dữ liệu cần lấy.
 * @param {Object} object - Đối tượng chứa dữ liệu cần lấy thông tin.
 * @returns {Object} - Đối tượng mới chỉ chứa các trường dữ liệu đã lấy.
 */
const getDataInfoResponse = (dataFields, object) => {
  return lodash.pick(object, dataFields);
};

/**
 * Xóa các key có giá trị là null hoặc undefined trong đối tượng.
 *
 * @param {Object} obj - Đối tượng cần xóa các key có giá trị là null hoặc undefined.
 * @returns {Object} - Đối tượng đã được xóa các key có giá trị là null hoặc undefined.
 */

const removeUndefinedNullObject = (obj) => {
  // Đi sâu vào obj và xóa các key có giá trị là null hoặc undefined
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj === "object") {
      removeUndefinedNullObject(obj[key]); // đi đến các object con và xóa key có giá trị là null hoặc undefined
    } else if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
};

/**
 * - Chuyển đổi đối tượng có cấu trúc lồng nhau thành đối tượng mới với các key được nối với nhau bằng dấu chấm.
 * - Mục đích: vì mongodb muốn cập nhật phải là dạng "a.b.c" nên cần chuyển đổi từ {a: {b: {c: 1}}} thành {"a.b.c": 1}
 * @param {Object} obj - Đối tượng có cấu trúc lồng nhau cần chuyển đổi.
 * @returns {Object} - Đối tượng mới với các key được nối với nhau bằng dấu chấm.
 */
const nestedObjectConvert = (obj) => {
  const newObj = {};

  // Hàm đệ quy giúp chuyển đổi object lồng nhau
  const convertObject = (inputObj, prefix = "") => {
    Object.keys(inputObj).forEach((key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof inputObj[key] === "object" && !Array.isArray(inputObj[key])) {
        convertObject(inputObj[key], newKey); //nếu là obj thì tiếp tục đi sâu vào với key đã convert
      } else {
        // với những giá trị không phải obj thì key mặc định vẫn là chính nó
        newObj[newKey] = inputObj[key];
      }
    });
  };

  convertObject(obj);

  return newObj;
};

const convertDateToDDMMYYYY = (date) => {
  return format(date, "dd-MM-yyyy");
};

/**
 * Kiểm tra xem một đối tượng có rỗng hay không.
 *
 * @param {Object} obj - Đối tượng cần kiểm tra.
 * @returns {boolean} - Trả về true nếu đối tượng rỗng, ngược lại là false.
 */
function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * @description Hàm xóa tất cả các file trong thư mục
 * @param {String} pathUrl - Đường dẫn thư mục cần xóa file vd: "src/uploads"
 */
function deleteFilesInDirectory(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err.message}`);
      return;
    }

    if (!files || files.length === 0) {
      console.log("Thư mục không có file nào để xóa!");
      return;
    }

    // Duyệt qua từng file trong thư mục và xóa
    for (const file of files) {
      // fs.unlink: dùng để xóa file
      fs.unlink(path.join(directory, file), (err) => {
        if (err) {
          console.error(`Error deleting file ${file}: ${err.message}`);
        } else {
          console.log(`[File:::] ${file} đã được xóa.`);
        }
      });
    }
  });
}

function customRound(num) {
  const decimal = num % 1;

  if (decimal <= 0.25) {
    return Math.floor(num); // Làm tròn xuống
  } else if (decimal > 0.25 && decimal < 0.75) {
    return Math.floor(num) + 0.5; // Làm tròn lên giữa
  } else {
    return Math.ceil(num); // Làm tròn lên
  }
}

module.exports = {
  getDataInfoResponse,
  removeUndefinedNullObject,
  nestedObjectConvert,
  convertObjectId,
  convertDateToDDMMYYYY,
  isObjectEmpty,
  deleteFilesInDirectory,
  customRound,
};
