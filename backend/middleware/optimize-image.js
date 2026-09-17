const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

// Désactive le cache de sharp pour éviter le verrouillage des fichiers (erreur EBUSY)
sharp.cache(false);

module.exports = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const inputPath = req.file.path;
  const parsedPath = path.parse(inputPath);
  const outputFilename = `${parsedPath.name.split(".")[0]}.webp`;
  const outputPath = path.join(__dirname, "..", "images", outputFilename);
  try {
    await sharp(inputPath)
      .resize(800, 800, {
        //
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    await fs.unlink(inputPath);
    req.file.filename = outputFilename;
    req.file.path = outputPath;
    req.file.mimetype = "image/webp";
    next();
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'image :", error);
    try {
      await fs.unlink(inputPath);
    } catch (unlinkError) {
      console.error(
        "Erreur lors de la suppression du fichier temporaire :",
        unlinkError,
      );
    }
    res.status(500).json({ error });
  }
};
