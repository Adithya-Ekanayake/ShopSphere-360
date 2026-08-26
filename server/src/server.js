const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const salesRoutes = require("./routes/salesRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const reportsRoutes = require("./routes/reportsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/orders", ordersRoutes);
app.use(
  "/api/transactions",
  transactionRoutes
);
app.use(
  "/api/reports",
  reportsRoutes
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});