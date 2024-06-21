"use strict";

const CvModel = require("../models/cv.model");

class CvService {
  static async createEmptyCv({ user_id }) {
    return await CvModel.create({});
  }
}

module.exports = CvService;
