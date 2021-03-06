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

const secondUser = {
  email: "test2@test.com",
  password: "P4ssword",
  passwordConfirm: "P4ssword",
  // teamName: "testteam",
  role: "guestUser",
  agreedTerms: true,
};

describe("TEAM ROUTE - GET /team/get-team", () => {
  describe("GET request for Team Succeeds", () => {
    it("Should return 200 status code when get request succeeds", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const token = team.body.token;
      const id = team.body.data.team;
      const response = await getTeamByIdTestUtil(id, token);
      expect(response.status).toBe(200);
    });

    it("Should return team ID in response body when get request is successful", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const token = team.body.token;
      const id = team.body.data.team;
      const response = await getTeamByIdTestUtil(id, token);
      expect(response.body.data._id).toBe(id);
    });

    it("Should return ID of users in response body when get request is successful", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const token = team.body.token;
      const id = team.body.data.team;
      const response = await getTeamByIdTestUtil(id, token);
      expect(response.body.data.users).toBeTruthy();
    });

    it("Should return team name in response body when get request is successful", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const token = team.body.token;
      const id = team.body.data.team;
      const response = await getTeamByIdTestUtil(id, token);
      expect(response.body.data.teamName).toBe(validTeam.teamName);
    });
  });

  describe("GET request for team fails", () => {
    it("Should return 404 when when team ID is invalid", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const token = team.body.token;
      const incorrectId = "60ed6b63ae65868cb03dda6a";
      const response = await getTeamByIdTestUtil(incorrectId, token);
      expect(response.status).toBe(404);
    });

    it("Should return mesage No Team Exists with this ID when id is incorrect", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const token = team.body.token;
      const incorrectId = "60ed6b63ae65868cb03dda6a";
      const response = await getTeamByIdTestUtil(incorrectId, token);
      expect(response.body.message).toBe("No Team Exists With This ID");
    });

    it("Should return CastError when format of Team ID is incorrect", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const token = team.body.token;
      const incorrectId = "123";
      const response = await getTeamByIdTestUtil(incorrectId, token);
      expect(response.body.message).toBe(
        'Cast to ObjectId failed for value "123" at path "_id" for model "Team"'
      );
    });

    it("Should return 500 when format of Team ID is incorrect", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const token = team.body.token;
      const incorrectId = "123";
      const response = await getTeamByIdTestUtil(incorrectId, token);
      expect(response.status).toBe(500);
    });
  });
});

describe("TEAM ROUTE POST /team/addUser", () => {
  describe("Add User To Team Succeeds", () => {
    it("Returns 200 status code when user successfully added to team", async () => {
      const team = await registerTeamTestUtil(validTeam);
      const teamId = team.body.data.team;
      const token = team.body.token;
      const newUser = { ...secondUser, teamId: teamId };
      const response = await addNewUserTestUtil(newUser, token);
      expect(response.status).toBe(200);
    });

    it("Saves the new user to the database", async () => {
      const teamResponse = await registerTeamTestUtil(validTeam);
      const teamId = teamResponse.body.data.team;
      const token = teamResponse.body.token;
      const newUser = { ...secondUser, teamId: teamId };
      const response = await addNewUserTestUtil(newUser, token);
      const newUserId = response.body.data._id;
      const team = await Team.findById(teamId);
      expect(team.users[1].toString()).toEqual(newUserId.toString());
    });

    it("Saves the users email in the database", async () => {
      const teamResponse = await registerTeamTestUtil(validTeam);
      const token = teamResponse.body.token;
      const teamId = teamResponse.body.data.team;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUserTestUtil(newUserToAdd, token);
      const newUserId = response.body.data._id;
      const findUser = await User.findById(newUserId);
      expect(findUser.email).toBe(secondUser.email);
    });

    it("Returns user token in response body when creating a new user is successful", async () => {
      const teamResponse = await registerTeamTestUtil(validTeam);
      const token = teamResponse.body.token;
      const teamId = teamResponse.body.data.team;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUserTestUtil(newUserToAdd, token);
      expect(response.body.token).toBeTruthy();
    });

    describe("Adding new user fails - Missing Inputs", () => {
      it("Returns 401 when teamId is not provided", async () => {
        const teamResponse = await registerTeamTestUtil(validTeam);
        const token = teamResponse.body.token;
        const newUserToAdd = { ...secondUser, teamId: "" };
        const response = await addNewUserTestUtil(newUserToAdd, token);
        expect(response.status).toBe(401);
      });
      it("Returns 401 when email is not provided", async () => {
        const teamResponse = await registerTeamTestUtil(validTeam);
        const token = teamResponse.body.token;
        const newUserToAdd = { ...secondUser, email: "" };
        const response = await addNewUserTestUtil(newUserToAdd, token);
        expect(response.status).toBe(401);
      });
    });
  });
});

describe("UPDATE TEAM", () => {
  it("Should return 200", async () => {
    const newTeam = await registerTeamTestUtil(validTeam);
    const id = newTeam.body.data.team;
    const token = newTeam.body.token;
    const newTeamName = "ChangedTeam";
    const response = await updateTeamTestUtil(
      { teamName: newTeamName },
      id,
      token
    );
    expect(response.status).toBe(200);
  });
});

describe("Delete Team", () => {
  it("Should return 200", async () => {
    const response = await registerTeamTestUtil(validTeam);
    const id = response.body.data.team;
    const token = response.body.token;
    const deleteTheTeam = await deleteTeamTestUtil(id, token);
    expect(deleteTheTeam.status).toBe(200);
  });
});
