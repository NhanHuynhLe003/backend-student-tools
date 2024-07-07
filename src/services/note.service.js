"use strict";

const { NotFoundError } = require("../../core/error.response");
const NoteModel = require("../models/note.model");
const { removeUndefinedNullObject, nestedObjectConvert } = require("../utils");

class NoteService {
  static findNoteInTrash = async ({ note_userId }) => {
    const noteFound = await NoteModel.find({
      note_userId: note_userId,
      isDelete: true,
    });

    return noteFound;
  };

  static createOriginNote = async ({
    note_userId,
    note_title,
    note_content,
    note_cloze,
    note_level,
    clozes = [],
  }) => {
    const newNote = await NoteModel.create({
      note_userId: note_userId,
      note_title: note_title,
      note_content: note_content,
      note_cloze: note_cloze,
      note_level: note_level,
      clozes: clozes,
    });

    return newNote;
  };

  //Tạo mới note
  static addChildNote = async ({
    note_userId,
    note_title,
    note_content,
    note_cloze,
    note_level,
    note_parentId,
    clozes = [],
  }) => {
    const newNote = await NoteModel.create({
      note_parentId: note_parentId,
      note_userId: note_userId,
      note_title: note_title,
      note_content: note_content,
      note_cloze: note_cloze,
      note_level: note_level,
      clozes: clozes,
    });

    return newNote;
  };

  //Hàm lấy ra note thông qua id, chi tiết note
  static getNoteById = async ({ note_userId, id }) => {
    //Tìm Note bằng ObjectID
    const noteFound = await NoteModel.findOne({
      note_userId: note_userId,
      _id: id,
    });

    if (!noteFound) {
      throw new NotFoundError("Không tìm thấy note");
    }
    return noteFound;
  };

  //Hàm lấy ra tất cả các note của user
  static getAllNotesByUser = async ({ note_userId, limit = 0, skip = 0 }) => {
    const checkNoteUser = await NoteModel.findOne({ note_userId: note_userId })
      .limit(limit)
      .skip(skip);

    if (!checkUser) {
      throw new NotFoundError("Không tìm thấy Note user");
    }

    return checkNoteUser;
  };

  // Hàm lấy ra các note thông qua title, dùng để search
  static getNoteByName = async ({ note_userId, note_title }) => {
    const noteFound = await NoteModel.findOne({
      note_userId: note_userId,
      note_title: note_title,
    });
    if (!noteFound) {
      throw new NotFoundError("Không tìm thấy note");
    }
  };

  //Hàm lấy ra các note ôn tập hiện tại thông qua level
  static getNoteByLevel = async ({ note_userId, note_level }) => {
    const noteFound = await NoteModel.findOne({
      note_userId: note_userId,
      note_level: note_level,
    });
    if (!noteFound) {
      throw new NotFoundError("Không tìm thấy note");
    }
  };

  // Hàm xóa note
  static deleteNote = async ({ note_userId, id }) => {
    const noteFound = await NoteModel.findOne({
      note_userId: note_userId,
    });

    if (!noteFound) {
      throw new NotFoundError("Không tìm thấy note");
    }

    const deleteCloze = await NoteModel.findByIdAndDelete(id);
    return deleteCloze;
  };

  //Hàm chỉnh sửa note như nội dung bên trong
  static async uploadNote({ note_userId, id, payload = {} }) {
    const noteFound = await NoteModel.findOne({
      note_userId: note_userId,
      _id: id,
    });

    if (!noteFound) {
      throw new NotFoundError("Không tìm thấy note");
    }

    //1. Xóa đi giá trị undefined, null trong object payload
    const objectParamas = removeUndefinedNullObject(payload);

    //2. đi sâu vào key có giá trị object (cấp 2 trở đi) trong payload truyền vào
    const convertParamsObj = nestedObjectConvert(objectParamas);

    //3. Update dữ liệu
    const updatedNote = await NoteModel.findByIdAndUpdate(
      id,
      convertParamsObj,
      {
        isNew: true,
      }
    );

    return updatedNote;
  }

