const request = require("supertest");
const app = require("../app");
const User = require("../models/user.model");
const Team = require("../models/team.model");
const mongoose = require("mongoose");
const ErrorHandler = require("../middleware/ErrorHandler");
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

describe("Error Model", () => {
  it("Returns path, timestamp, message and validationErrors in response when validation fails", async () => {
    const response = await createTeam({ ...validTeam, email: null });
    const body = response.body;
    expect(Object.keys(body)).toEqual([
      "path",
      "timestamp",
      "message",
      "validationErrors",
      "status",
    ]);
  });
});

describe("Errors", () => {
  it("throws an error", async () => {
    let err = { name: "CastError" };
    if (err.name === "CastError") {
      expect(ErrorResponse).toThrow("");
    }
  });
});

// describe("Errors", () => {
//   let mRes;
//   let mNext;
//   let mErr = {
//     status: 401,
//     message: "Validation Failure",
//   };
//   beforeEach(() => {
//     mRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
//     mNext = jest.fn();
//   });

//   afterEach(() => {
//     jest.resetAllMocks();
//   });
//   fit("throws an error", async () => {
//     const mReq = { body: {} };
//     const mRes = {
//       path: ".../",
//       timestamp: new Date().getTime(),
//       message,
//       ValidatiorErrors,
//       status,
//     };
//     ErrorHandler(mErr, mReq, mRes, mNext);
//     expect(mErr.status).toBeCalledWith(401);
//   });
// });

// const throwE = () => {
//   return request(app).status(401).send({

//       path: "req.originalUrl",
//       timestamp: new Date().getTime(),
//       message: "Validation Failure",
//       validationErrors: {},
//       status: 401

//   })
// }

// const throwE = () => {
//   let mReq;
//   let mRes;
//   let mNext;
//   return new ErrorHandler(
//     {
//       message: "Validation Failure",
//       errors: {},
//       status: 401,
//     },
//     mReq,
//     mRes,
//     mNext
//   );
// };

describe("Errors", () => {
  const error = {
    status: 401,
    message: "Validation Failure",
    path: "../feg",
    timestamp: new Date().getTime(),
    validationErrors: {},
    // errors: {},
  };

  let mReq;
  let mRes;
  let mNext = jest.fn();

  beforeEach(() => {
    mReq = {};
    mRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("throws an error", async () => {
    ErrorHandler(error, mReq, mRes, mNext);
    console.log("THIS IS ERRR", error);
    console.log("This is res", mRes);
    expect(mRes.send).toHaveBeenCalledWith(error);
    expect(mRes.status).toBe(401);
  });
});

describe("Errors", () => {
  fit("throws an error aaa", async () => {
    const error = {
      status: 401,
      message: "Validation Failure",
      path: "../feg",
      timestamp: new Date().getTime(),
      validationErrors: {},
      // errors: {},
    };
    expect(ErrorHandler).toThrow(error);
  });
});

describe("Errors", () => {
  let req;
  let res;
  const next = jest.fn();

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };

    res = {
      data: null,
      code: null,
      status: 401,

      send(payload) {
        this.data = payload;
      },
    };

    next.mockClear();
  });

  it("throws an error aaa", async () => {
    ErrorHandler(new Error(), req, res, next);
    expect(res.code).toBeDefined();
    expect(res.code).toBe(500);

    expect(res.data).toBeDefined();
    expect(res.data).toBe("Something broke!");
  });
});
//https://stackoverflow.com/questions/45784314/how-to-trigger-express-error-middleware/45785855
