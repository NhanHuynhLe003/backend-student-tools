const { NotFoundError, BadRequestError } = require("../../core/error.response");
const CartModel = require("../models/cart.model");
const StudentModel = require("../models/student.model");
const {
  convertDateToDDMMYYYY,
  convertObjectId,
  getDataInfoResponse,
} = require("../utils");
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
  static async updateBookOrderToStudentStock({
    order,
    book_status = "pending",
    mode = "add",
  }) {
    // Thêm những cuốn sách đang đọc vào kho sách user
    for (const book of order.order_books) {
      // Tách số lượng các quyển sách ra làm từng quyển sách riêng biệt để dễ dàng quản lý
      for (let i = 0; i < book.bookQuantity; i++) {
        const updatePayload =
          mode === "add"
            ? {
                $addToSet: {
                  books_reading: {
                    book_orderId: order._id, // query để kiểm tra trạng thái sách user đọc
                    book_status: book_status,
                    book_checkout: order.order_checkout,
                    book_data: { ...book, bookQuantity: 1 },
                  },
                },
              }
            : {
                $set: {
                  /**
                   $[<identifier>] để chỉ định một phần tử cụ thể trong mảng books_reading 
                   cần được cập nhật, và arrayFilters để xác định điều kiện tìm kiếm phần tử đó
                   */
                  "books_reading.$[elem].book_status": book_status,
                },
              };

        /**
         $set kèm với arrayFilters để cập nhật trạng thái sách dựa trên chỉ mục. 
         arrayFilters giúp xác định chính xác sách nào trong mảng books_reading 
         cần được cập nhật dựa trên book_orderId và book_data.bookId.
         */
        const arrayFilters =
          mode === "add"
            ? []
            : [
                {
                  "elem.book_orderId": order._id,
                  "elem.book_data.bookId": book.bookId,
                },
              ];

        await StudentModel.updateOne(
          {
            _id: order.order_userId,
          },
          updatePayload,
          {
            arrayFilters: arrayFilters,
          }
        );
      }
    }
  }

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
    cartUserId, //Cart User Id
    userInfo = { name: "Nguyen Van A", email: "0308200000", userId: "0001" },
    dateReturnBook = "07-05-2024",
  }) => {
    //1. kiểm tra cart của user có tồn tại không
    const cartFound = await CartModel.findOne({ cart_userId: cartUserId });
    if (!cartFound) throw new NotFoundError("Không tìm thấy giỏ hàng của user");

    //2. kiểm tra giỏ hàng có sách không, nếu rỗng báo lỗi
    if (cartFound.cart_books.length === 0)
      throw new BadRequestError("Giỏ hàng phải có tối thiểu 1 sản phẩm");

    //Kiểm tra sp dc truyền vào có đúng với trong cart hiện tại không
    const listBookCorrectInCart = cartFound.cart_books;

    //2. check danh sách các order sách trong cart để kiểm tra thông tin của sp trong cart có hợp lệ không
    const bookListChecked = await checkBooksOrder({
      bookList: listBookCorrectInCart,
      cart_user_id: cartUserId,
    });

    // nếu sách không hợp lệ thì trong mảng sẽ có gt null
    if (bookListChecked.includes(null)) {
      throw new BadRequestError(
        "Có 1 vài quyển sách đã hết hoặc không tồn tại, vui lòng kiểm tra lại giỏ hàng!"
      );
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
      userInfo: { ...userInfo },
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
    dateBorrowBook = `${new Date().getDate()}/${new Date().getMonth() +
      1}${new Date().getFullYear()}`,
    dateReturnBook = `${new Date().getDate()}/${new Date().getMonth() +
      1}${new Date().getFullYear()}`,
  }) => {
    // 1. kiểm tra lại các thông tin cartUser để tránh bị đổi dữ liệu
    const {
      booksInCart,
      dayReturn,
      totalQuantity,
      userInfo,
    } = await this.checkoutBookReview({
      cartUserId: cartId,
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
        // giải phóng Key sau khi check xong để cho user khác thực hiện
        await releaseLock(keyLock);
      }
    }

    if (keyLockStates.includes(false)) {
      // Trong suốt qúa trình có 1 book có sự thay đổi(Ví dụ số lượng) không thể đặt được
      // nghĩa là lúc này có ng đã order sp đó và làm số lượng sp đó thay đổi
      throw new BadRequestError(
        "1 số quyển sách đã thay đổi hoặc đã hết, vui lòng quay về giỏ hàng để kiểm tra!"
      );
    }

    // sau khi check xong thi tao order
    const newOrder = await OrderModel.create({
      order_books: booksInCart,
      order_checkout: {
        ...userInfo,
        returnDate: dayReturn,
        borrowDate: dateBorrowBook,
      },
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

    //Thêm những cuốn sách đang đọc vào kho sách user
    await this.updateBookOrderToStudentStock({
      order: newOrder,
      book_status: "pending",
      mode: "add",
    });

    // 3. trả về thông tin đơn mượn sách
    return newOrder;
  };

  static returnOrderBookByStudent = async ({ userId, orderId, bookId }) => {
    console.log({ userId, orderId });
    //quyển nào trả rồi thì pull ra khỏi mảng order_books, đồng thời trả số lượng sách vào kho, và update sách đã đọc trong user
    const foundOrder = await OrderModel.findOne({ _id: orderId });

    if (!foundOrder) throw new NotFoundError("Không tìm thấy đơn hàng");

    if (foundOrder.order_status === "completed")
      throw new BadRequestError(
        "Đơn đã được xác nhận trước đó, không thể trả sách"
      );

    if (foundOrder.order_status === "cancel")
      throw new BadRequestError("Đơn đã bị hủy trước đó, không thể trả sách");

    if (foundOrder.order_status === "pending")
      throw new BadRequestError("Đơn chưa được xác nhận, không thể trả sách");

    console.log("foundOrder:::::", foundOrder);

    const foundStudent = await StudentModel.findOne({
      _id: foundOrder.order_userId,
    });
    if (!foundStudent)
      throw new NotFoundError("Không tìm thấy thông tin học sinh!");

    // Lấy ra các quyển sách user đang đọc hiện tại
    const booksStudentReading = foundStudent.books_reading;

    const updateBooksPromises = booksStudentReading.map(async (book) => {
      if (book.book_status !== "indue") return book; // chỉ cập nhật các sách đang đọc
      if (
        book.book_orderId.toString() === orderId.toString() &&
        book.book_data.bookId.toString() === bookId.toString() // Nếu check sách mà không check order thì nó sẽ query luôn những quyển sách của những order khác
      ) {
        // Trả sách vào kho của thư viện
        const bookInStockLib = await bookModel.findOne({
          _id: book.book_data.bookId,
        });
        if (!bookInStockLib)
          throw new NotFoundError("Không tìm thấy sách trong kho");
        bookInStockLib.book_quantity += 1;
        await bookInStockLib.save();

        // Chuyển trạng thái sách từ đang đọc sang hoàn tất
        // book.book_status = "completed";
        // const bookCompleted = book.book_reading.find(book => book.book_status === "completed");
        // book.book_readed.push(bookCompleted);
      }
    });

    // Chờ tất cả các sách cập nhật hoàn tất
    await Promise.all(updateBooksPromises);

    // Lưu đối tượng học sinh sau khi cập nhật sách
    await foundStudent.save();

    console.log("FOUND ORDER:::", foundOrder);

    // Kiểm tra xem đơn hàng còn sách nào không, nếu không còn sách nào thì chuyển trạng thái đơn hàng sang hoàn tất
    // if (foundOrder.) {
    //   foundOrder.order_status = "completed";
    //   await foundOrder.save();
    // }

    return {
      order: foundOrder,
      student: getDataInfoResponse(
        ["_id", "name", "email", "classStudent"],
        foundStudent
      ),
      studentBooks: booksStudentReading,
    };
  };

  static deleteOrderBookByAdmin = async ({ orderId }) => {
    const orderFound = await OrderModel.findOne({
      _id: orderId,
    });

    if (!orderFound) throw new NotFoundError("Không tìm thấy đơn hàng");

    orderFound.order_deleted = true;
    await orderFound.save();

    return orderFound;
  };

  static acceptOrderBookByAdmin = async ({ orderId }) => {
    const orderFound = await OrderModel.findOne({ _id: orderId });

    if (!orderFound) throw new NotFoundError("Không tìm thấy đơn hàng");

    if (orderFound.order_status === "completed")
      throw new BadRequestError("Đơn hàng đã được xác nhận trước đó");

    if (orderFound.order_status === "cancel")
      throw new BadRequestError("Đơn hàng đã bị hủy trước đó");

    if (orderFound.order_status === "pending") {
      orderFound.order_status = "indue"; //Chuyển trạng thái sách học sinh sang đang đọc
      await orderFound.save();
    }

    //Thêm những cuốn sách đang đọc vào kho sách user
    await this.updateBookOrderToStudentStock({
      order: orderFound,
      book_status: "indue",
      mode: "update",
    });

    return orderFound;
  };

  /**
   * @description: hủy đơn hàng bởi user
   * @param {Object} param
   * @param {String} param.orderId - id của order(objectId)
   */
  static cancelOrderBookByUser = async ({ orderId, bookId, userId }) => {
    const order = await OrderModel.findOne({ _id: orderId });

    if (!order) throw new NotFoundError("Không tìm thấy đơn hàng");

    if (order.order_status === "cancel")
      throw new BadRequestError("Đơn mượn sách đã bị hủy trước đó");

    if (order.order_status === "completed")
      throw new BadRequestError("Đơn mượn sách đã hoàn tất không thể hủy");

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

    // hủy đơn hàng bằng cách cập nhật status, có thể để server tự động xử lý xóa sau mỗi 1 tuần, hoặc mình tự xóa thủ công
    order.order_status = "cancel";
    await order.save();

    return order;
  };

  static getAllOrdersByAdmin = async ({ skip = 0, limit = 10 }) => {
    const orders = await OrderModel.find({
      order_deleted: false,
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdOn: -1 })
      .populate("order_userId");

    return orders;
  };

  static getOrderByStudentId = async ({ userId, skip = 0, limit = 0 }) => {
    const orders = await OrderModel.find({ order_userId: userId })
      .skip(skip)
      .limit(limit);
    return orders;
  };
}

module.exports = CheckoutBookService;
