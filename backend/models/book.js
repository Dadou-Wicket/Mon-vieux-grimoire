const mongoose = require("mongoose");

// Définit la structure des documents "Book" dans MongoDB.
const bookSchema = mongoose.Schema({
  // Identifiant de l'utilisateur qui possède le livre.
  userId: { type: String, required: true },

  // Informations principales du livre.
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },

  // Tableau contenant les notes attribuées au livre.
  ratings: [
    {
      // Identifiant de l'utilisateur ayant donné la note.
      userId: { type: String, required: true },

      // Note attribuée au livre.
      grade: { type: Number, required: true },
    },
  ],

  // Moyenne de toutes les notes du livre.
  // Elle est initialisée à 0 lorsqu'aucune note n'a encore été donnée.
  averageRating: { type: Number, required: true, default: 0 },
});

// Crée le modèle Book à partir du schéma.
// Ce modèle permet ensuite d'effectuer les opérations sur les livres
// dans la base de données MongoDB.
module.exports = mongoose.model("Book", bookSchema);
