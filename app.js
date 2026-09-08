require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log("Erreur MongoDB :", error.message));
