const mongoose = require("mongoose");
const { Schema } = mongoose;

const teamSchema = new Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
