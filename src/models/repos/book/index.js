const { Types } = require("mongoose");
const { bookModel } = require("../../book.model");
const CategoryService = require("../../../services/category.service");
const { checkValidQuantityBookInCart } = require("../cart");
const CategoryModel = require("../../category.model");

const deleteBookForeverById = async ({ book_id }) => {
  return await bookModel.findByIdAndDelete(book_id);
};

const getAllBookInStock = async ({ skip, limit }) => {
  return await bookModel
    .find({
      book_isDelete: false,
      isPublished: true,
      book_quantity: { $gt: 0 }, // số lượng sách còn trong kho > 0
    })
    .sort({ book_quantity: -1 }) // sắp xếp theo số lượng sách còn trong kho giảm dần
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const sortBookByNewest = async ({ skip, limit }) => {
  return await bookModel
    .find({ book_isDelete: false, isPublished: true })
    .sort({ updatedAt: -1 }) // sắp xếp theo thời gian tạo mới nhất
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const sortBookByRatings = async ({ skip, limit }) => {
  return await bookModel
    .find({ book_isDelete: false, isPublished: true })
    .sort({ book_ratingsAverage: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const sortBookByFavourite = async ({ skip, limit }) => {
  return await bookModel
    .find({ book_isDelete: false, isPublished: true })
    .sort({ book_favourites: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const sortBookByReadView = async ({ skip, limit }) => {
  return await bookModel
    .find({ book_isDelete: false, isPublished: true })
    .sort({ book_num_readed: -1 }) // sắp xếp theo số lượt đọc giảm dần
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const findBookDraftDetail = async ({ book_id }) => {
  const bookFound = await bookModel
    .findOne({ _id: book_id, isDraft: true, book_isDelete: false })
    .lean()
    .exec();

  return bookFound;
};

const findBookPublishDetail = async ({ book_id }) => {
  const bookFound = await bookModel
    .findOne({ _id: book_id, isPublished: true, book_isDelete: false })
    .lean()
    .exec();

  if (!bookFound) return null;
  const categoryBookList = [];
  const listBookGenreNew = bookFound.book_genre.map(async (cateId) => {
    // Tìm kiếm danh mục theo id của sách
    const category = await CategoryModel.findOne({ _id: cateId })
      .lean()
      .exec();
    if (!category) return null;
    return category;
  });

  // Chờ tất cả các promise trả về
  await Promise.all(listBookGenreNew).then((res) => {
    categoryBookList.push(...res);
  });

  return {
    ...bookFound,
    categoryBookList,
  };
};

const findBookByCate = async ({ category_id }) => {
  const category = await CategoryService.findCatePublishedById({
    id: category_id,
  });

  if (!category) return null;

  return await bookModel
    .find({
      book_isDelete: false,
      isPublished: true, // only get published book
      book_genre: { $in: [category_id] },
    })
    .lean()
    .exec();
};

const findBookByText = async (textSearch) => {
  const pattern = new RegExp(textSearch);
  return await bookModel
    .find(
      {
        book_isDelete: false,
        isPublished: true,
        $text: { $search: pattern },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } });
};
async function findDraftBook({ query, skip, limit }) {
  return await bookModel
    .find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}
async function findPublishBook({ query, skip, limit }) {
  return await bookModel
    .find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}

const publishBook = async ({ book_id }) => {
  const foundBook = await bookModel.findOne({
    _id: new Types.ObjectId(book_id),
    book_isDelete: false,
  });

  if (!foundBook) return null;

  foundBook.isDraft = false;
  foundBook.isPublished = true;

  const { modifiedCount } = await foundBook.updateOne(foundBook);
  return modifiedCount;
};

const unPublishBook = async ({ book_id }) => {
  const foundBook = await bookModel.findOne({
    _id: new Types.ObjectId(book_id),
    book_isDelete: false,
  });

  if (!foundBook) return null;

  foundBook.isDraft = true;
  foundBook.isPublished = false;

  const { modifiedCount } = await foundBook.updateOne(foundBook);
  return modifiedCount;
};

const updateBookById = async ({ id, payload, isNew = true }) => {
  const newDataBook = await bookModel.findByIdAndUpdate(id, payload, {
    new: isNew,
  });

  return newDataBook;
};

const checkBooksOrder = async ({ bookList, cart_user_id }) => {
  // chờ tất cả các promise trả về

  return await Promise.all(
    bookList.map(async (book) => {
      const bookChecked = await bookModel
        .findOne({
          _id: book.bookId,
        })
        .populate("book_genre")
        .lean();

      // kiểm tra số lượng sách trong giỏ hàng có hợp lệ không
      const isValidQuantity = await checkValidQuantityBookInCart({
        userId: cart_user_id,
        bookId: book.bookId,
        quantity: book.quantity,
      });

      if (bookChecked && isValidQuantity) {
        // số lượng sp trong giỏ phải bé hơn hoặc bằng số lượng sp trong kho
        //book.quantity <= bookChecked.quantity
        return {
          bookId: book.bookId,
          bookReaded: false,
          bookName: bookChecked.book_name,
          bookQuantity: book.quantity,
          bookCategory: bookChecked.book_genre,
          bookThumb: bookChecked.book_thumb,
        };
      } else {
        // nếu sách không hợp trả về null
        return null;
      }
    })
  );
};
module.exports = {
  findDraftBook,
  publishBook,
  unPublishBook,
  findPublishBook,
  findBookByText,
  findBookByCate,
  findBookPublishDetail,
  findBookDraftDetail,
  updateBookById,
  deleteBookForeverById,
  sortBookByReadView,
  sortBookByFavourite,
  sortBookByRatings,
  sortBookByNewest,
  getAllBookInStock,
  checkBooksOrder,
};
