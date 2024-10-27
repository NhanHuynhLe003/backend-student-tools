"use strict";

const CommentService = require("../services/comment.service");
const { Created, SuccessResponse } = require("../../core/success.response");
class CommentController {
  createComment = async (req, res, next) => {
    new Created({
      message: "Tạo Comment mới thành công!",
      metadata: await CommentService.createComment(req.body),
    }).send(res);
  };

  getCommentInBook = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách comment thành công!",
      metadata: await CommentService.getCommentInBook(req.query),
    }).send(res);
  };

  updateComment = async (req, res, next) => {
    new Created({
      message: "cập nhật Comment mới thành công!",
      metadata: await CommentService.updateComment(req.body),
    }).send(res);
  };

  deleteComment = async (req, res, next) => {
    new Created({
      message: "Xóa Comment thành công!",
      metadata: await CommentService.deleteComment({
        commentId: req.params.id,
        bookId: req.query.bookId,
      }),
    }).send(res);
  };

  getStarsRating = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách đánh giá thành công!",
      metadata: await CommentService.getStarsRating(req.query),
    }).send(res);
  };
}

module.exports = new CommentController();
