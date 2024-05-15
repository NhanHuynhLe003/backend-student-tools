const { default: mongoose } = require("mongoose");
const CategoryModel = require("../../category.model");
const { Types } = require("mongoose");
const bookModel = require("../../book.model");
const getAllCategories = async () => {
  return await CategoryModel.find().lean().exec();
};

const findCateById = async (id) => {
  const res = await CategoryModel.findById(id).lean().exec();
  console.log("RES:::::::", res);
  return res;
};

const createCate = async ({ cate_name, cate_desc }) => {
  return await CategoryModel.create({
    name: cate_name,
    description: cate_desc,
  });
};

const deleteCate = async ({ id }) => {
  //xóa id trong mảng của các quyển sách có id đó
  await bookModel.updateMany(
    {
      book_genre: {
        $in: [Types.ObjectId(id)],
      } /*nếu id nằm trong mảng categories*/,
    },
    { $pull: { book_genre: Types.ObjectId(id) } /** Lấy id nó ra khỏi mảng */ }
  );
  return await CategoryModel.findByIdAndDelete(id).lean().exec();
};
module.exports = { getAllCategories, findCateById, createCate, deleteCate };
