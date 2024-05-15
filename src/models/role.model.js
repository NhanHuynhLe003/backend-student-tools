"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Role";
const COLLECTION_NAME = "Roles";

const RoleSchema = new Schema(
  {
    rol_name: {
      type: String,
      default: "student",
      enum: ["student", "admin"],
    },
    rol_slug: { type: String, required: true }, //public slug ra nhưng bảo mật vd:0000777
    rol_status: {
      type: String,
      default: "active",
      enum: ["active", "block", "pending"],
    },
    rol_description: { type: String, default: "" }, // mô tả role đó
    rol_grants: [
      {
        resource: {
          type: Schema.Types.ObjectId,
          ref: "Resource",
          required: true,
        },
        actions: [{ type: String, required: true }],
        attributes: { type: String, default: "*" },
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = model(DOCUMENT_NAME, RoleSchema);
