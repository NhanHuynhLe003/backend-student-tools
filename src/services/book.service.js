"use strict";

const { default: mongoose, Types } = require("mongoose");
const { NotFoundError } = require("../../core/error.response");
const { ObjectId } = Types;
const { bookModel } = require("../models/book.model");
const {
  findDraftBook,
  publishBook,
  unPublishBook,
  findPublishBook,
  findBookByText,
  findBookByCate,
  findBookPublishDetail,
  findBookDraftDetail,
  updateBookById,
  deleteBookForeverById,
  sortBookByReadView,
  sortBookByFavourite,
  sortBookByRatings,
  sortBookByNewest,
  getAllBookInStock,
} = require("../models/repos/book");

const NotificationService = require("./notification.service");
const TrashModel = require("../models/trash.model");
const {
  removeUndefinedNullObject,
  nestedObjectConvert,
  convertObjectId,
  addDataUniqueInListToMap,
} = require("../utils");
const UploadService = require("./upload.service");
const studentModel = require("../models/student.model");
class BookService {
  static updateImageBookExpired = async () => {
    const currentTime = Math.floor(new Date().getTime() / 1000);

    //Tìm kiếm các quyển sách có ảnh đã hết hạn từ mongodb
    const booksDataExpired = await bookModel.aggregate([
      {
        $addFields: {
          // Tìm tất cả các giá trị khớp với regex "Expires=([0-9]+)" trong trường `book_thumb`
          expiresArray: {
            $regexFindAll: {
              input: "$book_thumb", // Chuỗi URL để tìm kiếm
              regex: "Expires=([0-9]+)", // Biểu thức chính quy để tìm giá trị Expires
            },
          },
        },
      },
      {
        $addFields: {
          // Trích xuất giá trị đầu tiên từ mảng các nhóm con (captures)
          expiresString: {
            $arrayElemAt: [
              {
                $map: {
                  // Mảng các nhóm con được tìm thấy
                  input: "$expiresArray.captures",
                  as: "capture",
                  in: { $arrayElemAt: ["$$capture", 0] }, // Lấy phần tử đầu tiên của mỗi nhóm con
                },
              },
              0 /* Lấy phần tử đầu tiên từ mảng kết quả của $map*/,
            ],
          },
        },
      },
      {
        $addFields: {
          // Chuyển đổi giá trị `expiresString` từ chuỗi thành số nguyên
          expires: {
            $toLong: "$expiresString",
          },
        },
      },
      {
        $match: {
          // Lọc các document sao cho `expires` nhỏ hơn thời gian hiện tại tính bằng Unix timestamp(NGHĨA LÀ ĐÃ HẾT HẠN)
          expires: { $lt: currentTime },
        },
      },
    ]);

    // Sign lại các ảnh sách đã hết hạn
    booksDataExpired.forEach(async (book) => {
      const { signedUrl } = await UploadService.checkAndGetImageS3ById({
        imageId: book.book_thumb_id,
      });

      // Cập nhật lại ảnh sách
      await bookModel.updateOne(
        { _id: book._id },
        {
          $set: {
            book_thumb: signedUrl,
          },
        }
      );
    });
  };

