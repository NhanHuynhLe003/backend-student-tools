const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DOCUMENT_CV_NAME = "Cv";
const COLLECTION_CV_NAME = "Cvs";
const DOCUMENT_BOARD_NAME = "CvBoard";
const COLLECTION_BOARD_NAME = "CvBoards";
const DOCUMENT_ITEM_NAME = "CvBoardItem";
const COLLECTION_ITEM_NAME = "CvBoardItems";

const dataItemSchema = new Schema({
  id: String,
  boardId: String,
  role: { type: String, enum: ["ONLY_READ", "ONLY_WRITE", "ALL"] },
  type: String,
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
  ChildComponentProps: Object,
  layer: Number,
  content: String,
  color: String,
});

const boardSchema = new Schema({
  boardId: String,
  name: String,
  position: {
    top: Number,
    left: Number,
  },
  listDataItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CvBoardItem",
  },
});

const cvSchema = new Schema(
  {
    cvId: String,
    cvUserId: String,
    title: String,
    thumbnail: String,
    status: { type: String, enum: ["private", "public"] },
    boards: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CvBoard",
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

const CvModel = mongoose.model(DOCUMENT_CV_NAME, cvSchema);
const CvBoardModel = mongoose.model(DOCUMENT_BOARD_NAME, boardSchema);
const CvBoardItemModel = mongoose.model(DOCUMENT_ITEM_NAME, dataItemSchema);

module.exports = {
  CvModel: CvModel,
  CvBoardModel: CvBoardModel,
  CvBoardItemModel: CvBoardItemModel,
};
