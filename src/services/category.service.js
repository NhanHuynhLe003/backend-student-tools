const {
  getAllCategories,
  findCatePublishedById,
  createCate,
  deleteCate,
  getCategoriesPublished,
} = require("../models/repos/category");

class CategoryService {
  static async getCategoriesPublished() {
    return await getCategoriesPublished();
  }
  static async getAllCategories() {
    return await getAllCategories();
  }

  static async findCatePublishedById({ id }) {
    return await findCatePublishedById(id);
  }

  static async createCategory({ cate_name, cate_desc, isPublished = true }) {
    return await createCate({ cate_name, cate_desc, isPublished });
  }

  static async deleteCategory({ id }) {
    //nên xử lý luôn việc xóa toàn bộ id của cate trong các quyển sách
    return await deleteCate({ id });
  }
}
module.exports = CategoryService;
