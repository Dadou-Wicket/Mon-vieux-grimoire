require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bookRoutes = require("./routes/book");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const app = express();

app.use(express.json());
app.use(cors());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.error("Erreur MongoDB :", error.message));

app.listen(4000, () => {
  console.log("Serveur démarré sur le port 4000");
});
