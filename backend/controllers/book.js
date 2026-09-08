const fs = require("fs");
const Book = require("../models/book");

// Récupère tous les livres présents dans la base de données.
exports.getAllBooks = (req, res, next) => {
  console.log("➡️ GET /api/books appelé");
  Book.find()
    .then((books) => {
      console.log("➡️ Livres trouvés :", books);
      res.status(200).json(books);
    })
    .catch((error) => {
      console.error("❌ ERREUR GET /api/books :", error);
      res.status(400).json({ error });
    });
};

// Récupère un livre à partir de son identifiant.
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Retourne une erreur si aucun livre ne correspond à l'identifiant.
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Renvoie le livre trouvé.
      res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};

// Récupère les trois livres ayant les meilleures notes moyennes.
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    // Trie les livres par note moyenne décroissante.
    .sort({ averageRating: -1 })
    // Limite le résultat aux trois premiers livres.
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Crée un nouveau livre dans la base de données.
exports.createBook = (req, res, next) => {
  // Les informations du livre sont envoyées sous forme de chaîne JSON.
  const bookObject = JSON.parse(req.body.book);

  // Supprime les données qui ne doivent pas être fournies par le client.
  delete bookObject._id;
  delete bookObject.userId;
  delete bookObject.ratings;
  delete bookObject.averageRating;

  // Crée le livre avec les informations reçues et les données générées par le serveur.
  const book = new Book({
    ...bookObject,

    // L'identifiant du propriétaire est récupéré depuis le token JWT.
    userId: req.auth.userId,

    // Construit l'URL complète de l'image enregistrée par Multer.
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,

    // Un nouveau livre ne possède encore aucune note.
    ratings: [],

    // La note moyenne est initialisée à zéro.
    averageRating: 0,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre créé !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Modifie un livre existant.
exports.updateBook = (req, res, next) => {
  // Si une nouvelle image est envoyée, on récupère les données du livre
  // dans req.body.book et on remplace l'ancienne imageUrl.
  // Sinon, les données sont récupérées directement depuis req.body.
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  // Empêche le client de modifier le propriétaire, les notes
  // et la note moyenne du livre.
  delete bookObject.userId;
  delete bookObject.ratings;
  delete bookObject.averageRating;

  // Recherche le livre à modifier.
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifie que le livre existe.
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Vérifie que l'utilisateur connecté est bien le propriétaire du livre.
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "unauthorized request" });
      }

      // Met à jour le livre avec les nouvelles informations.
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id },
      )
        .then(() => res.status(200).json({ message: "Livre modifié !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  // Recherche le livre à supprimer
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifie que le livre existe
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Vérifie que l'utilisateur connecté est bien le propriétaire du livre
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "unauthorized request" });
      }

      // Récupère le nom du fichier image à partir de son URL
      const filename = book.imageUrl.split("/images/")[1];

      // Supprime l'image du dossier images
      fs.unlink(`images/${filename}`, (error) => {
        if (error) {
          console.log("Erreur lors de la suppression de l'image :", error);
          return res.status(500).json({ error });
        }

        // Supprime ensuite le livre de MongoDB
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
  // Convertit la note reçue en nombre.
  const rating = Number(req.body.rating);

  // Utilise l'identifiant de l'utilisateur authentifié plutôt
  // que celui éventuellement envoyé par le client.
  const userId = req.auth.userId;

  // Vérifie que la note est un nombre entier compris entre 0 et 5.
  if (rating < 0 || rating > 5 || !Number.isInteger(rating)) {
    return res
      .status(400)
      .json({ message: "La note doit être comprise entre 0 et 5" });
  }

  // Recherche le livre concerné.
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifie que le livre existe.
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Vérifie que l'utilisateur n'a pas déjà noté ce livre.
      const alreadyRated = book.ratings.some(
        (rating) => rating.userId === userId,
      );

      if (alreadyRated) {
        return res
          .status(400)
          .json({ message: "Vous avez déjà noté ce livre" });
      }

      // Ajoute la nouvelle note au tableau des notes.
      book.ratings.push({
        userId: userId,
        grade: rating,
      });

      // Calcule la somme de toutes les notes.
      const total = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);

      // Calcule la nouvelle moyenne des notes.
      book.averageRating = total / book.ratings.length;

      // Enregistre les modifications dans MongoDB.
      book
        .save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};