  static createBook = async ({
    userId,
    book_thumb_id,
    book_name,
    book_author,
    book_thumb,
    book_desc,
    book_slug,
    book_quantity,
    book_genre,
    book_publish_date,
    book_previews,
    book_ratingsAverage,
    book_students_read,
    book_favourites,
    isDraft = false,
    isPublished = true, // mặc định khi người dùng đã fill xong form thì sách sẽ được publish luôn, còn nếu lưu bản nháp là lưu trước khi đóng tab
  }) => {
    /**
        {
            "book_name": "The Great Gatsby",
            "book_author": "F. Scott Fitzgerald",
            "book_thumb": "https://example.com/images/the-great-gatsby.jpg",
            "book_desc": "A classic novel set in the Roaring Twenties.",
            "book_slug": "the-great-gatsby",
            "book_quantity": 50,
            "book_genre": ["6624dba70f8dd108e4910123"], // Danh sách các ID của thể loại
            "book_publish_date": "2022-01-15T00:00:00.000Z",
            "book_previews": [
                "https://example.com/images/the-great-gatsby-preview1.jpg",
                "https://example.com/images/the-great-gatsby-preview2.jpg"
            ],
            "book_ratingsAverage": 4.5,
            "book_status": "available",
            "book_students_read": [
                "6624dba70f8dd108e4910456",
                "6624dba70f8dd108e4910789"
            ], // Danh sách các ID của sinh viên đã đọc sách, thực tế chỉ cần trả số lượng
            "book_favourites": 12,
            "isDraft": false,
            "isPublished": true
        }
         */

    const newBook = await bookModel.create({
      book_name,
      book_author,
      book_thumb,
      book_desc,
      book_slug,
      book_quantity,
      book_genre,
      book_publish_date,
      book_previews,
      book_ratingsAverage,
      book_students_read,
      book_favourites,
      isDraft,
      isPublished,
      book_thumb_id, // book_thumb_id dùng get ảnh mới sau khi expired của thumb
    });

    await NotificationService.pushNotification({
      noti_type: "NEW_BOOK",
      noti_senderId: userId,
      noti_content: `New book ${book_name} has been added to the library`,
      noti_options: {
        book_id: newBook._id,
        book_name: newBook.book_name,
        book_thumb: newBook.book_thumb,
      },
    });
    return newBook;
  };

  static getRecommendBooks = async ({ skip = 0, limit = 20 }) => {
    await this.updateImageBookExpired();
    const response = await bookModel
      .find({})
      .sort({
        book_ratingsAverage: -1,
        book_favourites: -1,
        book_num_readed: -1,
      })
      .skip(skip)
      .limit(limit);

    return response;
  };

  static findBookDraftDetail = async ({ id }) => {
    await this.updateImageBookExpired(); //Cập nhật ảnh sách hết hạn
    const res = await findBookDraftDetail({ book_id: id });
    if (!res) throw new NotFoundError("not found");
    return res;
  };

  static findBookPublishDetail = async ({ id }) => {
    await this.updateImageBookExpired();
    const res = await findBookPublishDetail({ book_id: id });
    if (!res) throw new NotFoundError("not found");
    return res;
  };

  static findDraftBook = async ({ skip = 0, limit = 50 }) => {
    await this.updateImageBookExpired();
    const query = { isDraft: true, book_isDelete: false };
    const res = await findDraftBook({ query, limit, skip });
    if (!res) throw new NotFoundError("not found");
    return res;
  };
  static findPublishBook = async ({ skip = 0, limit = 50 }) => {
    await this.updateImageBookExpired();
    const query = { isPublished: true, book_isDelete: false };

    const res = await findPublishBook({ query, skip, limit });

    if (!res) throw new NotFoundError("not found");

    return res;
  };
  static findBookByText = async (textSearch) => {
    // console.log("Text-Search::: ", textSearch);
    await this.updateImageBookExpired();
    const res = await findBookByText(textSearch);
    if (!res) throw new NotFoundError("not found");
    return res;
  };

  static publishBook = async ({ book_id }) => {
    return await publishBook({ book_id });
  };

  static unPublishBook = async ({ book_id }) => {
    return await unPublishBook({ book_id });
  };

  static findBookByCategory = async ({ category_id }) => {
    await this.updateImageBookExpired();
    console.log(`category_id::: ${category_id}`);
    return await findBookByCate({ category_id });
  };

  static updateBookById = async ({ id, payload = {} }) => {
    //1. Xóa đi giá trị undefined, null trong object payload
    const objectParamas = removeUndefinedNullObject(payload);

    //2. đi sâu vào key có giá trị object (cấp 2 trở đi) trong payload truyền vào
    const convertParamsObj = nestedObjectConvert(objectParamas);
    // console.log("CONVERTOBJ:::", convertParamsObj);
    //3. Update dữ liệu
    const updatedBook = await updateBookById({ id, payload: convertParamsObj });
    return updatedBook;
  };

  static deleteBookById = async ({ id, userId }) => {
    const res = await this.updateBookById({
      id,
      payload: { book_isDelete: true },
    });
    // thêm sách vào thùng rác

    await TrashModel.create({
      admin_id: convertObjectId(userId),
      book_id: convertObjectId(id),
      desc: `Delete book with id: ${id} to trash bin`,
    });

    if (!res) throw new Error("Failed to delete book");
    return res;
  };

