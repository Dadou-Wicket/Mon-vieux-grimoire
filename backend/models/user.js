const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator").default;

// Définit la structure des utilisateurs enregistrés dans MongoDB.
const userSchema = mongoose.Schema({
  // L'adresse e-mail est obligatoire et doit être unique.
  email: { type: String, required: true, unique: true },

  // Le mot de passe est obligatoire.
  // Il est enregistré sous forme de hash grâce à bcrypt
  // avant d'arriver dans ce modèle.
  password: { type: String, required: true },
});

// Ajoute la validation permettant de gérer correctement
// les doublons sur les champs définis comme uniques.
userSchema.plugin(uniqueValidator);

// Crée le modèle User à partir du schéma.
// Ce modèle permet d'effectuer les opérations sur les utilisateurs
// dans la base de données MongoDB.
module.exports = mongoose.model("User", userSchema);
