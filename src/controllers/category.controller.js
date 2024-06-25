"use strict";

const CategoryService = require("../services/category.service");
const { Created, SuccessResponse } = require("../../core/success.response");
class CategoryController {
  createCategory = async (req, res, next) => {
    new Created({
      message: "Tạo thể loại mới thành công",
      metadata: await CategoryService.createCategory(req.body),
    }).send(res);
  };

  findCategoryById = async (req, res, next) => {
    new SuccessResponse({
      message: "Tìm thể loại theo id thành công",
      metadata: await CategoryService.findCatePublishedById(req.params),
    }).send(res);
  };
  getAllCategories = async (req, res, next) => {
    new SuccessResponse({
      message: "Tìm thể loại thành công",
      metadata: await CategoryService.getAllCategories(),
    }).send(res);
  };

  deleteCategory = async (req, res, next) => {
    new Created({
      message: `Xóa thể loại ${req.params.id} thành công`,
      metadata: await CategoryService.deleteCategory(req.params),
    }).send(res);
  };

  getCategoriesPublished = async (req, res, next) => {
    new Created({
      message: "Tìm thể loại đã công bố thành công",
      metadata: await CategoryService.getCategoriesPublished(),
    }).send(res);
  };
}

module.exports = new CategoryController();
