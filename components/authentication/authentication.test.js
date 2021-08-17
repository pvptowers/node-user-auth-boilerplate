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

const validUser = {
  email: "test@test.com",
  password: "P4ssword",
};

// const addNewUser = (newUser) => {
//   return request(app).post("/auth/add-user").send(newUser);
// };

describe("AUTH ROUTE - POST /auth/register", () => {
  describe("Account creation succeeds", () => {
    it("Returns 200 status code when account creation process is successful", async () => {
      const response = await registerTeamTestUtil(validTeam);
      expect(response.status).toBe(200);
    });

    it("Returns success message when account creation process is successful", async () => {
      const response = await registerTeamTestUtil(validTeam);
      expect(response.body.message).toBe("Account created successfully");
    });

    it("Saves the team to the database", async () => {
      await registerTeamTestUtil(validTeam);
      const team = await Team.find();
      expect(team.length).toBe(1);
    });

    it("Saves the team name to the database", async () => {
      await registerTeamTestUtil(validTeam);
      const teamList = await Team.find();
      const savedTeam = teamList[0];
      expect(savedTeam.teamName).toBe(validTeam.teamName);
    });

    it("Saves the root user to the database", async () => {
      await registerTeamTestUtil(validTeam);
      const teamList = await Team.find();
      const savedUser = await teamList[0].users[0];
      const findUser = await User.find(savedUser);
      expect(findUser.length).toBe(1);
    });

    it("Saves the users email and team in the database", async () => {
      await registerTeamTestUtil(validTeam);
      const teamList = await Team.find();
      const savedUser = await teamList[0].users[0];
      const findUser = await User.find(savedUser);
      expect(findUser[0].email).toBe(validTeam.email);
      expect(findUser[0].team[0]).toBe(validTeam._id);
    });

    it("Returns user token in response body when account creation is successful", async () => {
      const response = await registerTeamTestUtil(validTeam);
      expect(response.body.token).toBeTruthy();
    });
  });

  describe("Account Creation Fails - Missing Inputs", () => {
    it("Returns 401 when teamname is null", async () => {
      const newTeam = { ...validTeam, teamName: null };
      const response = await registerTeamTestUtil(newTeam);
      expect(response.status).toBe(401);
    });

    it("Returns 401 when email is null", async () => {
      const newTeam = { ...validTeam, email: null };
      const response = await registerTeamTestUtil(newTeam);
      expect(response.status).toBe(401);
    });

    it("Returns 401 when password is null", async () => {
      const newTeam = { ...validTeam, password: null };
      const response = await registerTeamTestUtil(newTeam);
      expect(response.status).toBe(401);
    });

    it("Returns 401 when agreedTerms is false", async () => {
      const newTeam = {
        ...validTeam,
        agreedTerms: false,
      };
      const response = await registerTeamTestUtil(newTeam);
      expect(response.status).toBe(401);
    });

    it("Ensures the user has agreed terms before saving team and user to database", async () => {
      await registerTeamTestUtil(validTeam);
      const teamList = await Team.find();
      const savedUser = await teamList[0].users[0];
      const findUser = await User.find(savedUser);
      expect(findUser[0].agreedTerms).toBe(true);
      expect(findUser[0].team[0]).toBe(validTeam._id);
    });

    it("Returns message: You need to agree to the terms to create an account", async () => {
      const newTeam = {
        ...validTeam,
        agreedTerms: false,
      };
      const response = await registerTeamTestUtil(newTeam);
      expect(response.body).toMatchObject({
        error: {
          errors: [
            {
              msg: "You need to agree to the terms to create an account",
            },
          ],
        },
      });
    });

    it("Returns message: You must provide a team name when the team name is not provided", async () => {
      const newTeam = { ...validTeam, teamName: null };
      const response = await registerTeamTestUtil(newTeam);
      expect(response.body).toMatchObject({
        error: {
          errors: [
            {
              msg: "You must provide a team name",
            },
          ],
        },
      });
    });

    it("Returns message: You need to agree to the terms to create an account", async () => {
      const newTeam = { ...validTeam, agreedTerms: false };
      const response = await registerTeamTestUtil(newTeam);
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

      await registerTeamTestUtil(user1);
      const response = await registerTeamTestUtil(user2);
      expect(response.body.validationErrors.email).toBe(
        "A user with this email already exists"
      );
    });
  });

  describe("Account Creation Fails - Password Validation", () => {
    it("Hashes the users password in the database", async () => {
      await registerTeamTestUtil(validTeam);
      const teamList = await Team.find();
      const savedUser = await teamList[0].users[0];
      const findUser = await User.find(savedUser).select("+password");
      const userPassword = findUser[0].password;
      expect(userPassword).not.toBe(undefined);
      expect(userPassword).not.toBe(validTeam.password);
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
        const response = await registerTeamTestUtil(newTeam);
        const body = response.body;

        expect(body.validationErrors[field]).toBe(expectedMessage);
      }
    );

    it("Returns 401 when password and passwordConfirm do not match", async () => {
      const newTeam = {
        ...validTeam,
        passwordConfirm: "ThispasswordDoesnt4Match",
      };
      const response = await registerTeamTestUtil(newTeam);
      expect(response.status).toBe(401);
    });

    it("Returns message: Passwords do not match", async () => {
      const newTeam = {
        ...validTeam,
        passwordConfirm: "ThispasswordDoesnt4Match",
      };
      const response = await registerTeamTestUtil(newTeam);
      expect(response.body.validationErrors.passwordConfirm).toBe(
        "Passwords do not match"
      );
    });

    it("Returns validationErrors field in response body whe validation error occurs", async () => {
      const newTeam = { ...validTeam, teamName: null };
      const response = await registerTeamTestUtil(newTeam);
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
      const response = await registerTeamTestUtil(newTeam);
      const body = response.body;
      expect(Object.keys(body.validationErrors)).toEqual([
        "teamName",
        "email",
        "password",
        "passwordConfirm",
      ]);
    });
  });

  describe("Account Creation Fails - Confirm Team / User Not Saved", () => {
    it("Does not save the team when the team name is not provided", async () => {
      const newTeam = { ...validTeam, teamName: null };
      await registerTeamTestUtil(newTeam);
      const team = await Team.find();
      expect(team.length).toBe(0);
    });

    it("Does not save the user when the team name is not provided", async () => {
      const newTeam = { ...validTeam, teamName: null };
      await registerTeamTestUtil(newTeam);
      const user = await User.find();
      expect(user.length).toBe(0);
    });

    it("Does not save the team or user when agreedTerms is false", async () => {
      const newTeam = { ...validTeam, agreedTerms: false };
      await registerTeamTestUtil(newTeam);
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

      await registerTeamTestUtil(user1);
      await registerTeamTestUtil(user2);
      const response = await User.find({ user2: user2.email });
      expect(response.length).toBe(0);
    });
  });
});

