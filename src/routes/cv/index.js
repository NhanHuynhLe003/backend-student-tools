const express = require("express");
// Controller
const CvController = require("../../controllers/cv.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);
router.post("/add/item", asyncHandleError(CvController.addItemIntoBoard));
router.post("/add/board", asyncHandleError(CvController.addBoardIntoCv));
router.get("/:userId", asyncHandleError(CvController.getCvsByUserId));
router.get("/", asyncHandleError(CvController.getCvById));
router.post("/", asyncHandleError(CvController.createEmptyCv));
router.put("/", asyncHandleError(CvController.updateCv));
router.delete("/", asyncHandleError(CvController.deleteCv));

//ADMIN
router.get("/admin/all", asyncHandleError(CvController.getAllCvsByAdmin));
//GET, POST, PUT, PATCH, DELETE ->
//create book

module.exports = router;
