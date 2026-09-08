const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

module.exports = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const inputPath = req.file.path;
  const parsedPath = path.parse(inputPath);
  const outputFilename = `${parsedPath.name.split(".")[0]}.webp`;
  const outputPath = path.join(parsedPath.dir, outputFilename);

  sharp(inputPath)
    .resize(800, 800, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
      fs.unlink(inputPath, (error) => {
        if (error) {
          console.error(
            "Erreur lors de la suppression de l'image originale :",
            error,
          );
          return res.status(500).json({ error });
        }

        req.file.filename = outputFilename;
        req.file.path = outputPath;
        req.file.mimetype = "image/webp";

        next();
      });
    })
    .catch((error) => {
      console.error("Erreur lors de l'optimisation de l'image :", error);

      fs.unlink(inputPath, () => {});

      res.status(500).json({ error });
    });
};
