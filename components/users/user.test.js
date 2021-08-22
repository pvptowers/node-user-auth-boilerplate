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

describe("User Route GET /get-user/:id", () => {
  describe("GET user succeeds", () => {
    it("Returns 200 status code when a get-user succeeds", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const userId = team.body.data._id;
      const token = team.body.token;
      const response = await getUserByIdTestUtil(userId, token);
      expect(response.status).toBe(200);
    });
    it("Returns user id, email, team and role in response body", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const userId = team.body.data._id;
      const token = team.body.token;
      const response = await getUserByIdTestUtil(userId, token);
      expect(response.body.data._id).toBeTruthy();
      expect(response.body.data.email).toBeTruthy();
      expect(response.body.data.team).toBeTruthy();
      expect(response.body.data.role).toBeTruthy();
    });
  });
  describe("GET user fails", () => {
    it("Returns 404 error when user Id does not exist", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const invalidId = "612221cd0997a96418199431";
      const token = team.body.token;
      const response = await getUserByIdTestUtil(invalidId, token);
      expect(response.status).toBe(404);
    });
    it("Returns error message No user exists with that id when id is incorrect", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const invalidId = "612221cd0997a96418199431";
      const token = team.body.token;
      const response = await getUserByIdTestUtil(invalidId, token);
      expect(response.body.message).toBe("No user exists with that id");
    });
  });
});

describe("User Route DELETE /get-user/:id", () => {
  describe("Delete user succeeds", () => {
    it("Returns 200 status code when user is deleted", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const userId = team.body.data._id;
      const token = team.body.token;
      const response = await deleteUserTestUtil(userId, token);
      expect(response.status).toBe(200);
    });
    it("Returns null data if user is successfully deleted", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const userId = team.body.data._id;
      const token = team.body.token;
      const response = await deleteUserTestUtil(userId, token);
      expect(response.body.data).toBe(null);
    });
    it("Returns error message No user exists with that id when id is incorrect", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const invalidId = "612221cd0997a96418199431";
      const token = team.body.token;
      const response = await deleteUserTestUtil(invalidId, token);
      expect(response.body.message).toBe("No user exists with that id");
    });
  });
  describe("Delete user fails", () => {
    it("Returns error message No user exists with that id when id is incorrect", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const invalidId = "612221cd0997a96418199431";
      const token = team.body.token;
      const response = await deleteUserTestUtil(invalidId, token);
      expect(response.body.message).toBe("No user exists with that id");
    });
  });
});

describe("User Route PATCH /update-user/:id", () => {
  describe("Updating a user succeeds", () => {
    it("Returns 200 status code when user is updated successfully", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const userId = team.body.data._id;
      const token = team.body.token;
      const newEmail = "new@test.com";
      const response = await updateUserTestUtil(
        { email: newEmail },
        userId,
        token
      );
      expect(response.status).toBe(200);
    });
    it("Returns updated email address when update is successful", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const userId = team.body.data._id;
      const token = team.body.token;
      const newEmail = "new@test.com";
      const response = await updateUserTestUtil(
        { email: newEmail },
        userId,
        token
      );
      expect(response.body.data.email).toBe(newEmail);
    });
    it("Returns user data when update is successful", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const userId = team.body.data._id;
      const token = team.body.token;
      const newEmail = "new@test.com";
      const response = await updateUserTestUtil(
        { email: newEmail },
        userId,
        token
      );
      expect(response.body.data._id).toBeTruthy();
      expect(response.body.data.email).toBeTruthy();
      expect(response.body.data.team).toBeTruthy();
      expect(response.body.data.role).toBeTruthy();
    });
  });
  describe("Updating a user fails", () => {
    it("Returns 404 status code when user id doesn't exist", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const invalidId = "612221cd0997a96418199431";
      const token = team.body.token;
      const newEmail = "new@test.com";
      const response = await updateUserTestUtil(
        { email: newEmail },
        invalidId,
        token
      );
      expect(response.status).toBe(404);
    });
    it("Returns error message No user exists with that id when id is invalid", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const invalidId = "612221cd0997a96418199431";
      const token = team.body.token;
      const newEmail = "new@test.com";
      const response = await updateUserTestUtil(
        { email: newEmail },
        invalidId,
        token
      );
      expect(response.body.message).toBe("No user exists with that id");
    });
  });
});
