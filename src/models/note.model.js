const mongoose = require("mongoose");

// category.model.js
const DOCUMENT_NAME = "Note";
const COLLECTION_NAME = "Notes";

const noteSchema = new mongoose.Schema(
  {
    note_userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, //Yêu cầu phải có khi khởi tạo
    },
    note_title: {
      type: String,
      required: true,
    },
    //Ghi chú dạng note "ABCD [1]123 , EFG [2]456, HIJ [3]789"
    note_content: {
      type: String,
      required: true,
    },
    // Ghi chú dạng note "ABCD [1]....... , EFG [2].........., HIJ [3].........."
    note_cloze: {
      type: String,
      default: "",
    },
    // Các Cloze bên trong, ["123", "456", "789"]
    clozes: {
      type: [String],
      default: [],
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    note_level: {
      /**
         0: 1p
         1: 1 ngày
         2: 3 ngày
         3: 5 ngày
         4: 1 tuần
         5: 2 tuần
         6: 1 tháng
         7: 3 tháng
         8: 6 tháng
         9: 1 năm
         10: 2 năm
         */
      type: Number,
      default: 1,
    },
    //Lần ôn tập thẻ gần nhất, sử dụng để hiển thị bên trang biểu đồ
    // Dựa vào ngày để query theo tuần tháng, trả về mảng hiển thị biểu đồ phía client
    last_preview_date: {
      type: Date,
      default: Date.now,
    },
    due_date: {
      type: Date,
      default: Date.now,
    },
    note_parentId: {
      type: mongoose.Schema.Types.ObjectId,
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

const NoteModel = mongoose.model(DOCUMENT_NAME, noteSchema);

module.exports = NoteModel;
