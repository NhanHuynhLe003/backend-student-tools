"use strict";

const studentModel = require("../models/student.model");
const BCRYPT = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/auth-util");
const { getDataInfoResponse, convertObjectId } = require("../utils");

const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../../core/error.response");
const { findStudentByEmailRepo } = require("../models/repos/student.repo");

const { default: slugify } = require("slugify");

const ROLEBOARD = {
  ADMIN: "ROLE-001",
  WRITER: "ROLE-002",
  EDITOR: "ROLE-003",
  USER: "ROLE-004",
};

class AccessService {
  /**
   * Xử lý làm mới token cho người dùng dựa trên refreshToken cung cấp.
   *
   * @param {object} params - Đối số chứa keyStore, thông tin người dùng, và refreshToken.
   * @param {object} params.keyStore - Thông tin lưu trữ của key token.
   * @param {object} params.user - Thông tin người dùng hiện tại.
   * @param {string} params.refreshToken - refreshToken cần được làm mới.
   * @returns {Promise<object>} - Một đối tượng chứa thông tin người dùng và cặp tokens mới.
   *
   * Quy trình xử lý:
   * 1. Kiểm tra xem refreshToken hiện tại đã được sử dụng trước đó hay chưa.
   *    - Nếu đã sử dụng, xóa keyToken tương ứng và báo lỗi yêu cầu đăng nhập lại.
   * 2. Kiểm tra refreshToken cung cấp có trùng khớp với refreshToken trong db không.
   *    - Nếu không hợp lệ, báo lỗi token không đúng.
   * 3. Tìm kiếm thông tin Student qua email.
   *    - Nếu không tìm thấy Student, báo lỗi không tồn tại.
   * 4. Tạo cặp tokens mới cho người dùng.
   * 5. Cập nhật refreshToken mới vào database và thêm refreshToken cũ vào danh sách đã sử dụng.
   *
   * Lưu ý:
   * - Mỗi lần làm mới token, refreshToken cũ sẽ được đánh dấu là đã sử dụng để ngăn việc tái sử dụng.
   */
  static handleRefreshToken = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;

