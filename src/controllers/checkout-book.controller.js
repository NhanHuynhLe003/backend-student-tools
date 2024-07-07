"use strict";

const CheckoutService = require("../services/checkout-book.service");
const { Created, SuccessResponse } = require("../../core/success.response");
const OrderModel = require("../models/order.model");
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

  async getAllOrderByAdmin(req, res, next) {
    const totalOrder = await OrderModel.countDocuments();
    new SuccessResponse({
      message: "Lấy danh sách tất cả đơn mượn sách thành công",
      metadata: await CheckoutService.getAllOrdersByAdmin({ ...req.query }),
      options: { total: totalOrder },
    }).send(res);
  }

  async getOrderByStudentId(req, res, next) {
    new SuccessResponse({
      message: "Lấy danh sách đơn mượn sách của học sinh thành công",
      metadata: await CheckoutService.getOrderByStudentId({
        ...req.params,
        ...req.query,
      }),
    }).send(res);
  }

  async acceptOrderByAdmin(req, res, next) {
    new SuccessResponse({
      message: "Đã xác nhận đơn thành công",
      metadata: await CheckoutService.acceptOrderBookByAdmin(req.params),
    }).send(res);
  }

  async deleteOrderByAdmin(req, res, next) {
    new SuccessResponse({
      message: "Đã xóa đơn hàng thành công",
      metadata: await CheckoutService.deleteOrderBookByAdmin(req.params),
    }).send(res);
  }

  async returnBookOrder(req, res, next) {
    new SuccessResponse({
      message: "Trả sách thành công",
      metadata: await CheckoutService.returnOrderBookByStudent(req.body),
    }).send(res);
  }
}

module.exports = new CheckoutController();
