const express = require("express");
const CategoryController = require("../../controllers/category.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

router.get(
  "/published",
  asyncHandleError(CategoryController.getCategoriesPublished)
);
router.get(
  "/published/:id",
  asyncHandleError(CategoryController.findCategoryById)
);

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);
console.log("FOUND CATE AUTH");
router.get("/all", asyncHandleError(CategoryController.getAllCategories));
//create book
router.post("/create", asyncHandleError(CategoryController.createCategory));
router.delete("/remove", asyncHandleError(CategoryController.deleteCategory));

module.exports = router;
