const multer = require("multer");

// Associe chaque type MIME d'image à son extension de fichier.
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configure le stockage des images sur le serveur.
const storage = multer.diskStorage({
  // Définit le dossier dans lequel les images seront enregistrées.
  destination: (req, file, callback) => {
    callback(null, "images");
  },

  // Définit le nom du fichier enregistré.
  filename: (req, file, callback) => {
    // Remplace les espaces du nom original par des underscores.
    const name = file.originalname.split(" ").join("_");

    // Récupère l'extension correspondant au type MIME de l'image.
    const extension = MIME_TYPES[file.mimetype];

    // Ajoute la date actuelle au nom afin d'éviter les doublons.
    callback(null, name + Date.now() + "." + extension);
  },
});

// Configure Multer pour récupérer un seul fichier envoyé
// avec le champ "image".
module.exports = multer({ storage: storage }).single("image");
