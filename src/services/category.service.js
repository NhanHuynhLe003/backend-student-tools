const {
  getAllCategories,
  findCateById,
  createCate,
  deleteCate,
} = require("../models/repos/category");

class CategoryService {
  static async getAllCategories() {
    return await getAllCategories();
  }

  static async findCateById({ id }) {
    console.log("ID CATE: ", id);
    return await findCateById(id);
  }

  static async createCategory({ cate_name, cate_desc }) {
    return await createCate({ cate_name, cate_desc });
  }

  static async deleteCategory({ id }) {
    //nên xử lý luôn việc xóa toàn bộ id của cate trong các quyển sách
    return await deleteCate({ id });
  }
}
module.exports = CategoryService;
