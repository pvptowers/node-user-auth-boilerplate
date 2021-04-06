const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB");
const errorHandler = require("./middleware/error");
//DEFINE PATH TO CONFIG FILE
dotenv.config({
  path: "./config/config.env",
});
const app = express(); //RUN EXPRESS JS
app.use(express.json()); //PASS INCOMING REQUESTS WITH JSON

connectDB();

const base = require("./routes/base");
app.use("/api", base);
const auth = require("./components/authentication/authentication.route");
app.use("/auth", auth);
app.use(errorHandler);

module.exports = app;
