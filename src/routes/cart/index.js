const express = require("express");
const CartController = require("../../controllers/cart.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

router.use(authentication);

router.post(
  "/quantity",
  asyncHandleError(CartController.updateBookQuantityInCart)
);
router.post("/add", asyncHandleError(CartController.addBookToCart));
router.get("/:id", asyncHandleError(CartController.getListBookInCart));
router.post("", asyncHandleError(CartController.createCart));
router.delete("", asyncHandleError(CartController.deleteBookInCart));

module.exports = router;
