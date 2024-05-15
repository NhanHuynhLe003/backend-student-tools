"use strict";
const { model, Schema, default: mongoose } = require("mongoose");
const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const userSchema = new Schema(
  {
    usr_id: { type: String, required: true }, // user
    usr_slug: { type: String, required: true },
    usr_name: { type: String, default: "" },
    usr_password: { type: String, default: "" }, //password đã được băm
    // usr_salf: { type: String, default: "" }, // mã salf để mã hóa mật khẩu
    usr_email: { type: String, required: true },
    usr_phone: { type: String, default: "" },
    usr_avatar: { type: String, default: "" },
    usr_date_of_birth: { type: Date, default: null },
    usr_role: { type: Schema.Types.ObjectId, ref: "Role" }, //admin, student
    usr_status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "block"],
    },
    usr_student_detail: {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const UserModel = mongoose.model(DOCUMENT_NAME, userSchema);
module.exports = UserModel;
