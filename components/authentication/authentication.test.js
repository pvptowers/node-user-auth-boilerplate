const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticatedToken = require("../../middleware/authenticatedToken");
const app = require("../../app");
const Team = require("../../models/team.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");
const userOne = {
  email: "testing@user.com",
  password: "123456",
  passwordConfirm: "123456",
  teamName: "SuperTestTeam",
  role: "rootUser",
  agreedTerms: true,
};

let token;

beforeAll(async (done) => {
  await mongoose.connect(
    "mongodb+srv://dbUser:ahuyt2345lkhf@cluster0-5ozd8.mongodb.net/userauthboilerplatetest?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  );

  return await request(app)
    .post("/auth/create-account")
    .send({
      email: "testing24@user.com",
      password: "123456",
      passwordConfirm: "123456",
      teamName: "SuperTestTeam23334",
      role: "rootUser",
      agreedTerms: true,
    })
    .then((response) => {
      done();
    });
});

afterAll(async (done) => {
  await Team.deleteMany();
  await User.deleteMany();
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

describe("Create Account", () => {
  it("Should create a new Account and User", async () => {
    return await request(app)
      .post("/auth/create-account")
      .send({
        email: "jest@test.com",
        password: "123456",
        passwordConfirm: "123456",
        teamName: "jesttest",
        role: "rootUser",
        agreedTerms: true,
      })

      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeTruthy();
        expect(response.body.data.email).toBe("jest@test.com");
        expect(response.body.data.role).toBe("rootUser");
        expect(response.body.data.agreedTerms).toBe(true);
        expect(response.body.data.password).toBeTruthy();
        expect(response.body.data.password).not.toEqual("123456");
        expect(response.body.data.passwordConfirm).toBe(undefined);
      });
  });
});

describe("Login User", () => {
  test("Should return 200 and login user if email and password is correct", async () => {
    return await request(app)
      .post("/auth/login")
      .send({
        email: "testing24@user.com",
        password: "123456",
      })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeTruthy();
        expect(response.body.data.email).toBe("testing24@user.com");
      });
  });

  test("Should return 401 if user email or password is not provided", async () => {
    return await request(app)
      .post("/auth/login")
      .send({
        email: "",
        password: "",
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(
          "Please provide your email and password"
        );
        expect(response.body.error.status).toBe("Failure");
        expect(response.body.error.isOperational).toBe(true);
      });
  });

  test("Should return 401 error if there is no user with the email address", async () => {
    return await request(app)
      .post("/auth/login")
      .send({
        email: "wrong@email.com",
        password: "123456",
      })
      .then((response) => {
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid Credentials");
      });
  });

  test("Should return 401 error if the password does not match", async () => {
    return await request(app)
      .post("/auth/login")
      .send({
        email: "testing24@user.com",
        password: "wrongemail",
      })
      .then((response) => {
        expect(response.statusCode).toBe(401);
      });
  });
});

describe("Logout user", async () => {
  test("It Should Logout The User", async () => {
    return await request(app)
      .get("/auth/logout")
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.cookie).toBe(undefined);
      });
  });
});
