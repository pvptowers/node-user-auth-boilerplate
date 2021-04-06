//THIRD PARTY LIBRARIES
const mongoose = require("mongoose");
const createServer = require("../createServer");
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    // const app = createServer();
    // app.listen(5000, () => {
    //   console.log("Server has started!");
    // });
    console.log(
      `MongoDB Connected: ${conn.connection.host} ${process.env.MONGO_URI}`
    );
  } catch (err) {
    console.error(err.message);
    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
