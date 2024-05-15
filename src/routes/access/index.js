const express = require("express");
const AccessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

//sign-up [ADMIN]
router.post("/student/sign-up", asyncHandleError(AccessController.signUp));

//login
router.post("/student/login", asyncHandleError(AccessController.login));

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);
//logout
router.post("/student/logout", asyncHandleError(AccessController.logout));

//refresh token
router.post(
  "/student/refresh-token",
  asyncHandleError(AccessController.handleRefreshToken)
);

module.exports = router;
