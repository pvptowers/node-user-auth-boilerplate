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

const secondUser = {
  email: "test2@test.com",
  password: "P4ssword",
  passwordConfirm: "P4ssword",
  // teamName: "testteam",
  role: "guestUser",
  agreedTerms: true,
};

const createTeam = (team = validTeam) => {
  return request(app).post("/auth/register").send(team);
};

const getTeam = (teamId, token) => {
  return request(app)
    .get(`/auth/get-team/${teamId}`)
    .set("Authorization", `Bearer ${token}`);
};

const getUser = (id, token) => {
  return request(app)
    .get(`/auth/get-user/${id}`)
    .set("Authorization", `Bearer ${token}`);
};

const deleteUser = (id, token) => {
  return request(app)
    .delete(`/auth/delete-user/${id}`)
    .set("Authorization", `Bearer ${token}`);
};

const deleteATeam = (teamId, token) => {
  const theTeam = teamId;
  return request(app)
    .delete(`/auth/delete-team/${theTeam}`)
    .set("Authorization", `Bearer ${token}`);
};

const addNewUser = (newUser, token) => {
  return request(app)
    .post("/auth/add-user")
    .send(newUser)
    .set("Authorization", `Bearer ${token}`);
};

const updateTheTeam = (updatedTeamDetails, teamId, token) => {
  return request(app)
    .put(`/auth/update-team/${teamId}`)
    .send(updatedTeamDetails)
    .set("Authorization", `Bearer ${token}`);
};

const updateUser = (updatedUserDetails, id, token) => {
  console.log(id);
  return request(app)
    .patch(`/auth/update-user/${id}`)
    .send(updatedUserDetails)
    .set("Authorization", `Bearer ${token}`);
};

describe("User Route GET /get-user/:id", () => {
  describe("Get user succeeds", () => {
    it("Returns 200 status code when a get-user succeeds", async () => {
      const team = await createTeam();
      const userId = team.body.data._id;
      const token = team.body.token;
      const response = await getUser(userId, token);
      expect(response.status).toBe(200);
    });
  });
});

describe("User Route DELETE /get-user/:id", () => {
  describe("Delete user succeeds", () => {
    it("Returns 200 status code when user is deleted", async () => {
      const team = await createTeam();
      const userId = team.body.data._id;
      const token = team.body.token;
      const response = await deleteUser(userId, token);
      expect(response.status).toBe(200);
    });
  });
});

describe("User Route PATCH /update-user/:id", () => {
  describe("Delete user succeeds", () => {
    it("Returns 200 status code when user is deleted", async () => {
      const team = await createTeam();
      const userId = team.body.data._id;
      console.log(userId);
      const token = team.body.token;
      const newEmail = "new@test.com";
      const response = await updateUser({ email: newEmail }, userId, token);
      expect(response.status).toBe(200);
    });
  });
});
