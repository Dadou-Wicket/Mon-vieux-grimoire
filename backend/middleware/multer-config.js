const multer = require("multer");
const path = require("path");

// Associe chaque type MIME d'image à son extension de fichier.
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "temp");
  },

  // Définit le nom du fichier enregistré.
  filename: (req, file, callback) => {
    const name = path.parse(file.originalname).name.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage }).single("image");