  static deleteBookForeverById = async ({ id }) => {
    const res = await deleteBookForeverById({ book_id: id });
    if (!res) throw new Error("Failed to delete book");
    return res;
  };

  static sortBookByReadView = async ({ skip = 0, limit = 50 }) => {
    await this.updateImageBookExpired();
    return await sortBookByReadView({ skip, limit });
  };

  static sortBookByFavourite = async ({ skip = 0, limit = 50 }) => {
    await this.updateImageBookExpired();
    return await sortBookByFavourite({ skip, limit });
  };

  static sortBookByRatings = async ({ skip = 0, limit = 50 }) => {
    await this.updateImageBookExpired();
    return await sortBookByRatings({ skip, limit });
  };

  static sortBookByNewest = async ({ skip = 0, limit = 50 }) => {
    await this.updateImageBookExpired();
    return await sortBookByNewest({ skip, limit });
  };

  static getAllBookInStock = async ({ skip = 0, limit = 50 }) => {
    await this.updateImageBookExpired();
    return await getAllBookInStock({ skip, limit });
  };

  static getBooksInStudentBookshelf = async ({
    userId,
    skip = 0,
    limit = 10,
  }) => {
    await studentModel
      .findById(userId)
      .select("books_reading")
      .lean()
      .exec();
  };

  static mergeFilterBook = async ({
    sortType = "all",
    categoryId = "all",
    instockType = "all",
    search = "",
    skip = 0,
    limit = 50,
  }) => {
    let sortQueryRes = [];
    let cateQueryRes = [];
    let instockQueryRes = [];

    // sắp xếp sách
    switch (sortType) {
      case "read":
        // tìm sách có lượt đọc cao nhất
        sortQueryRes = await this.sortBookByReadView({ skip, limit });
        break;
      case "favourite":
        // tìm sách có lượt yêu thích cao nhất
        sortQueryRes = await this.sortBookByFavourite({ skip, limit });
        break;
      case "rating":
        // tìm sách có lượt đánh giá cao nhất
        sortQueryRes = await this.sortBookByRatings({ skip, limit });
        break;
      case "newest":
        // tìm sách mới nhất
        sortQueryRes = await this.sortBookByNewest({ skip, limit });
      default:
        // tìm tất cả sách có trong kho
        sortQueryRes = await this.findPublishBook({ skip, limit });
    }

    // lọc sách theo thể loại
    if (categoryId !== "all") {
      cateQueryRes = await this.findBookByCategory({ category_id: categoryId });
    } else {
      cateQueryRes = await this.findPublishBook({ skip, limit });
    }

    // lọc sách theo tình trạng trong kho
    if (instockType !== "all") {
      //lấy sách còn hàng trong kho
      instockQueryRes = await this.getAllBookInStock({ skip, limit });
    } else {
      instockQueryRes = await this.findPublishBook({ skip, limit });
    }

    // Để theo dõi sự xuất hiện của mỗi sản phẩm
    const appearanceMap = {};

    // Hàm để đánh dấu sự xuất hiện của các sản phẩm trong một danh sách
    const markAppearance = (books, marker) => {
      books.forEach((book) => {
        const bookIdStr = book._id.toString();
        if (!appearanceMap[bookIdStr]) {
          // chưa xuất hiện trong danh sách nào thì khởi tạo
          appearanceMap[bookIdStr] = { count: 0, book };
        }

        // Đánh dấu id đã xuất hiện trong danh sách này
        appearanceMap[bookIdStr][marker] = true;

        // Tăng số lần xuất hiện
        appearanceMap[bookIdStr].count += 1;
      });
    };

    // Đánh dấu sự xuất hiện của sản phẩm trong từng danh sách
    markAppearance(sortQueryRes, "bySortType");
    markAppearance(cateQueryRes, "byCategory");
    markAppearance(instockQueryRes, "byInStockType");

    console.log("APPEARANCE:::", appearanceMap);

    // Chọn ra những sản phẩm xuất hiện trong cả ba danh sách
    const commonResults = Object.values(appearanceMap)
      .filter((item) => item.count === 3)
      .map((item) => item.book);

    return {
      result: commonResults,
      total: commonResults.length,
    };
  };

  // Tính năng trả sách sẽ được thêm trong kho sách của học sinh, học sinh có quyền trả sách hoặc xin gia hạn(cần xác nhận admin).
}

module.exports = BookService;