    // 1. kiểm tra rfToken hiện tại có nằm trong danh sách rfToken đã sử dụng chưa
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      //nếu rftoken đã sử dụng thì tiến hành delete
      await KeyTokenService.removeKeyTokenById(userId);
      throw new ForbiddenError("Something went wrong !, please login again !");
    }

    //2. kiểm tra rfToken truyền vào có hợp lệ không
    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Invalid Token");
    }

    //3. tìm kiếm student thông qua email
    const foundStudent = await findStudentByEmailRepo({ email });
    if (!foundStudent) {
      throw new BadRequestError("Student is not existed !");
    }

    //4. khởi tạo cặp tokens cho phiên mới (accesstoken va refresh token)
    const newTokens = await createTokenPair(
      { userId, email },
      keyStore.privateKey,
      keyStore.publicKey
    );

    //5. update lại refreshToken trong db
    await keyStore.updateOne({
      $set: {
        refreshToken: newTokens.refreshToken, //đưa token mới vào db
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, //đưa token vừa sử dụng vào danh sách đã sử dụng
      },
    });

    return {
      user,
      tokens: newTokens,
    };
  };

  //==============================================================================================

  /**
   * Đăng xuất người dùng bằng cách xóa keyToken ra khỏi cơ sở dữ liệu.
   *
   * @param {object} keyStore - Thông tin về keyStore cần được đăng xuất.
   * @returns {Promise<null>} - Một promise đại diện cho quá trình đăng xuất thành công.
   *
   * Đặc điểm:
   * - Hàm này nhận vào một đối tượng keyStore, chứa thông tin về keyToken cần được đăng xuất.
   * - Sau khi xóa keyToken từ cơ sở dữ liệu, hàm trả về một promise với giá trị null, đại diện cho quá trình đăng xuất thành công.
   */
  static logout = async (keyStore) => {
    const keyDelete = await KeyTokenService.removeKeyTokenById(keyStore._id);
    return null;
  };

  //==============================================================================================

  /**
   * @param {object} params hàm nhận vào 1 object.
   * @param {string} params.email Email của Student cần đăng nhập.
   * @param {string} params.password Mật khẩu của Student cần đăng nhập.
   * @param {string|null} [params.refreshToken=null] Refresh token cũ (nếu có) để tạo mới cặp token.
   * @returns {Promise<Object>} Đối tượng chứa thông tin Student và tokens.
   * @throws {BadRequestError} Nếu Student không tồn tại trong cơ sở dữ liệu.
   * @throws {AuthFailureError} Nếu mật khẩu không đúng.
   *
   * Đăng nhập cho Student dựa trên email và mật khẩu.
   * Nếu được cung cấp, sẽ sử dụng refreshToken để tái tạo tokens.
   *
   * Quy trình đăng nhập bao gồm các bước sau:
   * 1. Kiểm tra xem Student có tồn tại trong cơ sở dữ liệu dựa trên email không.
   * 2. So sánh mật khẩu nhập vào với mật khẩu đã được mã hóa trong cơ sở dữ liệu.
   * 3. Tạo cặp khóa publicKey và privateKey ngẫu nhiên bằng cách sử dụng thư viện crypto.
   *    - publicKey được dùng để xác minh token.
   *    - privateKey được dùng để ký token.
   * 4. Khởi tạo cặp token mới (accessToken và refreshToken).
   * 5. Lưu thông tin về khóa vào cơ sở dữ liệu.
   * 6. Trả về thông tin Student và cặp tokens cho người dùng.
   */
  static login = async ({ email, password, refreshToken = null }) => {
    //1. check student bằng mail
    const studentFound = await findStudentByEmailRepo({ email });
    if (!studentFound) {
      throw new BadRequestError("Student is not Registered");
    }
    //2. so sanh password
    const isCorrectPassword = BCRYPT.compare(password, studentFound.password);
    if (!isCorrectPassword) {
      throw new AuthFailureError("Authenticate Error");
    }
    //3. khởi tạo publicKey và privateKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    //4. khởi tạo cặp tokens cho phiên mới (accesstoken va refresh token)
    const { _id: userId } = studentFound;
    const tokensLogin = await createTokenPair(
      { userId, email },
      privateKey,
      publicKey
    );

    //5. Lưu keyToken info vào db
    await KeyTokenService.createKeyTokenV2({
      userId,
      privateKey,
      publicKey,
      refreshToken: tokensLogin.refreshToken,
    });

    return {
      //Sử dụng lodash để lấy các field trả về cần thiết cho student và gắn vào request ở client
      student: getDataInfoResponse(
        ["_id", "name", "email", "classStudent"],
        studentFound
      ),
      tokens: tokensLogin,
    };
  };

  //==============================================================================================

  /**
   * Đăng ký 1 student nhưng chỉ có [ADMIN] mới có quyền đăng ký Student đó.
   *
   * @param {object} params hàm nhận vào 1 object.
   * @param {string} params.name tên của Student.
   * @param {email} params.email email của Student.
   * @param {string} params.password mật khẩu của Student.
   * @returns {Promise<Object>} Đối tượng trả về chứa thông tin Student và tokens.
   * @throws {BadRequestError} Student đã tồn tại.
   * @throws {BadRequestError} Tạo khóa public thất bại.
   * @throws {BadRequestError} Tạo token thất bại.
   *
   * Quy trình đăng nhập bao gồm các bước sau:
   * 1. check student existed
   * 2. hash password and store student information into dbs
   * 3. generate publicKey and privateKey with random values generated by crypto
   * 4. store public key and private key to dbs
   * 5. generate token pair to make new session
   * 6. get data info response
   */
  static signUp = async ({
    studentId,
    name,
    email,
    password,
    classStudent,
  }) => {
    //1. check student existed
    const studentExisted = await studentModel
      .findOne({ email, studentId })
      .lean();
    // => lean ở đây có tác dụng thu gọn data response trả về đúng chuẩn js object
    if (studentExisted) {
      //case: student existed
      throw new BadRequestError("Student Already Existed !");
    }

    //2. hash password and store user info to dbs
    // Password lưu vào dbs không thể giữ nguyên dạng mà phải mã hóa
    const passwordHashed = await BCRYPT.hash(password, 10);

    // Update user info vào dbs
    const newStudent = await studentModel.create({
      classStudent: classStudent,
      student_id: studentId,
      name: name,
      email,
      password: passwordHashed,
      roles: [ROLEBOARD.USER],
    });

    if (newStudent) {
      //3. generate publicKey and privateKey with random values generated by crypto
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      //4. store public key and private key to dbs
      const publicKeyToken = await KeyTokenService.createKeyToken({
        userId: newStudent._id,
        publicKey,
        privateKey,
      });

      if (!publicKeyToken) {
        throw new BadRequestError(
          "Something went wrong when generate public key !"
        );
      }

      //5. generate token pair to make new session
      const tokens = await createTokenPair(
        { student: newStudent._id, email },
        privateKey,
        publicKey
      );

      if (!tokens) {
        throw new BadRequestError(
          "Something went wrong when generate tokens !"
        );
      }

      return {
        student: getDataInfoResponse(["_id", "name", "email"], newStudent),
        tokens,
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };

  //==============================================================================================

  /**
   * Đổi mật khẩu [USER]
   *
   * Các bước thực hiện:
   * 1. Kiểm tra xem user có tồn tại trong cơ sở dữ liệu dựa trên email không.
   * 2. So sánh mật khẩu cũ với mật khẩu đã được mã hóa trong cơ sở dữ liệu.(không dc trùng lặp, các mật khẩu đã thay đổi nên lưu vào 1 mảng kèm theo thời gian thay đổi)
   * 3. Mã hóa mật khẩu mới và cập nhật vào cơ sở dữ liệu.
   *
   */
}

module.exports = AccessService;
