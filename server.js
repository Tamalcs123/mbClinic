const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const dbConfig = require("./config/dbConfig");
const cors = require("cors");
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require("./routes/userRoute");
const adminRoutes = require("./routes/adminRoute");
const doctorRoutes = require("./routes/doctorRoute")

const port = process.env.PORT || 5000;

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
