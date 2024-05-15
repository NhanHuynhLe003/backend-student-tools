const mongoose = require("mongoose");

// category.model.js
const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";

const cartSchema = new mongoose.Schema(
  {
    cart_userId: { type: String, required: true }, // giỏ hàng của học sinh
    cart_state: {
      type: String,
      enum: ["active", "completed", "cancelled", "pending"],
      default: "active",
    },
    cart_books: {
      type: [
        {
          // Kiểu dữ liệu của object được truyền vào mảng sách
          bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
          },
          quantity: {
            type: Number,
            default: 1,
            min: 1,
          },
        },
      ],
      required: true,
      default: [],
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

const CartModel = mongoose.model(DOCUMENT_NAME, cartSchema);

module.exports = CartModel;
