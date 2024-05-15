"use strict";

const apiKeyModel = require("../models/apiKey.model");
const crypto = require("crypto");

const generateApiKey = async () => {
  const generateKey = crypto.randomBytes(64).toString("hex");
  const newKey = await apiKeyModel.create({
    key: generateKey,
    permissions: ["0000"],
  });

  console.log("NEW API KEY::: ", newKey);
  return newKey;
};

const findApiKey = async (key) => {
  // Khởi tạo Key Mới
  // await generateApiKey();

  const objectKey = await apiKeyModel.findOne({ key, status: true }).lean();
  return objectKey;
};

module.exports = {
  findApiKey,
  generateApiKey,
};
