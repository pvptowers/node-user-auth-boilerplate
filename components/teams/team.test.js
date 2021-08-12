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

describe("TEAM ROUTE - GET /team/get-team", () => {
  describe("Get Team Succeeds", () => {
    it("Should return 200 status code when get request succeeds", async () => {
      const createTeamResponse = await createTeamTest(validTeam);
      const token = createTeamResponse.body.token;

      const id = createTeamResponse.body.data.team;
      const response = await getTeam(id, token);
      expect(response.status).toBe(200);
    });

    it("Should return team ID in response body when get request is successful", async () => {
      const createTeamResponse = await createTeamTest(validTeam);
      const token = createTeamResponse.body.token;
      const id = createTeamResponse.body.data.team;
      const response = await getTeam(id, token);
      expect(response.body.data._id).toBe(id);
    });

    it("Should return ID of users in response body when get request is successful", async () => {
      const createTeamResponse = await createTeam();
      const token = createTeamResponse.body.token;
      const id = createTeamResponse.body.data.team;
      const response = await getTeam(id, token);
      expect(response.body.data.users).toBeTruthy();
    });

    it("Should return team name in response body when get request is successful", async () => {
      const createTeamResponse = await createTeam();
      const token = createTeamResponse.body.token;
      const id = createTeamResponse.body.data.team;
      const response = await getTeam(id, token);
      expect(response.body.data.teamName).toBe(validTeam.teamName);
    });
  });

  describe("Get team fails", () => {
    it("Should return 404 when when team ID is invalid", async () => {
      const createTeamResponse = await createTeam();
      const token = createTeamResponse.body.token;
      const incorrectId = "60ed6b63ae65868cb03dda6a";
      const response = await getTeam(incorrectId, token);
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
      const token = teamResponse.body.token;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUser(newUserToAdd, token);
      expect(response.status).toBe(200);
    });

    it("Saves the new user to the database", async () => {
      const teamResponse = await createTeam();
      const teamId = teamResponse.body.data.team;
      const token = teamResponse.body.token;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUser(newUserToAdd, token);
      const newUserId = response.body.data._id;
      const team = await Team.findById(teamId);
      expect(team.users[1].toString()).toEqual(newUserId.toString());
    });

    it("Saves the users email in the database", async () => {
      const teamResponse = await createTeam();
      const token = teamResponse.body.token;
      const teamId = teamResponse.body.data.team;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUser(newUserToAdd, token);
      const newUserId = response.body.data._id;
      const findUser = await User.findById(newUserId);
      expect(findUser.email).toBe(secondUser.email);
    });

    it("Returns user token in response body when creating a new user is successful", async () => {
      const teamResponse = await createTeam();
      const token = teamResponse.body.token;
      const teamId = teamResponse.body.data.team;
      const newUserToAdd = { ...secondUser, teamId: teamId };
      const response = await addNewUser(newUserToAdd, token);
      expect(response.body.token).toBeTruthy();
    });

    describe("Adding new user fails - Missing Inputs", () => {
      it("Returns 401 when teamId is not provided", async () => {
        const teamResponse = await createTeam();
        const token = teamResponse.body.token;
        const newUserToAdd = { ...secondUser, teamId: "" };
        const response = await addNewUser(newUserToAdd, token);
        expect(response.status).toBe(401);
      });
      it("Returns 401 when email is not provided", async () => {
        const teamResponse = await createTeam();
        const token = teamResponse.body.token;
        const newUserToAdd = { ...secondUser, email: "" };
        const response = await addNewUser(newUserToAdd, token);
        expect(response.status).toBe(401);
      });
    });
  });
});

describe("UPDATE TEAM", () => {
  it("Should return 200", async () => {
    const newTeam = await createTeam();
    const id = newTeam.body.data.team;
    const token = newTeam.body.token;
    const newTeamName = "ChangedTeam";
    const response = await updateTheTeam({ teamName: newTeamName }, id, token);
    expect(response.status).toBe(200);
  });
});

describe("Delete Team", () => {
  it("Should return 200", async () => {
    const response = await createTeam();
    const id = response.body.data.team;
    const token = response.body.token;
    const deleteTheTeam = await deleteATeam(id, token);
    expect(deleteTheTeam.status).toBe(200);
  });
});
