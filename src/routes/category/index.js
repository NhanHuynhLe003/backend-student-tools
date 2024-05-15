const express = require("express");
const CategoryController = require("../../controllers/category.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

router.get("", asyncHandleError(CategoryController.getAllCategories));
router.get("/:id", asyncHandleError(CategoryController.findCategoryById));
//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);
//create book
router.post("", asyncHandleError(CategoryController.createCategory));
router.delete("", asyncHandleError(CategoryController.deleteCategory));

module.exports = router;
