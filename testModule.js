const dotenv = require("dotenv");

dotenv.config({ path: "./config/test.env" });

const request = require("supertest");
const app = require("./app");

global.registerTeamTestUtil = (team) => {
  return request(app).post("/auth/register").send(team);
};

global.getTeamByIdTestUtil = (id, token) => {
  return request(app)
    .get(`/auth/get-team/${id}`)
    .set("Authorization", `Bearer ${token}`);
};

global.addNewUserTestUtil = (newUser, token) => {
  return request(app)
    .post("/auth/add-user")
    .send(newUser)
    .set("Authorization", `Bearer ${token}`);
};
