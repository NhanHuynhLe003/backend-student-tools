const { default: mongoose } = require("mongoose");
const CategoryModel = require("../../category.model");
const { Types } = require("mongoose");
const bookModel = require("../../book.model");
const { NotFoundError } = require("../../../../core/error.response");
const getAllCategories = async () => {
  return await CategoryModel.find()
    .lean()
    .exec();
};

const getCategoriesPublished = async () => {
  return await CategoryModel.find({ isPublished: true })
    .lean()
    .exec();
};

const findCatePublishedById = async (id) => {
  const res = await CategoryModel.find({
    _id: Types.ObjectId(id),
    isPublished: true,
  })
    .lean()
    .exec();

  return res;
};

const createCate = async ({ cate_name, cate_desc, isPublished }) => {
  return await CategoryModel.create({
    name: cate_name,
    description: cate_desc,
    isPublished,
  });
};

const deleteCate = async ({ id }) => {
  //xóa id trong mảng của các quyển sách có id đó

  const categoryFound = await CategoryModel.findById(id);
  if (!categoryFound) throw new NotFoundError("Không tìm thấy thể loại");

  //Ẩn thể loại này đi
  categoryFound.isPublished = false;
  await categoryFound.save();

  return categoryFound;
};
module.exports = {
  getCategoriesPublished,
  getAllCategories,
  findCatePublishedById,
  createCate,
  deleteCate,
};
