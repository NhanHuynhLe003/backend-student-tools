const express = require("express");
// Controller
const NoteController = require("../../controllers/note.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

router.post("/hello", asyncHandleError(NoteController.sayHello));
//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);

//GET, POST, PUT, PATCH, DELETE ->
//create book

module.exports = router;
