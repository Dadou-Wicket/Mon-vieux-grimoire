const express = require("express");
const bookCtrl = require("../controllers/book");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const router = express.Router();

router.get("/", bookCtrl.getAllBooks);

router.get("/bestrating", bookCtrl.getBestRatedBooks);

router.get("/:id", bookCtrl.getOneBook);

router.post("/", auth, multer, bookCtrl.createBook);

router.put("/:id", auth, multer, bookCtrl.updateBook);

router.delete("/:id", auth, bookCtrl.deleteBook);

router.post("/:id/rating", auth, bookCtrl.rateBook);

module.exports = router;
