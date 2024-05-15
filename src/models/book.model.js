const mongoose = require("mongoose"); // Erase if already required
const slugify = require("slugify");
const DOCUMENT_NAME = "Book";
const COLLECTION_NAME = "Books";
// Declare the Schema of the Mongo model
let bookSchema = new mongoose.Schema(
  {
    book_name: {
      type: String,
      required: true,
    },
    book_author: {
      type: String,
      required: true,
    },
    book_author_desc: {
      type: String,
      default: "Chưa có thông tin về tác giả cuốn sách này",
    },
    book_thumb: {
      // ảnh cuốn sách, là String là do lấy link ảnh từ internet về
      type: String,
      required: true,
    },
    book_desc: {
      type: String,
      default: "No description", // mô tả ngắn sách
    }, // mô tả ngắn sách
    book_publisher: {
      type: String,
      default: "None",
    },

    book_slug: String, // tên sách viết thường không dấu dùng để tạo url

    book_quantity: {
      // số lượng sách còn lại trong kho
      type: Number,
      required: true,
    },
    book_genre: {
      type: [mongoose.Schema.Types.ObjectId], // chứa các id của category collection
      required: true,
      ref: "Category",

      // them loai san pham thi can phai them vao enum vd: Self-Help, Business, Fiction, Non-Fiction, etc
    },

    book_publish_date: {
      type: Date,
      default: Date.now(), // ngày xuất bản sách hoặc có thể để là ngày hiện tại
    },
    book_previews: {
      // chứa các link ảnh xem trước 1 vài trang của sách
      type: Array,
      default: [],
    },

    book_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Đánh giá phải lớn hơn hoặc bằng 1"],
      max: [5, "Đánh giá phải bé hơn hoặc bằng 5"],

      set: (val) => Math.round(val * 10) / 10,
    },
    book_status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    book_students_reading: {
      // danh sach sinh viên hiện tại đang mượn sách
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Student",
    },
    book_num_readed: {
      // số lượng sinh viên đã đọc cuốn sách này (mượn và trả tính là 1 lươt đọc)
      type: Number,
    },
    book_favourites: {
      // Số lượng người yêu thích cuốn sách này
      type: Number,
      default: 1,
    },
    book_status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    book_isDelete: {
      // nếu là true thì sách đã được thêm vào thùng rác
      type: Boolean,
      default: false,
    },

    isDraft: {
      // Giả sử thiết kế giữa chừng mà có việc đột xuất có thể lưu lại dưới bảng nháp rồi quay lại chỉnh sửa sau
      type: Boolean,

      index: true,
      select: false, // khi find ra se ko lay ra gia tri nay
    },
    isPublished: {
      type: Boolean,

      index: true,
      select: false, // khi find ra se ko lay ra gia tri nay
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//create index for field name and author =>to use Fulltext search
bookSchema.index({ book_name: "text", book_author: "text" });

//middleware auto create slug from name before create or save

bookSchema.pre("save", function (next) {
  this.book_slug = slugify(this.book_name, { lower: true });

  //vd: name: Tôi tài giỏi bạn cũng thế => slug: toi-tai-gioi-ban-cung-the
  next();
});

//Export the model
module.exports = {
  bookModel: mongoose.model(DOCUMENT_NAME, bookSchema),
};
