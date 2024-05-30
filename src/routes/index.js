const express = require("express");
const router = express.Router();
const { apiKey, checkPermission } = require("../auth/check-auth");

//check api key
router.use(apiKey);

//check permission
router.use(checkPermission("0000"));

router.use("/v1/api/note", require("./note"));
router.use("/v1/api/upload", require("./upload"));
router.use("/v1/api/checkout", require("./checkout"));
router.use("/v1/api/cart", require("./cart"));
router.use("/v1/api/trash", require("./trash"));
router.use("/v1/api/category", require("./category"));
router.use("/v1/api/book", require("./book"));

router.use("/v1/api", require("./access"));

module.exports = router;
