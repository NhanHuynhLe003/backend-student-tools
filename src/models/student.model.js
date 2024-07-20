const mongoose = require("mongoose"); // Erase if already required

const ROLEBOARD = {
  ADMIN: "41444D494E",
  WRITER: "ROLE-002",
  EDITOR: "ROLE-003",
  USER: "53545544494E54",
};

const DOCUMENT_NAME = "Student";
const COLLECTION_NAME = "Students";
// Declare the Schema of the Mongo model
var studentSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "",
    },
    student_id: {
      type: String,
      // required: true,
      // unique: true, // Mã sinh viên là duy nhất vd: 0308211150
    },
    classStudent: {
      type: String,
      // required: true
    },
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    date_of_birth: {
      type: Date,
      default: new Date(2003, 1, 1),
    },
    portfolio_path: {
      type: String,
      default: "",
    },
    books_reading: {
      // Chứa các thông tin của sách mà student đang đọc
      type: [],
      default: [],
    },
    books_readed: {
      // Chứa các thông tin của sách mà student đã mượn (không kể đã đọc bao lâu)
      type: [],
      default: [],
    },

    // Tình trạng hoạt động của tài khoản student
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // Yêu cầu xác thực đối với các phương thức lấy lại mật khẩu, Đổi mật khẩu, ...
    verify: {
      type: mongoose.Schema.Types.Boolean,
      default: false,
    },

    // Student sẽ được cấp những quyền gì: Writer, Reader
    roles: {
      type: Array,
      default: [ROLEBOARD.USER],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, studentSchema);
