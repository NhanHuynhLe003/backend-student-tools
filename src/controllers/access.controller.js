"use strict";

const AccessService = require("../services/access.service");
const { Created } = require("../../core/success.response");
class AccessController {
  handleRefreshToken = async (req, res, next) => {
    new Created({
      message: "Handle Refresh Token Successfully !",
      metadata: await AccessService.handleRefreshToken({
        keyStore: req.keyStore,
        user: req.user,
        refreshToken: req.refreshToken,
      }),
    }).send(res); // Sau khi xử lý xong thì trả về response cho user
  };

  logout = async (req, res, next) => {
    new Created({
      message: "Logout Successfully !",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res); // Sau khi xử lý xong thì trả về response cho user
  };

  signUp = async (req, res, next) => {
    new Created({
      message: "Registered Successfully!",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 15,
      },
    }).send(res); // Sau khi xử lý xong thì trả về response cho user
  };

  login = async (req, res, next) => {
    new Created({
      message: "Logged In Successfully!",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();
