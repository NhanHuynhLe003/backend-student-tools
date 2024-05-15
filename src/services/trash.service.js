const { NotFoundError } = require("../../core/error.response");
const { updateBookById, deleteBookForeverById } = require("./book.service");
const {
  findAllTrash,
  findBookTrashById,
  findAdminDeleteBook,
  deleteTrashByBookId,
} = require("../models/repos/trash");
const TrashModel = require("../models/trash.model");
const { convertObjectId } = require("../utils");
class TrashService {
  static async findAllTrash() {
    return await findAllTrash();
  }

  static async findBookTrashById({ book_id }) {
    const res = await findBookTrashById(book_id);
    if (!res) throw NotFoundError("not found book");
    return res;
  }

  static async findAdminDeleteBook({ admin_id }) {
    const res = await findAdminDeleteBook(admin_id);
    if (!res) throw NotFoundError("not found user");
    return res;
  }

  static async restoreBook({ book_id }) {
    console.log(book_id);
    const foundTrash = await findBookTrashById(book_id);

    if (!foundTrash) throw new NotFoundError("not found book");
    // thêm modify isDeleted = false trở lại Book collection, trc đó khi query các service khác sẽ filter isDelete = false
    const bookDataUpdated = await updateBookById({
      id: book_id,
      payload: { book_isDelete: false },
    });
    // xóa sách khỏi Trash collection
    if (!bookDataUpdated) throw new NotFoundError("failed to restore book");
    const res = await deleteTrashByBookId(book_id);

    return res;
  }

  static async deleteBookInTrash({ book_id }) {
    const foundTrash = findBookTrashById(book_id);
    if (!foundTrash) throw new NotFoundError("not found book");

    // xóa sách khỏi Trash collection, phải xóa trong trash trước vì theo quy trình thì user phải thêm sp vào thùng rác rồi vào thùng rác xóa
    const countDel = await deleteTrashByBookId(book_id);
    if (!countDel) throw new NotFoundError("Not Found Book in Trash");
    // xóa sách khỏi book collection
    const res = await deleteBookForeverById({ id: book_id });

    return res;
  }

  /**
   Hàm nên được xử lý trong middleware (chua handle)
   */
  static async autoDeleteBookInTrash(day = 1) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const res = await TrashModel.deleteMany({
      createdAt: { $lte: date }, // những sách được thêm vào thùng rác sau 30 ngày sẽ bị xóa
    });
    return res;
  }
}
module.exports = TrashService;
