const express = require("express");
const CheckoutController = require("../../controllers/checkout-book.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

// //các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);
//create Checkout
router.post("/review", asyncHandleError(CheckoutController.checkoutBookOrder));

//order Checkout
router.post("/order", asyncHandleError(CheckoutController.orderBookStudent));
router.delete(
  "/key-redis-order",
  asyncHandleError(CheckoutController.deleteAllKeyRedis)
);

router.delete(
  "/order/:orderId",
  asyncHandleError(CheckoutController.cancelOrderByUser)
);
module.exports = router;
