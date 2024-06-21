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
    note_content: {
      type: String,
      required: true,
    },
    // Ghi chú dạng {}
    note_cloze: {
      type: String,
      default: "",
    },
    // Các Cloze bên trong
    clozes: {
      type: [
        {
          index: Number,
          content: String,
        },
      ],
      default: [],
    },
    note_level: {
      /**
        -1: 0
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
      default: -1,
    },
    due_date: {
      type: Date,
      default: Date.now,
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
