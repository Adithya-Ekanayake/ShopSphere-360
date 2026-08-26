const pool = require("../config/db");

// ==========================================
// GET ALL PRODUCTS
// ==========================================

const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.ProductKey,
        p.ProductID,
        p.ProductName,
        p.Category,
        p.Subcategory,
        p.Brand,
        p.Supplier,
        p.UnitCost,
        p.UnitPrice,
        COALESCE(SUM(oi.Quantity), 0) AS UnitsSold,
        ROUND(COALESCE(SUM(oi.SalesAmount), 0), 2) AS TotalRevenue,
        ROUND(COALESCE(SUM(oi.ProfitAmount), 0), 2) AS TotalProfit,
        ROUND(
          CASE 
            WHEN p.UnitPrice > 0 THEN ((p.UnitPrice - p.UnitCost) / p.UnitPrice) * 100 
            ELSE 0 
          END, 2
        ) AS MarginPercent
      FROM dim_product p
      LEFT JOIN fact_order_items oi ON p.ProductKey = oi.ProductKey
      GROUP BY
        p.ProductKey,
        p.ProductID,
        p.ProductName,
        p.Category,
        p.Subcategory,
        p.Brand,
        p.Supplier,
        p.UnitCost,
        p.UnitPrice
      ORDER BY p.ProductKey DESC
    `);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch products",
    });
  }
};


// ==========================================
// GET SINGLE PRODUCT
// ==========================================

const getProductByKey = async (req, res) => {
  try {
    const { productKey } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        p.ProductKey,
        p.ProductID,
        p.ProductName,
        p.Category,
        p.Subcategory,
        p.Brand,
        p.Supplier,
        p.UnitCost,
        p.UnitPrice,
        COALESCE(SUM(oi.Quantity), 0) AS UnitsSold,
        ROUND(COALESCE(SUM(oi.SalesAmount), 0), 2) AS TotalRevenue,
        ROUND(COALESCE(SUM(oi.ProfitAmount), 0), 2) AS TotalProfit,
        ROUND(
          CASE 
            WHEN p.UnitPrice > 0 THEN ((p.UnitPrice - p.UnitCost) / p.UnitPrice) * 100 
            ELSE 0 
          END, 2
        ) AS MarginPercent
      FROM dim_product p
      LEFT JOIN fact_order_items oi ON p.ProductKey = oi.ProductKey
      WHERE p.ProductKey = ?
      GROUP BY
        p.ProductKey,
        p.ProductID,
        p.ProductName,
        p.Category,
        p.Subcategory,
        p.Brand,
        p.Supplier,
        p.UnitCost,
        p.UnitPrice
      `,
      [productKey]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.json({
      status: "success",
      data: rows[0],
    });
  } catch (error) {
    console.error(
      "Get product error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch product",
    });
  }
};


// ==========================================
// CREATE PRODUCT
// ==========================================

const createProduct = async (req, res) => {
  try {
    const {
      ProductID,
      ProductName,
      Category,
      Subcategory,
      Brand,
      Supplier,
      UnitCost,
      UnitPrice,
    } = req.body;

    if (
      !ProductID ||
      !ProductName ||
      !Category ||
      UnitCost == null ||
      UnitPrice == null
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "ProductID, ProductName, Category, UnitCost and UnitPrice are required",
      });
    }

    if (
      Number(UnitCost) < 0 ||
      Number(UnitPrice) < 0
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "UnitCost and UnitPrice must be non-negative",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO dim_product
      (
        ProductID,
        ProductName,
        Category,
        Subcategory,
        Brand,
        Supplier,
        UnitCost,
        UnitPrice
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ProductID.trim(),
        ProductName.trim(),
        Category.trim(),
        Subcategory?.trim() || null,
        Brand?.trim() || null,
        Supplier?.trim() || null,
        Number(UnitCost),
        Number(UnitPrice),
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Product created",
      data: {
        ProductKey: result.insertId,
        ProductID,
        ProductName,
      },
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error.message
    );

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message:
          "A product with this ProductID already exists",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to create product",
    });
  }
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

const updateProduct = async (req, res) => {
  try {
    const { productKey } = req.params;

    const {
      ProductName,
      Category,
      Subcategory,
      Brand,
      Supplier,
      UnitCost,
      UnitPrice,
    } = req.body;

    if (
      !ProductName ||
      !Category ||
      UnitCost == null ||
      UnitPrice == null
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "ProductName, Category, UnitCost and UnitPrice are required",
      });
    }

    if (
      Number(UnitCost) < 0 ||
      Number(UnitPrice) < 0
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "UnitCost and UnitPrice must be non-negative",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE dim_product
      SET
        ProductName = ?,
        Category = ?,
        Subcategory = ?,
        Brand = ?,
        Supplier = ?,
        UnitCost = ?,
        UnitPrice = ?
      WHERE ProductKey = ?
      `,
      [
        ProductName.trim(),
        Category.trim(),
        Subcategory?.trim() || null,
        Brand?.trim() || null,
        Supplier?.trim() || null,
        Number(UnitCost),
        Number(UnitPrice),
        productKey,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.json({
      status: "success",
      message: "Product updated",
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message: "Failed to update product",
    });
  }
};


// ==========================================
// DELETE PRODUCT
// ==========================================

const deleteProduct = async (req, res) => {
  try {
    const { productKey } = req.params;

    const [result] = await pool.query(
      `
      DELETE FROM dim_product
      WHERE ProductKey = ?
      `,
      [productKey]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.json({
      status: "success",
      message: "Product deleted",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error.message
    );

    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        status: "error",
        message:
          "Cannot delete this product because it has related orders, returns or reviews.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to delete product",
    });
  }
};


module.exports = {
  getProducts,
  getProductByKey,
  createProduct,
  updateProduct,
  deleteProduct,
};