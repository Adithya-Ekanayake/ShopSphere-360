const pool = require("../config/db");
const { parsePagination, paginationMeta } = require("../utils/pagination");

// ==========================================
// GET ORDER KPIs
// ==========================================

const getOrderKPIs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS TotalOrders,

        SUM(
          CASE
            WHEN OrderStatus = 'Completed'
            THEN 1
            ELSE 0
          END
        ) AS CompletedOrders,

        SUM(
          CASE
            WHEN OrderStatus IN ('Processing', 'Shipped')
            THEN 1
            ELSE 0
          END
        ) AS PendingOrders,

        SUM(
          CASE
            WHEN OrderStatus = 'Cancelled'
            THEN 1
            ELSE 0
          END
        ) AS CancelledOrders

      FROM fact_orders
    `);

    res.json({
      status: "success",
      data: {
        TotalOrders: Number(rows[0].TotalOrders || 0),
        CompletedOrders: Number(rows[0].CompletedOrders || 0),
        PendingOrders: Number(rows[0].PendingOrders || 0),
        CancelledOrders: Number(rows[0].CancelledOrders || 0),
      },
    });
  } catch (error) {
    console.error("Order KPI error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch order KPIs",
    });
  }
};


// ==========================================
// GET ALL ORDERS
// ==========================================

const getOrders = async (req, res) => {
  try {
    const { page, limit, search } = parsePagination(req.query);
    const like = `%${search}%`;
    const searchClause = search ? "WHERE fo.OrderID LIKE ? OR c.CustomerID LIKE ? OR c.FirstName LIKE ? OR c.LastName LIKE ? OR fo.OrderStatus LIKE ?" : "";
    const searchParams = search ? [like, like, like, like, like] : [];
    const [[countRow]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM fact_orders fo
      INNER JOIN dim_customer c ON fo.CustomerKey = c.CustomerKey
      ${searchClause}
    `, searchParams);
    const [rows] = await pool.query(`
      SELECT
        fo.OrderKey,
        fo.OrderID,

        CONCAT(
          c.FirstName,
          ' ',
          c.LastName
        ) AS CustomerName,

        c.CustomerID,
        c.City AS CustomerCity,
        c.Country AS CustomerCountry,

        dd.FullDate AS OrderDate,

        dc.ChannelName,

        dl.City,
        dl.Region,
        dl.Country,

        fo.OrderStatus,
        fo.PaymentStatus,
        fo.ShippingStatus,

        fo.OrderTotal,
        fo.DiscountAmount,
        fo.TaxAmount,
        fo.ShippingAmount

      FROM fact_orders fo

      INNER JOIN dim_customer c
        ON fo.CustomerKey = c.CustomerKey

      INNER JOIN dim_date dd
        ON fo.DateKey = dd.DateKey

      INNER JOIN dim_channel dc
        ON fo.ChannelKey = dc.ChannelKey

      INNER JOIN dim_location dl
        ON fo.LocationKey = dl.LocationKey

      ${searchClause}
      ORDER BY
        fo.OrderKey DESC
      LIMIT ? OFFSET ?
    `, [...searchParams, limit, (page - 1) * limit]);

    res.json({
      status: "success",
      count: Number(countRow.total),
      data: rows,
      pagination: paginationMeta(page, limit, Number(countRow.total)),
    });
  } catch (error) {
    console.error("Get orders error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
    });
  }
};


// ==========================================
// GET SINGLE ORDER
// ==========================================

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      `
      SELECT
        fo.OrderKey,
        fo.OrderID,

        CONCAT(
          c.FirstName,
          ' ',
          c.LastName
        ) AS CustomerName,

        c.CustomerID,
        c.Gender,
        c.Age,
        c.City AS CustomerCity,
        c.Country AS CustomerCountry,

        dd.FullDate AS OrderDate,

        dc.ChannelName,
        dc.ChannelType,
        dc.Platform,

        dl.City,
        dl.Region,
        dl.Country,

        fo.OrderStatus,
        fo.PaymentStatus,
        fo.ShippingStatus,

        fo.OrderTotal,
        fo.DiscountAmount,
        fo.TaxAmount,
        fo.ShippingAmount

      FROM fact_orders fo

      INNER JOIN dim_customer c
        ON fo.CustomerKey = c.CustomerKey

      INNER JOIN dim_date dd
        ON fo.DateKey = dd.DateKey

      INNER JOIN dim_channel dc
        ON fo.ChannelKey = dc.ChannelKey

      INNER JOIN dim_location dl
        ON fo.LocationKey = dl.LocationKey

      WHERE fo.OrderKey = ?
         OR fo.OrderID = ?

      LIMIT 1
      `,
      [id, id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    const order = orders[0];

    // ==========================================
    // ORDER ITEMS
    // ==========================================

    const [items] = await pool.query(
      `
      SELECT
        foi.OrderItemKey,

        dp.ProductKey,
        dp.ProductID,
        dp.ProductName,

        foi.Quantity,
        foi.UnitPrice,
        foi.DiscountAmount,
        foi.SalesAmount,
        foi.CostAmount,
        foi.ProfitAmount

      FROM fact_order_items foi

      INNER JOIN dim_product dp
        ON foi.ProductKey = dp.ProductKey

      WHERE foi.OrderKey = ?

      ORDER BY foi.OrderItemKey
      `,
      [order.OrderKey]
    );

    // ==========================================
    // PAYMENT
    // ==========================================

    const [payments] = await pool.query(
      `
      SELECT
        PaymentKey,
        PaymentMethod,
        PaymentAmount,
        PaymentStatus,
        TransactionFee

      FROM fact_payments

      WHERE OrderKey = ?

      ORDER BY PaymentKey DESC
      `,
      [order.OrderKey]
    );

    res.json({
      status: "success",

      data: {
        ...order,

        items,
        payments,
      },
    });
  } catch (error) {
    console.error(
      "Get order by ID error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch order",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getOrderKPIs,
  getOrders,
  getOrderById,
};