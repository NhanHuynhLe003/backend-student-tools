const { NotFoundError } = require("../../core/error.response");
const CommentModel = require("../models/comment.model");

class CommentService {
  static async createComment({
    bookId,
    userId,
    content,
    parentId = null,
    isRating = false,
    rating = 0,
  }) {
    let newComment;
    if (isRating) {
      newComment = await CommentModel.create({
        comment_bookId: bookId,
        comment_userId: userId,
        isRating: isRating,
        rating: rating,
      });
    } else {
      newComment = await CommentModel.create({
        comment_bookId: bookId,
        comment_userId: userId,
        comment_content: content,
        comment_parentId: parentId,
      });
    }

    let rightVal;
    if (parentId) {
      const parentComment = await CommentModel.findById(parentId);
      if (!parentComment) {
        throw new NotFoundError("Không thể tìm thấy comment gốc");
      }
      rightVal = parentComment.comment_right;

      await CommentModel.updateMany(
        {
          comment_bookId: bookId,
          comment_right: { $gte: parentComment.comment_right },
        },
        {
          $inc: { comment_right: 2 },
        }
      );

      await CommentModel.updateMany(
        {
          comment_bookId: bookId,
          comment_left: { $gt: parentComment.comment_right },
        },
        {
          $inc: { comment_left: 2 },
        }
      );
    } else {
      // Nếu 1 comment ko có comment gốc thì tìm comment có comment_right lớn nhất
      // Tiến hành tạo left và right tiếp theo comment right lớn nhất đó

      const commentHaveMaxRightValue = await CommentModel.findOne(
        {
          comment_bookId: bookId,
        },
        "comment_right",
        { sort: { comment_right: -1 } }
      );

      if (commentHaveMaxRightValue) {
        rightVal = commentHaveMaxRightValue.comment_right + 1;
      } else {
        rightVal = 1;
      }
    }

    newComment.comment_left = rightVal;
    newComment.comment_right = rightVal + 1;

    await newComment.save();

    return newComment;
  }

  static async getCommentInBook({
    bookId,
    parentCommentId = null,
    skip = 0,
    limit = 10,
    isRating = false,
  }) {
    if (!parentCommentId) {
      return await CommentModel.find({
        comment_bookId: bookId,
        comment_parentId: null,
        isRating,
      })
        .skip(skip)
        .limit(limit)
        .sort({ comment_left: 1 })
        .populate("comment_bookId", "book_thumb book_name")
        .populate("comment_userId", "name profileImage");
    }

    const parentComment = await CommentModel.findById(parentCommentId);
    if (!parentComment) {
      throw new NotFoundError("Không tìm thấy comment gốc");
    }

    return await CommentModel.find({
      comment_bookId: bookId,
      isRating,
      comment_left: { $gt: parentComment.comment_left },
      comment_right: { $lte: parentComment.comment_right },
    })
      .skip(skip)
      .limit(limit)
      .sort({ comment_left: 1 })
      .populate("comment_bookId", "book_thumb book_name")
      .populate("comment_userId", "name profileImage");
  }

  static async deleteComment(commentId) {
    const comment = await CommentModel.findByIdAndDelete(commentId);
    return comment;
  }

  static async updateComment({ commentId, content, isRating, rating }) {
    if (isRating) {
      const ratingRes = await CommentModel.findByIdAndUpdate(
        commentId,
        { comment_content: content, rating },
        { new: true }
      );
      return ratingRes;
    }
    const comment = await CommentModel.findByIdAndUpdate(
      commentId,
      { comment_content: content },
      { new: true }
    );
    return comment;
  }
}

module.exports = CommentService;
