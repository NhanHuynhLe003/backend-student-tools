const express = require("express");
// Controller
const NoteController = require("../../controllers/note.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);

router.get(
  "/origin/:userId",
  asyncHandleError(NoteController.layNhungNoteGocUser)
);
router.post(
  "/create/origin",
  asyncHandleError(NoteController.createOriginNote)
);
router.get(
  "/today/:note_userId",
  asyncHandleError(NoteController.layNhungNoteOntapHomNay)
);
router.get(
  "/deleted/:userId",
  asyncHandleError(NoteController.getNotesDeletedByUser)
);
router.post("/add", asyncHandleError(NoteController.addChildNote));
router.get("/name", asyncHandleError(NoteController.getNoteByName));
router.put("/level/:id", asyncHandleError(NoteController.updateNoteLevel));
router.get("/:id", asyncHandleError(NoteController.getNoteById));
router.put("/:id", asyncHandleError(NoteController.updateNote));
router.delete("/:id", asyncHandleError(NoteController.deleteNote));
router.get("/user/:id", asyncHandleError(NoteController.getAllNotesByUser));

//GET, POST, PUT, PATCH, DELETE ->
//create book

module.exports = router;
