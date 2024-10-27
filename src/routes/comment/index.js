const express = require("express");
const CommentController = require("../../controllers/comment.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

router.get("", asyncHandleError(CommentController.getCommentInBook));
router.get("/ratings", asyncHandleError(CommentController.getStarsRating));

router.use(authentication);

router.post("", asyncHandleError(CommentController.createComment));
router.put("", asyncHandleError(CommentController.updateComment));
router.delete("/:id", asyncHandleError(CommentController.deleteComment));

module.exports = router;
