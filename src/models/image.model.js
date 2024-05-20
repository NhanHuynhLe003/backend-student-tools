const mongoose = require("mongoose");

// category.model.js
const DOCUMENT_NAME = "Image";
const COLLECTION_NAME = "Images";

const imageSchema = new mongoose.Schema(
  {
    keyName: String,
    signedUrl: String,
    expiration: Date,
    storage: String,
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const ImageModel = mongoose.model(DOCUMENT_NAME, imageSchema);

module.exports = ImageModel;
