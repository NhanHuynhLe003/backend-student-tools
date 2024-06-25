const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

// category.model.js
const DOCUMENT_NAME = "Category";
const COLLECTION_NAME = "Categories";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "No description",
    },
    tag: {
      type: String,
    },
    parentCategoryId: {
      //Danh mục nhiều cấp, có thể ko có nếu cấp 1
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

categorySchema.index({ name: "text" });
categorySchema.pre("save", function(next) {
  this.tag = slugify(this.name, { lower: true });
  next();
});

const CategoryModel = mongoose.model(DOCUMENT_NAME, categorySchema);

module.exports = CategoryModel;
