const express = require("express");
// Controller

const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");
const userController = require("../../controllers/user.controller");

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);

router.get("/admin/all", asyncHandleError(userController.getAllStudentByAdmin));
router.get(
  "/books-reading/:userId",
  asyncHandleError(userController.getStudentBooksReading)
);
router.get(
  "/books-readed/:userId",
  asyncHandleError(userController.getStudentBooksReaded)
);

router.patch(
  "/:userId",
  asyncHandleError(userController.updateUserInformation)
);

router.get("/:userId", asyncHandleError(userController.getStudentInformation));

//GET, POST, PUT, PATCH, DELETE ->
//create book

module.exports = router;
