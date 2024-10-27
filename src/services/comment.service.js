const { NotFoundError } = require("../../core/error.response");
const { bookModel } = require("../models/book.model");
const CommentModel = require("../models/comment.model");
const { customRound } = require("../utils");

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
        comment_content: content,
        comment_parentId: parentId,
        isRating: isRating,
        rating: rating,
      });

      if (rating > 0) {
        // Tiến hành cập nhật rating trung bình cho sách
        const commentList = await CommentModel.find({
          comment_bookId: bookId,
          isRating: true,
          rating: { $gt: 0 },
        });
        const totalRating = commentList.reduce(
          (acc, cur) => acc + cur.rating,
          0
        );
        const averageRating = customRound(totalRating / commentList.length);
        await bookModel.findByIdAndUpdate(bookId, {
          book_ratingsAverage: averageRating,
        });
      }
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
      const total = await CommentModel.countDocuments({
        comment_bookId: bookId,
        comment_parentId: null,
        isRating,
      });
      const commentOriginRes = await CommentModel.find({
        comment_bookId: bookId,
        comment_parentId: null,
        isRating,
      })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({
          path: "comment_parentId",
          select: "comment_userId",
          populate: { path: "comment_userId", select: "name profileImage" },
        })
        .populate("comment_bookId", "book_thumb book_name")
        .populate("comment_userId", "name profileImage");
      return {
        comments: commentOriginRes,
        total,
      };
    }

    const parentComment = await CommentModel.findById(parentCommentId);
    if (!parentComment) {
      throw new NotFoundError("Không tìm thấy comment gốc");
    }

    const total = await CommentModel.countDocuments({
      comment_bookId: bookId,
      comment_parentId: parentComment._id,
      isRating,
    });

    const commentRes = await CommentModel.find({
      comment_bookId: bookId,
      isRating,
      comment_left: { $gt: parentComment.comment_left },
      comment_right: { $lte: parentComment.comment_right },
    })
      .skip(skip)
      .limit(limit)
      .sort({ comment_left: 1 })
      .populate({
        path: "comment_parentId",
        select: "comment_userId",
        populate: { path: "comment_userId", select: "name profileImage" },
      })
      .populate("comment_bookId", "book_thumb book_name")
      .populate("comment_userId", "name profileImage");

    return {
      comments: commentRes,
      total,
    };
  }

  static async deleteComment({ commentId, bookId }) {
    const foundBook = await bookModel.findById(bookId);
    if (!foundBook) {
      throw new NotFoundError("Không tìm thấy sách cần xóa comment");
    }

    const foundComment = await CommentModel.findById(commentId);
    if (!foundComment) {
      throw new NotFoundError("Không tìm thấy comment cần xóa");
    }

    const leftValue = foundComment.comment_left;
    const rightValue = foundComment.comment_right;

    const widthValue = rightValue - leftValue + 1;

    await CommentModel.deleteMany({
      comment_bookId: bookId,
      comment_left: { $gte: leftValue, $lte: rightValue },
    });

    await CommentModel.updateMany(
      {
        comment_bookId: bookId,
        comment_right: { $gt: rightValue },
      },
      {
        $inc: { comment_right: -widthValue },
      }
    );

    await CommentModel.updateMany(
      {
        comment_bookId: bookId,
        comment_left: { $gt: rightValue },
      },
      {
        $inc: { comment_left: -widthValue },
      }
    );
    return foundComment;
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

  static async getStarsRating({ bookId }) {
    const commentList = await CommentModel.find({
      comment_bookId: bookId,
      isRating: true,
      rating: { $gt: 0 },
    }).sort({ rating: -1 });

    const ratingBookAverage = await bookModel.findById(
      bookId,
      "book_ratingsAverage"
    );

    let board = {};
    commentList.forEach((cmt) => {
      const r = Math.ceil(cmt.rating);
      if (!board[r]) {
        board[r] = 1;
      } else {
        board[r] += 1;
      }
    });

    for (let i = 1; i <= 5; i += 1) {
      if (!board[i]) {
        board[i] = 0;
      }
    }

    return {
      bookRating: ratingBookAverage,
      ratingCount: commentList.length,
      ratings: board,
    };
  }
}

module.exports = CommentService;
