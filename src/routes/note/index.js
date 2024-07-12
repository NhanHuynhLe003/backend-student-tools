const express = require("express");
// Controller
const NoteController = require("../../controllers/note.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);

router.post(
  "/create/origin",
  asyncHandleError(NoteController.createOriginNote)
);
router.get("/today", asyncHandleError(NoteController.layNhungNoteOntapHomNay));
router.post("/add", asyncHandleError(NoteController.addChildNote));
router.get("/name", asyncHandleError(NoteController.getNoteByName));
router.post("/level", asyncHandleError(NoteController.updateNoteLevel));
router.get("/:id", asyncHandleError(NoteController.getNoteById));
router.put("/:id", asyncHandleError(NoteController.updateNote));
router.get("/user/:id", asyncHandleError(NoteController.getAllNotesByUser));

//GET, POST, PUT, PATCH, DELETE ->
//create book

module.exports = router;
