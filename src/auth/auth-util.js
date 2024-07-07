"use strict";

const JWT = require("jsonwebtoken");
const {
  BadRequestError,
  NotFoundError,
  AuthFailureError,
} = require("../../core/error.response");
const { findKeyTokenByUserId } = require("../services/keyToken.service");
const { asyncHandleError } = require("./check-auth");

// chứa các header cần thiết bắt buộc phải có trong Headers của request
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};

/**
 * Tạo cặp mã token: Tạo một cặp mã token gồm accessToken và refreshToken dựa trên dữ liệu payload và cặp khóa công cộng và riêng tư.
 *
 * @param {object} payload - Dữ liệu được sử dụng để tạo token.
 * @param {string} privateKey - Khóa riêng tư được sử dụng để ký refreshToken.
 * @param {string} publicKey - Khóa công cộng được sử dụng để ký accessToken.
 * @returns {Object} - Một đối tượng chứa accessToken và refreshToken.
 *
 */
const createTokenPair = async (payload, privateKey, publicKey) => {
  try {
    /**
     * sử dụng publicKey để tạo accessToken vì accessToken thường sẽ được giữa các request  giữa
     * server và client. Nếu privateKey được sử dụng để ký accessToken, thì privateKey sẽ cần
     * phải được truyền từ server to client
     * => hacker có thể hack vào đường truyền để lấy privateKey, do đó việc dùng publicKey
     * để ký accessToken cho phép xác minh tính hợp lệ của accessToken mà không cần privateKey
     */
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    // Kiểm tra accessToken xem có hợp lệ không, nếu như hết hạn hoặc không hợp lệ thì sẽ không decode được
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log("failed to verify token:: ", err);
      } else {
        console.log("success to decode verify token:: ", decode);
      }
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (err) {
    return err;
  }
};

/**
 * Middleware authentication: Middleware xác thực người dùng và kiểm tra token.
 *
 * @param {Object} req - Đối tượng request HTTP.
 * @param {Object} res - Đối tượng response HTTP.
 * @param {Function} next - Hàm callback để chuyển tiếp xử lý sang middleware tiếp theo.
 * @throws {BadRequestError} Nếu thiếu thông tin UserId hoặc refreshToken trong tiêu đề yêu cầu.
 * @throws {NotFoundError} Nếu không tìm thấy keyToken trong cơ sở dữ liệu dựa trên UserId.
 * @throws {AuthFailureError} Nếu refreshToken không hợp lệ hoặc không khớp với UserId.
 * @returns {Function} - Hàm callback next để tiếp tục xử lý các yêu cầu tiếp theo.
 *
 * Bước thực hiện:
 * - Kiểm tra và lấy userId từ tiêu đề yêu cầu.
 * - Tìm kiếm keyToken trong cơ sở dữ liệu dựa trên userId.
 * - Kiểm tra và giải mã refreshToken, sau đó gán thông tin keyToken vào đối tượng yêu cầu.
 * - Cho phép tiếp tục xử lý các yêu cầu tiếp theo nếu xác thực thành công.
 */
const authentication = asyncHandleError(async (req, res, next) => {
  // 1. kiểm tra userId từ header
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new BadRequestError("Vui lòng đăng nhập"); //Missing userId

  // 2. kiểm tra keyToken trong db bằng userId
  const keyStore = await findKeyTokenByUserId(userId);
  if (!keyStore)
    throw new AuthFailureError(
      "Không tìm thấy thông tin, vui lòng đăng nhập lại"
    ); //Not Found UserId

  //3. kiểm tra refreshToken
  if (req.headers[HEADER.REFRESHTOKEN]) {
    const rfToken = req.headers[HEADER.REFRESHTOKEN];
    let decodeUser = {};
    try {
      //Refresh token được ký bằng privateKey do đó sử dụng privateKey để giải mã
      decodeUser = JWT.verify(rfToken, keyStore.privateKey);
    } catch (err) {
      throw new AuthFailureError(
        "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại"
      );
    }
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid UserId");
    }

    // Gán thông tin keyStore, user, refreshToken vào request để sử dụng
    req.keyStore = keyStore;
    req.user = decodeUser;
    req.refreshToken = rfToken;
    return next();
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
