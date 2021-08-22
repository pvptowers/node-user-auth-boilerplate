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
  jest.resetAllMocks();
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

describe("FORGOT PASSWORD ROUTE - POST /auth/forgotpassword", () => {
  describe("Reset Token Successfully Sent", () => {
    it("Returns 200 status code when forgot password is successful", async () => {
      const user = await registerTeamTestUtil(validTeam);
      const email = user.body.data.email;
      const response = await forgotPasswordTestUtil(email);
      expect(response.status).toBe(200);
    });
  });
});

describe("RESET PASSWORD ROUTE - POST /auth/resetpassword", () => {
  describe("Password can successfully be reset", () => {
    it("Returns 200 status code when password is reset", async () => {
      const user = await registerTeamTestUtil(validTeam);
      const resetToken = await createResetTokenTestUtil(user.body.data.email);
      const response = await resetPasswordTestUtil(resetToken);
      expect(response.status).toBe(200);
    });
    it("Hashes the new users password in the database", async () => {
      const user = await registerTeamTestUtil(validTeam);
      const resetToken = await createResetTokenTestUtil(user.body.data.email);
      const response = await resetPasswordTestUtil(resetToken);
      const hashedPassword = await getHashedPasswordTestUtil();
      expect(hashedPassword).not.toBe(undefined);
      expect(hashedPassword).not.toBe(response.newPassword);
    });

    it("Updated Hash Password is different to old Hash Password", async () => {
      const newUser = await registerTeamTestUtil(validTeam);
      const user = await User.findOne({
        email: newUser.body.data.email,
      }).select("+password");
      const originalPassword = user.password;
      const resetToken = await createResetTokenTestUtil(
        newUser.body.data.email
      );
      await resetPasswordTestUtil(resetToken);
      const hashedPassword = await getHashedPasswordTestUtil();
      expect(originalPassword).not.toEqual(hashedPassword);
    });
  });
});
