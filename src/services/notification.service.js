"use strict";

const NotificationModel = require("../models/notification.model");

const QUEUE_NAME = process.env.MESSAGE_QUEUE_NAME || "NOTIFICATION_QUEUE";
class NotificationService {
  static async pushNotification({
    noti_type,
    noti_senderId,
    noti_receiverId,
    noti_content = "No Content",
    noti_options,
    noti_status,
  }) {
    let message = "";
    switch (noti_type) {
      case "NEW_BOOK":
        message = "[BOOK:::] vừa được thêm vào thư viện";
        break;
      case "BORROW":
        message = "[STUDENT:::] vừa mượn [BOOK:::]";
        break;
      case "RETURN":
        message = "[STUDENT:::] đã trả [BOOK:::]";
        break;
      case "OVERDUE":
        message = "[STUDENT:::] quá hạn trả [BOOK:::]";
        break;
      case "NEARLY_OVERDUE":
        message = "[STUDENT:::] sắp đến hạn trả [BOOK:::]";
        break;
      case "COMMENT":
        message =
          "[STUDENT:::] đã bình luận trong [BOOK:::] với nội dung: [COMMENT:::]";
        break;
      default:
        message = noti_content;
    }

    const data = {
      noti_type: noti_type,
      noti_senderId: noti_senderId, //nếu Admin gửi user thì có thể chỗ này là null
      noti_receiverId: noti_receiverId,
      noti_content: message,
      noti_options: noti_options,
      noti_status: noti_status,
    };

    const newNotification = await NotificationModel.create(data);

    return newNotification;
  }
}

module.exports = NotificationService;
