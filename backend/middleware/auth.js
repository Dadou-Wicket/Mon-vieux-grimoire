const jwt = require("jsonwebtoken");

// Middleware chargé de vérifier l'authentification de l'utilisateur.
module.exports = (req, res, next) => {
  try {
    // Récupère le token JWT envoyé dans l'en-tête Authorization.
    // Le format attendu est : "Bearer token".
    const token = req.headers.authorization.split(" ")[1];

    // Vérifie que le token est valide avec la clé secrète.
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");

    // Récupère l'identifiant de l'utilisateur contenu dans le token.
    const userId = decodedToken.userId;

    // Stocke l'identifiant de l'utilisateur dans la requête
    // afin qu'il soit accessible dans les contrôleurs.
    req.auth = {
      userId: userId,
    };

    // Passe au middleware ou contrôleur suivant.
    next();
  } catch (error) {
    // Si le token est absent, invalide ou expiré,
    // l'utilisateur n'est pas autorisé à accéder à la ressource.
    res.status(401).json({ error });
  }
};
