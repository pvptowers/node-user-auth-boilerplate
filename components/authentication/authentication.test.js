const express = require("express");
const request = require("supertest");
const app = express();

const { createAccount } = require("./authentication.controller");

app.use(express.json());
app.use("/auth", createAccount);

describe("User Authentication", () => {
  test("POST /auth/create-account", () => {
    const data = {
      email: "user2@user.com",
      password: "123456",
      passwordConfirm: "123456",
      teamName: "testuser2",
      role: "rootUser",
      agreedTerms: true,
    };
    request(app)
      .post("/auth/create-account")
      .send(data)
      .then((response) => {
        expect(response.body.success).toBe(true);
      });
  });
});
