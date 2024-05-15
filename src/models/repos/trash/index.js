const { convertObjectId } = require("../../../utils");
const TrashModel = require("../../trash.model");

const deleteTrashByBookId = async (id) => {
  const { deletedCount } = await TrashModel.deleteOne({
    book_id: convertObjectId(id),
  });
  console.log("Deleted count: ", deletedCount);
  return deletedCount;
};

const findAllTrash = async () => {
  return await TrashModel.find().lean().exec();
};

const findBookTrashById = async (id) => {
  const response = await TrashModel.find({ book_id: convertObjectId(id) })
    .lean()
    .exec();
  if (!response) return null;
  return response;
};

const findAdminDeleteBook = async (id) => {
  const res = await TrashModel.find({ admin_id: convertObjectId(id) })
    .lean()
    .exec();
  if (!res) return null;
  return res;
};

module.exports = {
  findAllTrash,
  findBookTrashById,
  findAdminDeleteBook,
  deleteTrashByBookId,
};
