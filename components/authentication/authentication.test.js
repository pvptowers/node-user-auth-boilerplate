const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticatedToken = require("../../middleware/authenticatedToken");
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
  return request(app).post("/auth/create-account").send(team);
};

const loginUser = () => {
  return request(app)
    .post("/auth/login")
    .send({ email: validTeam.email, password: validTeam.password });
};

describe("Account login", () => {
  it("Returns 200 status code when user logs in successfully", async () => {
    await createTeam();
    const response = await loginUser();
    expect(response.status).toBe(200);
  });

  it("Returns user data in response body when login is successful", async () => {
    await createTeam();
    const response = await loginUser();
    expect(response.body.data.email).toBe(validTeam.email);
  });

  it("Returns user token in response body when login is successful", async () => {
    await createTeam();
    const response = await loginUser();
    expect(response.body.token).toBeTruthy();
  });

  it("Returns 401 when user does not exist", async () => {
    await createTeam();
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "abc@abc.com", password: validTeam.password });
    expect(response.status).toBe(401);
  });
});

describe("Account Creation - Success States", () => {
  it("Returns 200 status code when account creation process is successful", async () => {
    const response = await createTeam();
    expect(response.status).toBe(200);
  });

  it("Returns success message when account creation process is successful", async () => {
    const response = await createTeam();
    expect(response.body.message).toBe("Account created successfully");
  });

  it("Saves the team to the database", async () => {
    await createTeam();
    const teamList = await Team.find();
    expect(teamList.length).toBe(1);
  });

  it("Saves the team name to the database", async () => {
    await createTeam();
    const teamList = await Team.find();
    const savedTeam = teamList[0];
    expect(savedTeam.teamName).toBe(validTeam.teamName);
  });

  it("Saves the root user to the database", async () => {
    await createTeam();
    const teamList = await Team.find();
    const savedUser = await teamList[0].users[0];
    const findUser = await User.find(savedUser);
    expect(findUser.length).toBe(1);
  });

  it("Saves the users email and team in the database", async () => {
    await createTeam();
    const teamList = await Team.find();
    const savedUser = await teamList[0].users[0];
    const findUser = await User.find(savedUser);
    expect(findUser[0].email).toBe(validTeam.email);
    expect(findUser[0].team[0]).toBe(validTeam._id);
  });

  it("Ensures the user has agreed terms before saving team and user to database", async () => {
    await createTeam();
    const teamList = await Team.find();
    const savedUser = await teamList[0].users[0];
    const findUser = await User.find(savedUser);
    expect(findUser[0].agreedTerms).toBe(true);
    expect(findUser[0].team[0]).toBe(validTeam._id);
  });

  it("Hashes the users password in the database", async () => {
    await createTeam();
    const teamList = await Team.find();
    const savedUser = await teamList[0].users[0];
    const findUser = await User.find(savedUser).select("+password");
    const userPassword = findUser[0].password;
    expect(userPassword).not.toBe(undefined);
    expect(userPassword).not.toBe(validTeam.password);
  });
});

