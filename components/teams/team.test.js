const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticatedToken = require("../../middleware/authenticatedToken");
const app = require("../../app");
const Team = require("../../models/team.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");
const { deleteTeam } = require("./team.controller");

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
  return request(app).post("/auth/create-account").send(team);
};

const getTeam = (teamId) => {
  const theTeam = teamId;
  return request(app).get(`/auth/get-team/${theTeam}`);
};

const deleteATeam = (teamId) => {
  const theTeam = teamId;
  return request(app).delete(`/auth/delete-team/${theTeam}`);
};

const addNewUser = (newUser) => {
  return request(app).post("/auth/add-user").send(newUser);
};
describe("TEAM ROUTE - GET /team/get-team", () => {
  describe("Get Team Succeeds", () => {
    it("Should return 200 status code when get request succeeds", async () => {
      const createTeamResponse = await createTeam();
      const id = createTeamResponse.body.data.team;
      const response = await getTeam(id);
      expect(response.status).toBe(200);
    });

    it("Should return team ID in response body when get request is successful", async () => {
      const createTeamResponse = await createTeam();
      const id = createTeamResponse.body.data.team;
      const response = await getTeam(id);
      expect(response.body.data._id).toBe(id);
    });

    it("Should return ID of users in response body when get request is successful", async () => {
      const createTeamResponse = await createTeam();
      const id = createTeamResponse.body.data.team;
      const response = await getTeam(id);
      expect(response.body.data.users).toBeTruthy();
    });

    it("Should return team name in response body when get request is successful", async () => {
      const createTeamResponse = await createTeam();
      const id = createTeamResponse.body.data.team;
      const response = await getTeam(id);
      expect(response.body.data.teamName).toBe(validTeam.teamName);
    });
  });

  describe("Get team fails", () => {
    it("Should return 404 when when team ID is invalid", async () => {
      const incorrectId = "60ed6b63ae65868cb03dda6a";
      const response = await getTeam(incorrectId);
      expect(response.status).toBe(404);
    });

    //NEED TO TEST CASTERROR AND UPDATE ERROR HANDLER
    //TEST WHEN ID IS IN WRONG FORMAT
  });
});

describe("TEAM ROUTE POST /team/addUser", () => {
  describe("Add User To Team Succeeds", () => {
    it("Returns 200 status code when user successfully added to team", async () => {
      const teamResponse = await createTeam();
      const teamId = teamResponse.body.data.team;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUser(newUserToAdd);
      expect(response.status).toBe(200);
    });

    it("Saves the new user to the database", async () => {
      const teamResponse = await createTeam();
      const teamId = teamResponse.body.data.team;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUser(newUserToAdd);
      const newUserId = response.body.data._id;
      const team = await Team.findById(teamId);
      expect(team.users[1].toString()).toEqual(newUserId.toString());
    });

    it("Saves the users email in the database", async () => {
      const teamResponse = await createTeam();
      const teamId = teamResponse.body.data.team;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUser(newUserToAdd);
      const newUserId = response.body.data._id;
      const findUser = await User.findById(newUserId);
      expect(findUser.email).toBe(secondUser.email);
    });

    it("Returns user token in response body when creating a new user is successful", async () => {
      const teamResponse = await createTeam();
      const teamId = teamResponse.body.data.team;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUser(newUserToAdd);
      expect(response.body.token).toBeTruthy();
    });

    describe("Adding new user fails - Missing Inputs", () => {
      it("Returns 401 when teamId is not provided", async () => {
        const teamResponse = await createTeam();
        const newUserToAdd = { ...secondUser, teamId: "" };
        const response = await addNewUser(newUserToAdd);
        expect(response.status).toBe(401);
      });
      fit("Returns 401 when email is not provided", async () => {
        const teamResponse = await createTeam();
        const newUserToAdd = { ...secondUser, email: "" };
        const response = await addNewUser(newUserToAdd);
        expect(response.status).toBe(401);
      });
    });
  });
});

// describe("Delete Team", () => {
//   it("Should return 200", async () => {
//     const response = await createTeam();
//     const Id = response.body.data.team;
//     const deleteTheTeam = await deleteATeam(Id);
//     expect(deleteTheTeam.status).toBe(200);
//   });
// });
