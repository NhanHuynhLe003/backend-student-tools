const express = require("express");
// Controller
const NoteController = require("../../controllers/note.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);
router.post("/create", asyncHandleError(NoteController.createNote));

//GET, POST, PUT, PATCH, DELETE ->
//create book

module.exports = router;