describe("Account Creation - Failure States", () => {
  it("Returns 401 when teamname is null", async () => {
    const newTeam = { ...validTeam, teamName: null };
    const response = await createTeam(newTeam);
    expect(response.status).toBe(401);
  });

  it("Returns 401 when email is null", async () => {
    const newTeam = { ...validTeam, email: null };
    const response = await createTeam(newTeam);
    expect(response.status).toBe(401);
  });

  it("Returns 401 when password is null", async () => {
    const newTeam = { ...validTeam, password: null };
    const response = await createTeam(newTeam);
    expect(response.status).toBe(401);
  });

  const password_size = "Password must be at least 6 characters";
  const password_pattern =
    "Password have at least 1 uppercase, 1 lowercase and 1 letter";

  it.each`
    field         | value              | expectedMessage
    ${"password"} | ${"pass"}          | ${password_size}
    ${"password"} | ${"alllowercase"}  | ${password_pattern}
    ${"password"} | ${"alllowercase4"} | ${password_pattern}
    ${"password"} | ${"EEEEEEEEE5"}    | ${password_pattern}
  `(
    "returns $expectedMessage when $field is $value",
    async ({ field, expectedMessage, value }) => {
      const newTeam = {
        ...validTeam,
      };
      newTeam[field] = value;
      const response = await createTeam(newTeam);
      const body = response.body;
      expect(body.validationErrors[field]).toBe(expectedMessage);
    }
  );

  it("Returns 401 when password and passwordConfirm do not match", async () => {
    const newTeam = {
      ...validTeam,
      passwordConfirm: "ThispasswordDoesnt4Match",
    };
    const response = await createTeam(newTeam);
    expect(response.status).toBe(401);
  });

  it("Returns 401 when agreedTerms is false", async () => {
    const newTeam = {
      ...validTeam,
      agreedTerms: false,
    };
    const response = await createTeam(newTeam);
    expect(response.status).toBe(401);
  });

  it("Returns 401 error if the email is already in use", async () => {
    const user1 = {
      ...validTeam,
    };
    const user2 = {
      ...validTeam,
      teamName: "testTeam2",
    };
    await createTeam(user1);
    const response = await createTeam(user2);
    expect(response.status).toBe(401);
  });

  it("Returns validationErrors field in response body whe validation error occurs", async () => {
    const newTeam = { ...validTeam, teamName: null };
    const response = await createTeam(newTeam);
    expect(response.body.validationErrors).not.toBeUndefined();
  });

  it("Returns errors for teamName, email, password and passwordConfirm", async () => {
    const newTeam = {
      ...validTeam,
      teamName: null,
      email: null,
      password: null,
      passwordConfirm: "doesnot4match",
    };
    const response = await createTeam(newTeam);
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual([
      "teamName",
      "email",
      "password",
      "passwordConfirm",
    ]);
  });

  it("Returns message: Passwords do not match", async () => {
    const newTeam = {
      ...validTeam,
      passwordConfirm: "ThispasswordDoesnt4Match",
    };
    const response = await createTeam(newTeam);
    expect(response.body.validationErrors.passwordConfirm).toBe(
      "Passwords do not match"
    );
  });

  it("Returns message: You must provide a team name when the team name is not provided", async () => {
    const newTeam = { ...validTeam, teamName: null };
    const response = await createTeam(newTeam);
    expect(response.body.validationErrors.teamName).toBe(
      "You must provide a team name"
    );
  });

  it("Returns message: You need to agree to the terms to create an account", async () => {
    const newTeam = { ...validTeam, agreedTerms: false };
    const response = await createTeam(newTeam);
    expect(response.body.validationErrors.agreedTerms).toBe(
      "You need to agree to the terms to create an account"
    );
  });

  it("Returns message: A user with this email already exists", async () => {
    const user1 = {
      ...validTeam,
    };
    const user2 = {
      ...validTeam,
      teamName: "testTeam2",
    };

    await createTeam(user1);
    const response = await createTeam(user2);
    expect(response.body.validationErrors.email).toBe(
      "A user with this email already exists"
    );
  });

  it("Does not save the team when the team name is not provided", async () => {
    const newTeam = { ...validTeam, teamName: null };
    const response = await createTeam(newTeam);
    const team = await Team.find();
    expect(team.length).toBe(0);
  });

  it("Does not save the user when the team name is not provided", async () => {
    const newTeam = { ...validTeam, teamName: null };
    const response = await createTeam(newTeam);
    const user = await User.find();
    expect(user.length).toBe(0);
  });

  it("Does not save the team or user when agreedTerms is false", async () => {
    const newTeam = { ...validTeam, agreedTerms: false };
    const response = await createTeam(newTeam);
    const user = await User.find();
    const team = await Team.find();
    expect(user.length).toBe(0);
    expect(team.length).toBe(0);
  });

  it("Does not save the user if the email address is not unique", async () => {
    const user1 = {
      ...validTeam,
    };
    const user2 = {
      ...validTeam,
      teamName: "testTeam2",
    };

    await createTeam(user1);
    await createTeam(user2);
    const response = await User.find({ user2: user2.email });
    expect(response.length).toBe(0);
  });
});
