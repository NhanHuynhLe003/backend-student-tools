const express = require("express");
const BookController = require("../../controllers/book.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

router.get(
  "/search/:textSearch",
  asyncHandleError(BookController.findBookByText)
);
router.get(
  "/category/:category_id",
  asyncHandleError(BookController.findBookByCategory)
);

router.get("/publishs", asyncHandleError(BookController.findPublishBook));

router.get("/recommends", asyncHandleError(BookController.getRecommendBooks));

router.get(
  "/publish/:id",
  asyncHandleError(BookController.findBookPublishDetail)
);

router.get("/sort/reads", asyncHandleError(BookController.sortBookByReadView));

router.get(
  "/sort/favourites",
  asyncHandleError(BookController.sortBookByFavourite)
);

router.get("/sort/ratings", asyncHandleError(BookController.sortBookByRatings));

router.get("/sort/newest", asyncHandleError(BookController.sortBookByNewest));

router.get("/in-stock", asyncHandleError(BookController.getAllBookInStock));

router.get("/filter", asyncHandleError(BookController.mergeFilterBook));

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);

router.post("", asyncHandleError(BookController.createBook));

//
router.post(
  "/book-shelf/:userId",
  asyncHandleError(BookController.getBooksInStudentBookshelf)
);
router.patch("/:id", asyncHandleError(BookController.updateBookById));
router.delete("/:id", asyncHandleError(BookController.deleteBookById));
router.get("/draft/:id", asyncHandleError(BookController.findBookDraftDetail));

router.post("/publish/:book_id", asyncHandleError(BookController.publishBook));
router.post(
  "/un-publish/:book_id",
  asyncHandleError(BookController.unPublishBook)
);
router.get("/drafts", asyncHandleError(BookController.findDraftBook));

module.exports = router;
