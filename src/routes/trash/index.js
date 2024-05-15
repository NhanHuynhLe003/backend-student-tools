const express = require("express");
const TrashController = require("../../controllers/trash.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);
//create book
router.get("", asyncHandleError(TrashController.findAllTrash));
router.get("/:book_id", asyncHandleError(TrashController.findBookTrashById));
router.get(
  "/admin/:admin_id",
  asyncHandleError(TrashController.findAdminDeleteBook)
);
router.patch(
  "/restore/:book_id",
  asyncHandleError(TrashController.restoreBook)
);
router.delete("/:book_id", asyncHandleError(TrashController.deleteBookInTrash));

module.exports = router;
