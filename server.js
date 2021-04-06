const app = require("./app");
const dotenv = require("dotenv");

//DEFINE PATH TO CONFIG FILE
dotenv.config({
  path: "./config/config.env",
});

//DEFINE ENVIRONMENT PORT
const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
