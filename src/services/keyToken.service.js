"use strict";

const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  /**
   * Creates a new key token.
   * @param {string} userId - The ID of the user.
   * @param {string} publicKey - The public key.
   * @param {string} privateKey - The private key.
   * @returns {Promise<string|null>} The created key token's public key, or null if creation failed.
   */
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    try {
      const tokens = await keyTokenModel.create({
        user: userId,
        publicKey: publicKey,
        privateKey,
      });

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  /**
   * Creates a new key token with additional properties.
   * @param {object} options - The options for creating the key token.
   * @param {string} options.userId - The ID of the user.
   * @param {string} options.publicKey - The public key.
   * @param {string} options.privateKey - The private key.
   * @param {string} options.refreshToken - The refresh token.
   * @returns {Promise<object|null>} The created key token's public key, or null if creation failed.
   */
  static createKeyTokenV2 = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshToken,
        refreshTokensUsed: [],
      };

      // options used to create a new document if no document satisfies the filter, and update if a document already exists
      const options = { upsert: true, new: true };

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  /**
   * Finds a key token by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<object|null>} The key token object, or null if not found.
   */
  static findKeyTokenByUserId = async (userId) => {
    return await keyTokenModel.findOne({ user: userId });
    //.lean(); ko thể có lean vì thứ ta cần là 1 model không phải là obj
  };

  /**
   * Xóa keyToken từ cơ sở dữ liệu bằng ID.
   *
   * @param {string} id - ID của keyToken cần xóa.
   * @returns {Promise<object>} - Một promise phản hồi keyToken từ cơ sở dữ liệu.
   *
   * Đặc điểm:
   * - Hàm này sẽ tìm và xóa keyToken trong cơ sở dữ liệu dựa trên ID được cung cấp.
   * - Nếu tìm thấy một keyToken có ID phù hợp, nó sẽ xóa nó khỏi cơ sở dữ liệu.
   */
  static removeKeyTokenById = async (id) => {
    return await keyTokenModel.findByIdAndDelete(id);
    // nó sẽ tìm bên trong dbs so sánh thuộc tính _id: xem có cái nào phù hợp thì sẽ xóa nó
  };
}
module.exports = KeyTokenService;
