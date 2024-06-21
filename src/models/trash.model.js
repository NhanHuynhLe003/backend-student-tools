const mongoose = require("mongoose");

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

const TrashModel = mongoose.model(DOCUMENT_NAME, trashSchema);

module.exports = TrashModel;
