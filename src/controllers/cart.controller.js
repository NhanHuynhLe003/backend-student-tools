const { SuccessResponse, Created } = require("../../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  createCart = async (req, res, next) => {
    new Created({
      message: "Tạo giỏ hàng thành công",
      metadata: await CartService.createCart(req.body),
    }).send(res);
  };

  /**
   * @description Thêm sách vào giỏ hàng hay update số lượng sách trong giỏ hàng khi trùng lặp
   * @url POST v1/api/cart/add
   */
  addBookToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Thêm sách vào giỏ hàng thành công",
      metadata: await CartService.addBookToCart(req.body),
    }).send(res);
  };

  deleteBookInCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Xóa sách khỏi giỏ hàng thành công",
      metadata: await CartService.deleteBookInCart(req.body),
    }).send(res);
  };

  getListBookInCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách sản phẩm trong giỏ hàng thành công",
      metadata: await CartService.getListBookInCart({
        userId: req.params.id,
        skip: req.query.skip || 0,
        limit: req.query.limit || 10,
      }),
    }).send(res);
  };

  updateBookQuantityInCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật số lượng sách trong giỏ hàng thành công",
      metadata: await CartService.updateUserCartQuantity(req.body),
    }).send(res);
  };

  createEmptyCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Tạo giỏ hàng rỗng thành công",
      metadata: await CartService.createEmptyCart(req.body),
    }).send(res);
  };
}

module.exports = new CartController();
