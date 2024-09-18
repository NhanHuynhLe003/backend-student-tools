const { Schema, model } = require("mongoose");

const Document_Name = "Comment";
const Collection_Name = "Comments";

const commentSchema = new Schema(
  {
    comment_bookId: { type: Schema.Types.ObjectId, ref: "Book" },
    comment_userId: { type: Schema.Types.ObjectId, ref: "Student" },
    comment_content: { type: String, required: true },
    comment_parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    comment_left: { type: Number, default: 0 },
    comment_right: { type: Number, default: 0 },
    isRating: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: Collection_Name,
  }
);

module.exports = model(Document_Name, commentSchema);
