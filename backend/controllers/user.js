const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Crée un nouvel utilisateur.
exports.signup = (req, res, next) => {
  // Hash le mot de passe avant de l'enregistrer dans la base de données.
  // Le nombre 10 correspond au nombre de tours utilisés par bcrypt.
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Crée un nouvel utilisateur avec l'adresse e-mail
      // et le mot de passe hashé.
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      // Enregistre l'utilisateur dans MongoDB.
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    // Retourne une erreur serveur si le hashage du mot de passe échoue.
    .catch((error) => res.status(500).json({ error }));
};

// Connecte un utilisateur existant.
exports.login = (req, res, next) => {
  // Recherche l'utilisateur correspondant à l'adresse e-mail fournie.
  User.findOne({ email: req.body.email })
    .then((user) => {
      // Si aucun utilisateur n'est trouvé, les identifiants sont incorrects.
      if (user === null) {
        return res
          .status(401)
          .json({ message: "Paire identifiant/mot de passe incorrecte" });
      }

      // Compare le mot de passe fourni avec le mot de passe hashé
      // enregistré dans la base de données.
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // Si les mots de passe ne correspondent pas,
          // l'utilisateur n'est pas authentifié.
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire identifiant/mot de passe incorrecte" });
          }

          // Si les identifiants sont corrects, génère un token JWT.
          // Le token contient l'identifiant de l'utilisateur
          // et reste valide pendant 24 heures.
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
