"use strict";

const CheckoutService = require("../services/checkout-book.service");
const { Created, SuccessResponse } = require("../../core/success.response");
class CheckoutController {
  async checkoutBookOrder(req, res, next) {
    // ko async await ở đây sẽ gây lỗi Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    new SuccessResponse({
      message: "Kiểm tra đơn mượn sách thành công",
      metadata: await CheckoutService.checkoutBookReview({ ...req.body }),
    }).send(res);
  }

  async orderBookStudent(req, res, next) {
    new Created({
      message: "Đã mượn sách thành công, vui lòng chờ Admin xác nhận",
      metadata: await CheckoutService.orderBookStudent({ ...req.body }),
    }).send(res);
  }

  async deleteAllKeyRedis(req, res, next) {
    new SuccessResponse({
      message: "Delete all key lock redis thành công",
      metadata: await CheckoutService.deleteAllKeyLockOrderRedis(),
    }).send(res);
  }

  async cancelOrderByUser(req, res, next) {
    new SuccessResponse({
      message: "Hủy đơn hàng thành công",
      metadata: await CheckoutService.cancelOrderBookByUser(req.params),
    }).send(res);
  }
}

module.exports = new CheckoutController();
