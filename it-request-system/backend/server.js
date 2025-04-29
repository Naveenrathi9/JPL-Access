const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./.env" });
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

connectDB();

const requestRoutes = require("./routes/requestRoutes");
app.use("/api", requestRoutes);


app.get("/", (req, res) => {
  console.log("Health check hit");
  res.json({ message: "server is running.." });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
