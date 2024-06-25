const { bookModel } = require("../../book.model");
const CartModel = require("../../cart.model");

const createNewCart = async ({ query, updatePayload, option }) => {
  return await CartModel.findOneAndUpdate(query, updatePayload, option);
};

const getListBookInCart = async ({ userId, skip, limit }) => {
  return await CartModel.findOne({
    cart_userId: userId,
    cart_state: "active",
  })
    .populate("cart_books.bookId")
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const checkValidQuantityBookInCart = async ({ userId, bookId, quantity }) => {
  const bookFoundById = await bookModel.findOne({ _id: bookId });
  if (!bookFoundById) return false; // không tìm thấy sách trong kho

  const foundCurrentCart = await CartModel.findOne({ cart_userId: userId });
  if (!foundCurrentCart) return false; // không tìm thấy giỏ hàng của user
  const currentBookInCart = foundCurrentCart.cart_books.filter(
    (book) => book?.bookId?.toString() === bookId?.toString()
  );

  // nếu số lượng sách truyền vào vượt quá tồn kho thì báo lỗi
  if (quantity > bookFoundById.book_quantity) {
    return false; // số lượng sách trong giỏ hàng vượt quá số lượng sách trong kho
  }

  return true; // sp trong giỏ hợp lệ
};

module.exports = {
  createNewCart,
  getListBookInCart,
  checkValidQuantityBookInCart,
};