describe("AUTH ROUTE - POST /auth/login", () => {
  describe("User Login Succeeds", () => {
    it("Returns 200 status code when user logs in successfully", async () => {
      await registerTeamTestUtil(validTeam);
      const response = await loginUserTestUtil(validUser);
      expect(response.status).toBe(200);
    });

    it("Returns user data in response body when login is successful", async () => {
      await registerTeamTestUtil(validTeam);
      const response = await loginUserTestUtil(validUser);
      expect(response.body.data.email).toBe(validTeam.email);
    });

    it("Returns user token in response body when login is successful", async () => {
      await registerTeamTestUtil(validTeam);
      const response = await loginUserTestUtil(validUser);
      expect(response.body.token).toBeTruthy();
    });
  });

  describe("User Login Fails - Missing Inputs", () => {
    it("Returns 401 status code if user email is null", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = { ...validUser, email: null };
      const response = await loginUserTestUtil(invalidUser);
      expect(response.status).toBe(401);
    });
    it("Returns 401 status code if user email is undefined", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = { ...validUser, email: undefined };
      const response = await loginUserTestUtil(invalidUser);
      expect(response.status).toBe(401);
    });

    it("Returns 401 status code if user email password is null", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = { ...validUser, password: null };
      const response = await loginUserTestUtil(invalidUser);
      expect(response.status).toBe(401);
    });

    it("Returns 401 status code if user email password is undefined", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = { ...validUser, password: undefined };
      const response = await loginUserTestUtil(invalidUser);
      expect(response.status).toBe(401);
    });

    it("Returns 401 if no email or password", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = {};
      const response = await loginUserTestUtil(invalidUser);
      expect(response.status).toBe(401);
    });
  });

  describe("User Login Fails - Invalid Data", () => {
    it("Returns 401 status code if user email is invalid", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = { ...validUser, email: "invalid@test.com" };
      const response = await loginUserTestUtil(invalidUser);
      expect(response.status).toBe(401);
    });

    it("Returns 401 status code if user email password is incorrect", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = { ...validUser, password: "invalid" };
      const response = await loginUserTestUtil(invalidUser);
      expect(response.status).toBe(401);
    });

    it("Returns message: Please enter valid email and password if no email and password provided", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = {};
      const response = await loginUserTestUtil(invalidUser);
      // expect(response.body.validationErrors.email).toBe(
      //   "Please enter valid email and password"
      // );

      expect(response.body.message).toBe(
        "Please enter valid email and password"
      );
      // expect(response.body).toMatchObject({
      //   error: {
      //     errors: [
      //       {
      //         msg: "Please enter valid email and password",
      //       },
      //     ],
      //     isOperations: true,
      //     statusCode: 401,
      //     statusState: "fail",
      //   },
      // });
    });

    it("Returns message: Please enter valid email and password if email is incorrect", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = { ...validUser, email: "invalid@test.com" };
      const response = await loginUserTestUtil(invalidUser);
      expect(response.body.message).toBe(
        "Please enter valid email and password"
      );
    });

    it("Returns message: Please enter valid email and password if password is incorrect", async () => {
      await registerTeamTestUtil(validTeam);
      const invalidUser = { ...validUser, password: "incorrect" };
      const response = await loginUserTestUtil(invalidUser);
      expect(response.body.message).toBe(
        "Please enter valid email and password"
      );
    });
  });
});

describe("AUTH ROUTE - GET /auth/logout", () => {
  describe("User Logout Succeeds", () => {
    it("Returns 200 status code when user logs out successfully", async () => {
      await registerTeamTestUtil(validTeam);
      await loginUserTestUtil(validUser);
      const response = await logoutUserTestUtil();
      expect(response.status).toBe(200);
    });

    it("Returns no data when user logs out successfully", async () => {
      await registerTeamTestUtil(validTeam);
      await loginUserTestUtil(validUser);
      const response = await logoutUserTestUtil();
      const expectedRes = {
        success: true,
        data: {},
      };
      expect(response.body).toMatchObject(expectedRes);
    });

    it("Does not return token after user is logged out", async () => {
      await registerTeamTestUtil(validTeam);
      await loginUserTestUtil(validUser);
      const response = await logoutUserTestUtil();
      expect(response.body.token).toBeFalsy();
    });
  });
});
