const express = require("express");
const bookCtrl = require("../controllers/book");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const optimizeImage = require("../middleware/optimize-image");

const router = express.Router();

router.get("/", bookCtrl.getAllBooks);

router.get("/bestrating", bookCtrl.getBestRatedBooks);

router.get("/:id", bookCtrl.getOneBook);

router.post("/", auth, multer, optimizeImage, bookCtrl.createBook);

router.put("/:id", auth, multer, optimizeImage, bookCtrl.updateBook);

router.delete("/:id", auth, bookCtrl.deleteBook);

router.post("/:id/rating", auth, bookCtrl.rateBook);

module.exports = router;
