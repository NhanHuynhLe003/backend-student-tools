const { BadRequestError, NotFoundError } = require("../../core/error.response");
const { bookModel } = require("../models/book.model");
const CartModel = require("../models/cart.model");
const {
  createNewCart,
  getListBookInCart,
  checkValidQuantityBookInCart,
} = require("../models/repos/cart");
const { convertObjectId } = require("../utils");
const BookService = require("./book.service");

class CartService {
  static createCart = async ({ userId, book }) => {
    const query = { cart_userId: userId, cart_state: "active" };
    const updatePayload = {
      $addToSet: { cart_books: book },
    };
    const option = {
      upsert: true, // nếu không tìm thấy thì tạo mới cart
      new: true, // trả về dữ liệu mới sau khi update
    };
    return await createNewCart({ query, updatePayload, option });
  };

  static createEmptyCart = async ({ userId }) => {
    const query = { cart_userId: userId, cart_state: "active" };

    const foundCart = await CartModel.findOne(query);

    //Nếu tìm thấy cart thì trả về cart đó, còn nếu chưa tạo cart thì tạo mới cart rỗng
    if (foundCart) return foundCart;

    const updatePayload = {
      $set: { cart_books: [] },
    };
    const option = {
      upsert: true, // nếu không tìm thấy thì tạo mới cart
      new: true, // trả về dữ liệu mới sau khi update
    };
    return await createNewCart({ query, updatePayload, option });
  };

  static async updateUserCartQuantity({ userId, book }) {
    const { bookId, quantity } = book;

    const foundBook = await bookModel.findOne({
      _id: bookId,
    });

    const foundCart = await CartModel.findOne({
      cart_userId: userId,
      cart_state: "active",
    });
    const currentBookInCart = foundCart.cart_books.find(
      (book) => book.bookId.toString() === bookId.toString()
    );

    if (!foundBook)
      throw new NotFoundError("Không tìm thấy sách trong hệ thống !");
    if (foundBook.book_quantity < currentBookInCart.quantity + quantity)
      throw new BadRequestError("Số lượng sách trong kho không đủ !");

    if (!checkValidQuantityBookInCart({ userId, bookId, quantity }))
      throw new BadRequestError("Sản phẩm trong giỏ hàng không hợp lệ !");

    const query = {
      cart_userId: userId,
      "cart_books.bookId": bookId, // lấy ra quyển sách trong mảng có bookId trùng với bookId truyền vào
      cart_state: "active",
    };
    const updateQuantity = {
      $inc: {
        "cart_books.$.quantity": quantity, //$ là item book hiện tại đang xét trong mảng cart_books
        /**
         vd truyen vao book : {bookId: "123", quantity: 3} mà ban đầu quantity = 5 
         => output: {bookIdL "123", quantity: 5+3 = 8} => nếu giảm thì truyền số âm vào
         */
      },
    };
    const options = { upsert: true, new: true };
    return await CartModel.findOneAndUpdate(query, updateQuantity, options);
  }

  /**
   * @description Thêm sách vào giỏ hàng hoặc update số lượng sách trong giỏ hàng nếu trùng lặp
   * @param {string} userId id của user
   * @param {object} book thông tin sách cần thêm vào giỏ hàng
   * @returns {Promise<CartModel>} trả về giỏ hàng sau khi thêm sách
   */
  static addBookToCart = async ({ userId, book = {} }) => {
    //1. kiểm tra xem user đã có cart chưa

    const { bookId, quantity } = book;
    const userCart = await CartModel.findOne({
      cart_userId: userId,
      cart_state: "active",
    });
    if (!userCart) {
      //when user cart is not created
      return await this.createCart({ userId, book });
    }

    //1.1 Nếu sản phẩm trong kho đã hết thì không thêm vào giỏ hàng
    const foundBook = await bookModel.findOne({
      _id: bookId,
    });
    if (!foundBook)
      throw new NotFoundError("Không tìm thấy sách trong hệ thống !");
    if (foundBook.book_quantity === 0)
      throw new BadRequestError(
        "Quyển sách này đã hết, vui lòng chọn sách khác!"
      );

    //2. Trường hợp Cart đã tạo ra mà chưa có sp, hoặc sp trong cart đã bị xóa hết còn mảng rỗng
    if (userCart.cart_books.length === 0) {
      userCart.cart_books = [book]; // thêm sp vào cart
      return await userCart.save(); //cap nhat gio hang, ko lean mới dùng được kiểu này
    }
    //3. Trường hợp còn lại là Cart đã tạo ra và đã có sp

    //3.1 kiểm tra xem sp đã có trong cart chưa, nếu có thì tăng số lượng sp trong giỏ hàng
    const isProductExist = userCart.cart_books.some(
      (item) => item.bookId?.toString() === book.bookId?.toString()
    );

    if (isProductExist) {
      return await this.updateUserCartQuantity({ userId, book });
    }

    //3.2 nếu sp chưa có trong cart thì thêm mới vào cart
    userCart.cart_books.push(book);

    return await userCart.save();
  };

  static deleteBookInCart = async ({ userId, bookId }) => {
    //1. kiểm tra xem user đã có cart chưa
    const query = {
      cart_userId: userId,
      cart_state: "active",
    };

    //2. kiểm tra xem sp đã có trong cart chưa, nếu có thì xóa sp trong giỏ hàng
    const updatePayload = {
      $pull: {
        cart_books: { bookId: bookId },
      },
    };

    //3. new: true trả về dữ liệu mới sau khi update
    const options = { new: true };
    return await CartModel.findOneAndUpdate(query, updatePayload, options);
  };

  static getListBookInCart = async ({ userId, skip = 0, limit = 10 }) => {
    console.log({ userId, skip, limit });
    const res = await getListBookInCart({ userId, skip, limit });

    // Trường hợp mới vào chưa có cart thì trả về mảng rỗng, ko phải là null
    return res ? res.cart_books : [];
  };

  static checkBookExistInStudentBookshelf = async ({ userId, bookId }) => {
    //Nếu có thì trả về true, còn không thì trả về false
  };
}

module.exports = CartService;
