const dotenv = require("dotenv");

dotenv.config({ path: "./config/test.env" });

const request = require("supertest");
const app = require("./app");

global.createTeamTest = (team) => {
  return request(app).post("/auth/register").send(team);
};
