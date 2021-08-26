const request = require("supertest");
const app = require("../app");
const User = require("../models/user.model");
const Team = require("../models/team.model");
const mongoose = require("mongoose");
const httpMocks = require("node-mocks-http");

const ErrorHandler = require("./ErrorHandler");
const {
  createAccount,
  addUser,
  getAccount,
  getAllTeams,
  login,
  logout,
} = require("../components/authentication/authentication.controller");
const ErrorResponse = require("./errorResponse");

beforeAll(async () => {
  jest.setTimeout(20000);

  await mongoose.connect(
    "mongodb+srv://dbUser:ahuyt2345lkhf@cluster0-5ozd8.mongodb.net/userauthboilerplatetest?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  );
});

beforeEach(async () => {
  await Team.deleteMany();
  await User.deleteMany();
});

afterAll(async (done) => {
  await Team.deleteMany();
  await User.deleteMany();
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const validTeam = {
  email: "test@test.com",
  password: "P4ssword",
  passwordConfirm: "P4ssword",
  teamName: "testteam",
  role: "rootUser",
  agreedTerms: true,
};

const createTeam = (team = validTeam) => {
  return request(app).post("/auth/create-account").send(team);
};

describe("Testing Error", () => {
  it("Testing CastError", async () => {
    process.env = {
      NODE_ENV: "production",
    };
    const error = {
      name: "CastError",
      path: "/id",
      value: "123456",
      // statusCode: 400,
    };

    const req = {};
    const next = {};

    let res = {
      json: function (a) {
        this.message = a;

        return a;
      },
      status: function (s) {
        this.statusCode = s;
        return this;
      },
    };

    ErrorHandler(error, req, res, next);
    console.log("FINAL CONSOLE", res);
    expect(res.statusCode).toBe(400);
  });
  it("Testing CastError in DEVELOPMENT", async () => {
    process.env = {
      NODE_ENV: "test",
    };
    const error = {
      name: "CastError",
      path: "/id",
      value: "123456",
      //statusCode: 400,
    };

    const req = {};
    const next = {};

    let res = {
      json: function (a) {
        this.message = a;

        return a;
      },
      status: function (s) {
        this.statusCode = s;
        return this;
      },
    };

    ErrorHandler(error, req, res, next);
    console.log("FINAL CONSOLE", res);
    expect(res.statusCode).toBe(400);
  });
});
//NEED TO GET RID OF IF ELSE BLOCKS FOR ENVIRONMENT VARIABLES IN ERRORHANDLER. SAME ERROR SHOULD BE SENT REGARDLESS OF DEV OR PROD WITH DEV JUST ALSO GETTING STACK TRACE
