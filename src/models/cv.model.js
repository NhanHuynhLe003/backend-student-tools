const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DOCUMENT_NAME = "Cv";
const COLLECTION_NAME = "Cv";

const CvSchema = new Schema(
  {
    cvUserId: mongoose.Schema.Types.ObjectId,
    cvParentUserId: mongoose.Schema.Types.ObjectId,
    cvParentId: mongoose.Schema.Types.ObjectId,
    title: String,
    thumbnail: String,
    isDelete: {
      type: Boolean,
      default: false,
    }, //soft delete
    isDragDisabled: {
      type: Boolean,
      default: false,
    }, // có cho phép kéo thả hay không
    status: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    boards: [
      {
        cvId: mongoose.Schema.Types.ObjectId,
        cvUserId: mongoose.Schema.Types.ObjectId, // có thể là id của user của user | admin
        name: String,
        position: {
          top: Number,
          left: Number,
        },
        listDataItem: [
          {
            boardId: mongoose.Schema.Types.ObjectId,
            role: {
              type: String,
              enum: ["ONLY_READ", "ONLY_WRITE", "ALL"],
              default: "ALL",
            },
            // component: mongoose.Schema.Types.Mixed,
            itemType: {
              type: String,
              enum: ["editor", "shape", "image"],
            }, // chuyển type thành item type
            coordinate: {
              x: Number,
              y: Number,
              x2: Number,
              y2: Number,
              x3: Number,
              y3: Number,
              x4: Number,
              y4: Number,
              x5: Number,
              y5: Number,
            },
            sizeItem: {
              width: Number,
              height: Number,
            },
            rotateDeg: Number,
            ChildComponentProps: Schema.Types.Mixed,
            layer: Number,
            content: String,
            color: String,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, CvSchema);
