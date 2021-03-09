const express = require("express");
const request = require("supertest");
const app = express();

const { base } = require("./controllers/base");

app.use(express.urlencoded({ extended: false }));
app.use("/api", base);

test("index route works", (done) => {
  request(app).get("/api/base").expect(200, done);
});
