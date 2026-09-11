const fs = require("fs");
const Book = require("../models/book");
const path = require("path");

// Récupère tous les livres présents dans la base de données.
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      console.error("Erreur getAllBooks :", error);
      res.status(400).json({ error });
    });
};

// Récupère un livre à partir de son identifiant.
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};

// Récupère les trois livres ayant les meilleures notes moyennes.
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Crée un nouveau livre dans la base de données.
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject.userId;
  delete bookObject.ratings;
  delete bookObject.averageRating;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    ratings: [],
    averageRating: 0,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Livre créé !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Modifie un livre existant.
exports.updateBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };
  delete bookObject.userId;
  delete bookObject.ratings;
  delete bookObject.averageRating;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "unauthorized request" });
      }
      const oldFilename = book.imageUrl.split("/images/")[1];
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id },
      )
        .then(() => {
          if (req.file && oldFilename) {
            const oldImagePath = path.join(
              __dirname,
              "..",
              "images",
              oldFilename,
            );
            fs.unlink(oldImagePath, (error) => {
              if (error) {
                console.error(
                  "Erreur lors de la suppression de l'ancienne image :",
                  error,
                );
              }
            });
          }
          res.status(200).json({ message: "Livre modifié !" });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

// Supprime un livre.
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "unauthorized request" });
      }
      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, (error) => {
        if (error) {
          console.error("Erreur lors de la suppression de l'image :", error);
          return res.status(500).json({ error });
        }
        Book.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "Livre supprimé !" });
          })
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(400).json({ error }));
};

// Ajoute une note à un livre.
exports.rateBook = (req, res, next) => {
  const rating = Number(req.body.rating);
  const userId = req.auth.userId;
  if (rating < 0 || rating > 5 || !Number.isInteger(rating)) {
    return res
      .status(400)
      .json({ message: "La note doit être comprise entre 0 et 5" });
  }
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      const alreadyRated = book.ratings.some(
        (rating) => rating.userId === userId,
      );
      if (alreadyRated) {
        return res
          .status(400)
          .json({ message: "Vous avez déjà noté ce livre" });
      }
      book.ratings.push({
        userId: userId,
        grade: rating,
      });
      const total = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = total / book.ratings.length;
      book
        .save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};
