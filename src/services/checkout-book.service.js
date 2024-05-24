const { NotFoundError, BadRequestError } = require("../../core/error.response");
const CartModel = require("../models/cart.model");
const { convertDateToDDMMYYYY, convertObjectId } = require("../utils");
const { checkBooksOrder } = require("../models/repos/book");
const {
  acquireLock,
  releaseLock,
  deleteAllKeyLock,
} = require("../services/redis.service");
const OrderModel = require("../models/order.model");
const {
  deleteBookInCart,
  getListBookInCart,
  checkValidQuantityBookInCart,
} = require("./cart.service");
const BookService = require("./book.service");
const { bookModel } = require("../models/book.model");

class CheckoutBookService {
  /**
   * @description: checkout sách từ giỏ hàng trước khi order
   * @param {Object} param
   * @param {String} param.cartId - id của cart
   * @param {String} param.userId - id của user
   * @param {Array} param.cartBookList - danh sách sách trong giỏ hàng
   * @param {Object} param.userInfo - thông tin user
   * @param {Date} param.dateReturnBook - ngày trả sách
   */
  static checkoutBookReview = async ({
    cartId,
    userId,
    // cartBookList, // sp trong giỏ của user call API cart rồi lấy vào
    userInfo = { name: "Nguyen Van A", email: "0308200000" },
    dateReturnBook = "07-05-2024",
  }) => {
    //1. kiểm tra cart của user có tồn tại không
    const cartFound = await CartModel.findOne({ cart_userId: cartId });
    if (!cartFound) throw new NotFoundError("Không tìm thấy giỏ hàng của user");

    //2. kiểm tra giỏ hàng có sách không, nếu rỗng báo lỗi
    if (cartFound.cart_books.length === 0)
      throw new BadRequestError("Giỏ hàng phải có tối thiểu 1 sản phẩm");

    //Kiểm tra sp dc truyền vào có đúng với trong cart hiện tại không
    const listBookCorrectInCart = cartFound.cart_books;

    //2. check danh sách các order sách trong cart để kiểm tra thông tin của sp trong cart có hợp lệ không
    const bookListChecked = await checkBooksOrder({
      bookList: listBookCorrectInCart,
      cartId: cartId,
    });

    // nếu sách không hợp lệ thì trong mảng sẽ có gt null
    if (bookListChecked.includes(null)) {
      throw new BadRequestError("Có sách không hợp lệ trong giỏ hàng");
    }

    //tính toán tổng số lượng sách
    const totalBookQuantity = bookListChecked.reduce(
      (total, book) => total + book.bookQuantity,
      0
    );
    //4. trả về thông tin cần thiết của đơn hàng
    const response = {
      booksInCart: bookListChecked,
      totalQuantity: totalBookQuantity,
      userInfo: { ...userInfo, userId },
      dayReturn: dateReturnBook,
    };

    return response;
  };

  static deleteAllKeyLockOrderRedis = async () => {
    await deleteAllKeyLock();
  };

  static orderBookStudent = async ({
    userId,
    cartId,
    cartBookList,
    userInformation = {},
    dateReturnBook = "07-05-2024",
  }) => {
    // 1. kiểm tra lại các thông tin cartUser để tránh bị đổi dữ liệu
    const {
      booksInCart,
      dayReturn,
      totalQuantity,
      userInfo,
    } = await this.checkoutBookReview({
      cartId, // id cua cart
      userId, // id cua user
      cartBookList,
      userInfo: userInformation,
      dateReturnBook,
    });

    // 2. kiểm tra số lượng sách còn trong kho xem sách có vượt quá số lượng còn không, đồng thời
    // dùng khóa lạc quan (optimistic locking) giúp chặn nhiều luồng chỉ cho phép 1 luồng thực hiện, tránh nhiều user đặt cùng 1 quyển sách

    const keyLockStates = []; //lưu các trạng thái của keyLock

    for (let book of booksInCart) {
      const { bookId, bookQuantity } = book;
      const keyLock = await acquireLock(
        bookId.toString(),
        bookQuantity,
        cartId
      );

      keyLockStates.push(keyLock ? true : false);
      console.log("Key Received:::", keyLock);
      if (keyLock) {
        // giải phóng Key sau khi check xong
        await releaseLock(keyLock);
      }
    }

    if (keyLockStates.includes(false)) {
      // Trong suốt qúa trình có 1 book có sự thay đổi(Ví dụ số lượng) không thể đặt được
      // nghĩa là lúc này có ng đã order sp đó và làm số lượng sp đó thay đổi
      throw new BadRequestError(
        "1 số quyển sách đã thay đổi, quay về giỏ hàng để kiểm tra!"
      );
    }

    // sau khi check xong thi tao order
    const newOrder = await OrderModel.create({
      order_books: booksInCart,
      order_checkout: { ...userInfo, returnDate: dayReturn },
      order_userId: userId,
      order_status: "pending",
    });

    // Bỏ toàn bộ book trong cart sau khi đã order
    if (newOrder) {
      await CartModel.findOneAndUpdate(
        { cart_userId: cartId },
        { cart_books: [] }
      );
    }

    // 3. trả về thông tin đơn hàng
    return newOrder;
  };

  /**
   * @description: hủy đơn hàng bởi user
   * @param {Object} param
   * @param {String} param.orderId - id của order(objectId)
   */
  static cancelOrderBookByUser = async ({ orderId }) => {
    const order = await OrderModel.findOne({ _id: orderId });
    if (order.order_status === "cancel")
      throw new BadRequestError("Đơn hàng đã bị hủy trước đó");

    if (order.order_status === "done")
      throw new BadRequestError("Đơn hàng đã được xác nhận không thể hủy");

    // trả lại sách vào kho
    const foundOrder = await OrderModel.findById(orderId);

    if (!foundOrder) throw new NotFoundError("Không tìm thấy đơn hàng");
    const { order_books } = foundOrder;
    for (let book of order_books) {
      //lấy ra sách trong kho
      const bookInStock = await bookModel.findOne({
        _id: book.bookId,
      });
      if (!bookInStock)
        throw new NotFoundError("Không tìm thấy sách trong kho");

      await BookService.updateBookById({
        id: book.bookId,
        payload: {
          book_quantity: bookInStock.book_quantity + book.bookQuantity,
        },
      });
    }

    // hủy đơn hàng bằng cách cập nhật status, có thể để server tự động xử lý sau mỗi 30 ngày
    order.order_status = "cancel";
    await order.save();

    return order;
  };
}

module.exports = CheckoutBookService;
