const { findApiKey } = require("../services/apiKey.service");
const HEADER_API = {
  API_Key: "x-api-key",
  Authorization: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    // lấy ra api-key từ header sau đó tiến hành kiểm tra
    const key = req.headers[HEADER_API.API_Key]?.toString();
    console.log("HEADER-KEY: ", key);
    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }
    //kiểm tra xem key có tồn tại trong db không

    const objKey = await findApiKey(key);
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }
    console.log("NEW API KEY::: ", objKey);
    //nếu key đã có rồi thì đính kèm key đó vào request
    req.objKey = objKey;

    return next();
  } catch (err) {
    return next(err);
  }
};

const checkPermission = (permission) => {
  //dùng closure function để truyền tham số permission, sau đó kiểm tra xem permission có trong objKey.permissions không
  return async (req, res, next) => {
    if (!req.objKey.permissions) {
      //trường hợp không có permission
      return res.status(403).json({
        message: "Permission Denied",
      });
    }

    //kiểm tra permission có được cấp quyền api-key không?
    let keyPermission = req.objKey.permissions.includes(permission);
    if (!keyPermission) {
      //trường hợp không có permission
      return res.status(403).json({
        message: "Permission Denied",
      });
    }
    return next();
  };
};

//MiddleWare xử lý lỗi bằng cách nhận vào 1 fn và trả về 1 fn khác bọc bên ngoài sau đó sử dụng catch để bắt lỗi
const asyncHandleError = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  apiKey,
  checkPermission,
  asyncHandleError,
};
