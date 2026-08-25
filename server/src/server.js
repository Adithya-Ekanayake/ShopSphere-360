const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "ShopSphere360 API is running 🚀",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT 1 AS database_connected"
    );

    res.json({
      status: "success",
      message: "ShopSphere360 API and MySQL are connected 🚀",
      database: rows[0].database_connected === 1,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ShopSphere360 API running on port ${PORT}`);
});