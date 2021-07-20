const request = require("supertest");
const app = require("../app");
const User = require("../models/user.model");
const Team = require("../models/team.model");
const mongoose = require("mongoose");
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
  it("testing new fix", async () => {
    process.env = {
      NODE_ENV: "test",
    };

    const mErr = {
      status: 401,
      message: "This is an error",
      stack: "this is a stack",
      validationErrors: {},
    };

    const fn = jest.fn();

    const mRes = {
      json: fn,
    };
    ErrorHandler(mErr, null, mRes, null);
    expect(fn).toBeCalled();
    expect(fn).toBeCalledWith({
      status: 401,
      message: "This is an error",
      stack: "this is a stack",
      error: {
        status: 401,
        message: "This is an error",
        stack: "this is a stack",
      },
      validationErrors: {},
    });
  });

  it("2nd test", async () => {
    process.env = {
      NODE_ENV: "test",
    };

    const mErr = {
      status: 401,
      message: "This is an error",
      stack: "this is a stack",
      validationErrors: {},
    };

    const statusfn = jest.fn();
    const jsonfn = jest.fn();

    const mRes = {
      json: jsonfn,
      status: (n) => {
        statusfn(n);
        return mRes;
      },
    };
    ErrorHandler(mErr, null, mRes, null);
    expect(statusfn).toBeCalledWith(401);
    expect(jsonfn).toBeCalled();
    expect(jsonfn).toBeCalledWith({
      status: 401,
      message: "This is an error",
      stack: "this is a stack",
      error: {
        status: 401,
        message: "This is an error",
        stack: "this is a stack",
      },
      validationErrors: {},
    });
  });
});
