"use strict";
const { model, Schema, default: mongoose } = require("mongoose");
const DOCUMENT_NAME = "Admin";
const COLLECTION_NAME = "Admins";

const AdminSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    roles: {
      type: Array,
      default: ["ADMIN"],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const AdminModel = mongoose.model(DOCUMENT_NAME, AdminSchema);
module.exports = AdminModel;
