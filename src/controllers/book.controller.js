const { Created, SuccessResponse } = require("../../core/success.response");
const BookService = require("../services/book.service");

class BookController {
  createBook = async (req, res, next) => {
    console.log("ROUTE:::createBook");
    new Created({
      message: "Tạo sách mới thành công",
      metadata: await BookService.createBook(req.body),
    }).send(res);
  };

  updateBookById = async (req, res, next) => {
    new Created({
      message: "Cập nhật sách thành công",
      metadata: await BookService.updateBookById({
        id: req.params.id,
        payload: { ...req.body },
      }),
    }).send(res);
  };

  findBookDraftDetail = async (req, res, next) => {
    new Created({
      message: "Tìm bản nháp chi tiết thành công",
      metadata: await BookService.findBookDraftDetail(req.params),
    }).send(res);
  };

  findBookPublishDetail = async (req, res, next) => {
    new Created({
      message: "Tìm sách chi tiết đã publish thành công",
      metadata: await BookService.findBookPublishDetail(req.params),
    }).send(res);
  };

  findBookByCategory = async (req, res, next) => {
    new Created({
      message: "Tìm sách theo thể loại thành công",
      metadata: await BookService.findBookByCategory(req.params),
    }).send(res);
  };

  findDraftBook = async (req, res, next) => {
    new Created({
      message: "Tìm bản nháp thành công",
      metadata: await BookService.findDraftBook(req.query),
    }).send(res);
  };

  findPublishBook = async (req, res, next) => {
    new Created({
      message: "Tìm sách đã xuất bản thành công",
      metadata: await BookService.findPublishBook(req.query),
    }).send(res);
  };

  findBookByText = async (req, res, next) => {
    new Created({
      message: "Tìm sách theo từ khóa thành công",
      metadata: await BookService.findBookByText(req.params.textSearch),
    }).send(res);
  };

  publishBook = async (req, res, next) => {
    new Created({
      message: "Xuất bản sách thành công",
      metadata: await BookService.publishBook(req.params),
    }).send(res);
  };

  unPublishBook = async (req, res, next) => {
    new Created({
      message: "Chuyển sang bản nháp sách thành công",
      metadata: await BookService.unPublishBook(req.params),
    }).send(res);
  };

  deleteBookById = async (req, res, next) => {
    new Created({
      message: "Xóa sách thành công",
      metadata: await BookService.deleteBookById({
        id: req.params.id,
        userId: req.user.userId, // Sau khi xác thực thì req sẽ lưu trữ userId, trong tương lai sẽ phân quyền user và admin sau
      }),
    }).send(res);
  };

  sortBookByReadView = async (req, res, next) => {
    new SuccessResponse({
      message: "Sắp xếp sách theo lượt đọc thành công",
      metadata: await BookService.sortBookByReadView({ skip: 0, limit: 50 }),
    }).send(res);
  };

  sortBookByFavourite = async (req, res, next) => {
    new SuccessResponse({
      message: "Sắp xếp sách theo lượt yêu thích thành công",
      metadata: await BookService.sortBookByFavourite({ skip: 0, limit: 50 }),
    }).send(res);
  };

  sortBookByRatings = async (req, res, next) => {
    new SuccessResponse({
      message: "Sắp xếp sách theo lượt đánh giá thành công",
      metadata: await BookService.sortBookByRatings({ skip: 0, limit: 50 }),
    }).send(res);
  };

  sortBookByNewest = async (req, res, next) => {
    new SuccessResponse({
      message: "Sắp xếp sách theo mới nhất thành công",
      metadata: await BookService.sortBookByNewest({ skip: 0, limit: 50 }),
    }).send(res);
  };

  getAllBookInStock = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách các quyển sách còn trong kho thành công",
      metadata: await BookService.getAllBookInStock({ skip: 0, limit: 50 }),
    }).send(res);
  };

  mergeFilterBook = async (req, res, next) => {
    new SuccessResponse({
      message: "Lọc sách theo điều kiện thành công",
      metadata: await BookService.mergeFilterBook(req.query),
    }).send(res);
  };
}
module.exports = new BookController();
