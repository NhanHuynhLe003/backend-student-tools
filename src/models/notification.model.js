const mongoose = require("mongoose");

// Trash.model.js
const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

const NotificationSchema = new mongoose.Schema(
  {
    noti_type: {
      type: String,
      enum: ["NEW_BOOK", "BORROW", "RETURN", "COMMENT"],
      required: true,
    },
    noti_senderId: {
      type: mongoose.Schema.Types.ObjectId, //Thường là id của ADMIN
      required: true,
      ref: "User",
    },
    noti_receiverId: {
      //Thường là id của USER, ta có thể PROMISE.ALL lấy những USER Online hiện tại sau đó dùng RabbitMQ để gửi thông báo, hoặc lưu vào DB để lấy thông báo khi USER đăng nhập
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    noti_content: {
      type: String,
      default: "No content",
    },
    noti_options: {
      type: Object,
      default: {}, // Có thể chứa thông tin thêm như ID của sách, ID của bình luận, ID của người mượn, ID của người trả, ...
    },
    noti_status: {
      //Khi user bấm vào nút mở thông báo thì sẽ trigger API chuyển thành READ
      type: String,
      enum: ["READ", "UNREAD"],
      default: "UNREAD",
    },
    roleRead: {
      type: String,
      enum: ["ADMIN", "USER"], //ADMIN sẽ xem được tất cả thông báo, USER chỉ xem được thông báo của mình
      default: "USER",
    },
    imgs: {
      //Có thể chứa ảnh của sách, ảnh của người mượn, ảnh của người trả, ảnh của bình luận, ...
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true, //Dựa vào đây để Clear thông báo đối với các thông báo, trừ các thông báo:NEARLY_OVERDUE, OVERDUE
    collection: COLLECTION_NAME,
  }
);

const NotificationModel = mongoose.model(DOCUMENT_NAME, NotificationSchema);

module.exports = NotificationModel;
