const mongoose = require("mongoose");
const userModel = require("./user.model");
const {
  NotFoundError,
  AuthFailureError,
} = require("../../core/error.response");

// Trash.model.js
const DOCUMENT_NAME = "Trash";
const COLLECTION_NAME = "Trashes";

const trashSchema = new mongoose.Schema(
  {
    book_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Book",
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    desc: {
      type: String,
      default: "No description",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// // Kiểm tra quyền User trước khi save tránh bug user không tồn tại hoặc không phải admin
// trashSchema.pre("save", async function (next) {
//   const trashDoc = this;

//   // Fetch the user by the admin_id
//   const user = await userModel.findById(trashDoc.admin_id);

//   if (!user) {
//     return next(new NotFoundError("User not found"));
//   }

//   // Check if the user's role is 'admin'
//   if (user.usr_role !== "admin") {
//     return next(
//       new AuthFailureError("Chỉ Admin mới có quyền thực hiện hành động này")
//     );
//   }

//   next();
// });

const TrashModel = mongoose.model(DOCUMENT_NAME, trashSchema);

module.exports = TrashModel;