  //Hàm dùng cập nhật level tiếp theo của note khi nhấn nút: như giảm level hay level tiếp theo
  static async updateNoteLevel({ note_userId, id, note_level }) {
    const noteFound = await NoteModel.findOne({
      note_userId: note_userId,
      _id: id,
    });

    if (!noteFound) {
      throw new NotFoundError("Không tìm thấy note");
    }

    noteFound.note_level = note_level;
    //update note due_date
    noteFound.due_date = calculateDueDate(note_level);

    noteFound.save(); //Cập nhật lại dữ liệu note
  }

  // Hàm lấy các note cần ôn tập của ngày hôm đó, bằng cách lấy ra các note ít hơn hoặc bằng ngày hiện tại
  static layNhungNoteOntapHomNay = async ({ note_userId, note_parentId }) => {
    const today = new Date();

    console.log("today: ", today);

    const notesFound = await NoteModel.find({
      note_userId: note_userId,

      note_parentId: note_parentId,
      due_date: { $lte: today }, // So sánh chỉ phần ngày
      isDelete: false,
    });

    if (!notesFound || notesFound.length === 0) {
      throw new NotFoundError("Không có note cần ôn tập hôm nay");
    }

    return notesFound;
  };

  // Hàm xóa note
  static deleteNote = async ({ note_userId, id }) => {
    const noteFound = await NoteModel.findOne({
      note_userId,
      _id: id,
    });

    if (!noteFound) {
      throw new NotFoundError("Không tìm thấy note");
    }

    const deleteCloze = await NoteModel.findByIdAndDelete(id);
    return deleteCloze;
  };

  // Hàm chỉnh sửa note như nội dung bên trong
  static async updateNote({ note_userId, id, payload = {} }) {
    const noteFound = await NoteModel.findOne({
      note_userId,
      _id: id,
    });

    if (!noteFound) {
      throw new NotFoundError("Không tìm thấy note");
    }

    const objectParams = removeUndefinedNullObject(payload);
    const convertParamsObj = nestedObjectConvert(objectParams);

    const updatedNote = await NoteModel.findByIdAndUpdate(
      id,
      convertParamsObj,
      {
        new: true,
      }
    );

    return updatedNote;
  }

  // Hàm cập nhật level tiếp theo của note khi nhấn nút: như giảm level hay level tiếp theo
  static async updateNoteLevel({ note_userId, id, note_level }) {
    const noteFound = await NoteModel.findOne({
      note_userId,
      _id: id,
    });

    if (!noteFound) {
      throw new NotFoundError("Không tìm thấy note");
    }

    noteFound.note_level = note_level;
    noteFound.due_date = calculateDueDate(note_level);

    // Trả về ngày tiếp theo cho client
    await noteFound.save();

    return noteFound;
  }

  // Hàm tính toán due_date dựa trên level
  static calculateDueDate(level) {
    const today = new Date();
    let dueDate = new Date(today);
    switch (level) {
      case 0:
        dueDate.setMinutes(today.getMinutes() + 1);
        break;
      case 1:
        dueDate.setDate(today.getDate() + 1);
        break;
      case 2:
        dueDate.setDate(today.getDate() + 3);
        break;
      case 3:
        dueDate.setDate(today.getDate() + 5);
        break;
      case 4:
        dueDate.setDate(today.getDate() + 7);
        break;
      case 5:
        dueDate.setDate(today.getDate() + 14);
        break;
      case 6:
        dueDate.setMonth(today.getMonth() + 1);
        break;
      case 7:
        dueDate.setMonth(today.getMonth() + 3);
        break;
      case 8:
        dueDate.setMonth(today.getMonth() + 6);
        break;
      case 9:
        dueDate.setFullYear(today.getFullYear() + 1);
        break;
      case 10:
        dueDate.setFullYear(today.getFullYear() + 2);
        break;
      default:
        dueDate = today;
        break;
    }
    return dueDate;
  }
}

module.exports = NoteService;
