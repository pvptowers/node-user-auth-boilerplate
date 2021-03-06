const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const hpp = require("hpp");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/connectDB");
const errorHandler = require("./middleware/ErrorHandler");
const ErrorResponse = require("./middleware/errorResponse");
//DEFINE PATH TO CONFIG FILE
dotenv.config({
  path: "./config/config.env",
});

//INITIALIZE APPLICATION
const app = express();

//PARSE INCOMING REQUESTS WITH JSON
app.use(express.json());

//PARSE FIELDS INCLUDED IN URLENCODED PAYLOADS
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//CONNECT TO DATABASE
connectDB();

//MORGAN - REQUEST & ERROR LOGGING
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//SET HTTP RESPONSE HEADERS
app.use(helmet());

//PROTECT AGAINST HTTP PARAMETER POLLUTION ATTACKS
app.use(hpp());

//PREVENT XSS ATTACHS
app.use(xss());

//SANITISE INPUTS AGAINST QUERY SELECTOR INJECTION ATTACKS
app.use(mongoSanitize());

//APPLY API RATE LIMITING
const applyRateLimit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use(applyRateLimit);

//DEFINE ROUTE HANDLERS

const auth = require("./components/authentication/authentication.route");
app.use("/auth", auth);
const user = require("./components/users/user.route");
app.use("/auth/", user);
const team = require("./components/teams/team.route");
app.use("/auth/", team);
const password = require("./components/password-reset/passwordReset.route");
app.use("/auth/", password);

//CATCH UNDEFINED URLS
app.all("*", (req, res, next) => {
  next(new ErrorResponse(`Cant find ${req.originalUrl} on this server`, 404));
});

//CALL GLOBAL ERROR HANDLER
// app.use(errorHandler);

app.use(errorHandler);

module.exports = app;
