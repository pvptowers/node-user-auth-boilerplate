const Team = require("./models/team.model");
const User = require("./models/user.model");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/test.env" });

const request = require("supertest");
const app = require("./app");

//REGISTER TEAM / USERS TEST UTILS
global.registerTeamTestUtil = (team) => {
  return request(app).post("/auth/register").send(team);
};

global.addNewUserTestUtil = (newUser, token) => {
  return request(app)
    .post("/auth/add-user")
    .send(newUser)
    .set("Authorization", `Bearer ${token}`);
};

//LOGIN / LOGOUT TEST UTILS
global.loginUserTestUtil = (user) => {
  return request(app).post("/auth/login").send(user);
};

global.logoutUserTestUtil = () => {
  return request(app).get("/auth/logout");
};

//GET BY TEST UTILS
global.getTeamByIdTestUtil = (id, token) => {
  return request(app)
    .get(`/auth/get-team/${id}`)
    .set("Authorization", `Bearer ${token}`);
};

global.getHashedPasswordTestUtil = async () => {
  const team = await Team.find();
  const user = await team[0].users[0];
  const userData = await User.findOne(user).select("+password");
  return userData.password;
};

global.deleteTeamTestUtil = (id, token) => {
  return request(app)
    .delete(`/auth/delete-team/${id}`)
    .set("Authorization", `Bearer ${token}`);
};

global.updateTeamTestUtil = (updatedTeamDetails, teamId, token) => {
  return request(app)
    .put(`/auth/update-team/${teamId}`)
    .send(updatedTeamDetails)
    .set("Authorization", `Bearer ${token}`);
};

//RESET PASSWORD UTILS

global.forgotPasswordTestUtil = (email) => {
  return request(app).post("/auth/forgotpassword").send({ email });
};

global.createResetTokenTestUtil = async (email) => {
  const user = await User.findOne({ email });
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  return resetToken;
};

global.resetPasswordTestUtil = (resetToken) => {
  const newPassword = "123456Abc";
  const newPasswordConfirm = "123456Abc";
  return request(app)
    .patch(`/auth/resetPassword/${resetToken}`)
    .send({ password: newPassword, passwordConfirm: newPasswordConfirm });
};

global.incorrectPasswordTestUtil = (resetToken) => {
  const newPassword = "pass";
  const newPasswordConfirm = "pass";
  return request(app)
    .patch(`/auth/resetPassword/${resetToken}`)
    .send({ password: newPassword, passwordConfirm: newPasswordConfirm });
};
