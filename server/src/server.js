const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const salesRoutes = require("./routes/salesRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const recommendationsRoutes = require("./routes/recommendationsRoutes");
const exportRoutes = require("./routes/exportRoutes");
const errorHandler = require("./middleware/errorHandler");

const { requireAuth } = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// ── Public ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/export", exportRoutes);

// ── Protected (all authenticated roles) ─────────────────────
app.use("/api/products", productRoutes);          // auth per-verb inside route
app.use("/api/customers", customerRoutes);        // auth per-verb inside route
app.use("/api/analytics", requireAuth, analyticsRoutes);
app.use("/api/sales", requireAuth, salesRoutes);
app.use("/api/orders", requireAuth, ordersRoutes);
app.use("/api/transactions", requireAuth, transactionRoutes);
app.use("/api/reports", requireAuth, reportsRoutes);
app.use("/api/predictions", requireAuth, predictionRoutes);

// Final catch-all for middleware and unexpected async errors.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});