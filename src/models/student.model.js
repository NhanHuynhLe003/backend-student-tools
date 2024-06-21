const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Student";
const COLLECTION_NAME = "Students";
// Declare the Schema of the Mongo model
var shopSchema = new mongoose.Schema(
  {
    student_id: {
      type: String,
      required: true,
      unique: true, // Mã sinh viên là duy nhất vd: 0308211150
    },
    classStudent: { type: String, required: true },
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
    cv_path: {
      type: String,
      default: "",
    },
    portfolio_path: {
      type: String,
      default: "",
    },
    books_reading: {
      // Chứa các id của sách mà student đang đọc
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    books_readed: {
      // Chứa các id của sách mà student đã đọc (sau khi trả sách)
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },

    // Tình trạng hoạt động của tài khoản student
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    // Yêu cầu xác thực đối với các phương thức lấy lại mật khẩu, Đổi mật khẩu, ...
    verify: {
      type: mongoose.Schema.Types.Boolean,
      default: false,
    },

    // Student sẽ được cấp những quyền gì: Writer, Reader
    roles: {
      type: Array,
      default: ["STUDENT"],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);
