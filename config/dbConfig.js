const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URL);

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("Successfully connected");
});

connection.on("error", (error) => {
  console.log("Connection error", error);
});

module.exports=mongoose
