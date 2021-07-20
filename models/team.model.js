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

// teamSchema.pre(
//   "findByIdAndRemove",
//   { document: false, query: true },
//   function (next) {
//     this.model("User").remove({ user: this._id }, next);
//     next();

//     console.log("Removing doc!");
//   }
// );

teamSchema.pre("deleteOne", function (next) {
  // console.log(this);
  const teamId = this.getQuery()["_id"];
  mongoose.model("User").deleteMany({ team: teamId }, function (err, result) {
    if (err) {
      console.log(`[error] ${err}`);
      next(err);
    } else {
      console.log("success");
      next();
    }
  });
});
const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
