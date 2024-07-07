const mongoose = require("mongoose");

// category.model.js
const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new mongoose.Schema(
  {
    order_userId: {
      //chứa id của student
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    order_checkout: {
      // chứa các thông tin của đơn hàng như tên, email, số điện thoại, lớp, ngày trả sách
      required: true,
      type: Object,
    },

    order_books: {
      // chứa các quyển sách cần thanh toán trong giỏ hàng
      type: [],
      required: true,
    },

    order_status: {
      // trạng thái đơn hàng - quan trọng vì user có thể hủy sách trong lúc chờ admin xác nhận
      type: String,
      enum: ["pending", "completed", "cancelled", "overdue", "indue"], //indue: đang mượn, overdue: quá hạn, completed: đã trả, cancelled: đã hủy
      default: "pending",
    },
    order_deleted: {
      // trạng thái xóa đơn hàng
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdOn",
      updatedAt: "modifiedOn",
    },
    collection: COLLECTION_NAME,
  }
);

const OrderModel = mongoose.model(DOCUMENT_NAME, orderSchema);

module.exports = OrderModel;
