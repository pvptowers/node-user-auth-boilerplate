const request = require("supertest");
const app = require("../../app");
const Team = require("../../models/team.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");
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
  return request(app).post("/auth/register").send(team);
};

const forgotPassword = (email) => {
  return request(app).post("/auth/forgotpassword").send({ email });
};

const resetPassword = (resetToken, newPassword, newPasswordConfirm) => {
  return request(app)
    .patch(`/auth/resetPassword/${resetToken}`)
    .send({ password: newPassword, passwordConfirm: newPasswordConfirm });
};

describe("FORGOT PASSWORD ROUTE - POST /auth/forgotpassword", () => {
  describe("Password can successfully be reset", () => {
    it("Returns 200 status code when password is reset", async () => {
      const newUser = await createTeam();
      const email = newUser.body.data.email;
      const user = await User.findOne({ email });
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });
      const newPassword = "123456Abc";
      const newPasswordConfirm = "123456Abc";
      const response = await resetPassword(
        resetToken,
        newPassword,
        newPasswordConfirm
      );
      expect(response.status).toBe(200);
    });
  });
});

describe("RESET PASSWORD ROUTE - POST /auth/resetpassword", () => {
  describe("Reset Token Successfully Sent", () => {
    it("Returns 200 status code when forgot password is successful", async () => {
      const user = await createTeam();
      const email = user.body.data.email;
      const response = await forgotPassword(email);
      expect(response.status).toBe(200);
    });
  });
});
