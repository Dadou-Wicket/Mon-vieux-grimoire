require("dotenv").config();

const express = require("express");
const bookRoutes = require("./routes/book");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const app = express();
app.use(express.json());
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);
const Book = require("./models/book");
const User = require("./models/user");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log("Erreur MongoDB :", error.message));

app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});
