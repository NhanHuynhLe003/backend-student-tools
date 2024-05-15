const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const CategoryModel = mongoose.model(DOCUMENT_NAME, categorySchema);

module.exports = CategoryModel;
