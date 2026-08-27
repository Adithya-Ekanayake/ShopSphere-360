const pool = require("../config/db");
const { parsePagination, paginationMeta } = require("../utils/pagination");

// ==========================================
// GET ALL CUSTOMERS
// ==========================================

const getCustomers = async (req, res) => {
  try {
    const { page, limit, search } = parsePagination(req.query);
    const like = `%${search}%`;
    const searchClause = search ? "WHERE CustomerID LIKE ? OR FirstName LIKE ? OR LastName LIKE ? OR City LIKE ? OR Country LIKE ?" : "";
    const searchParams = search ? [like, like, like, like, like] : [];
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM dim_customer ${searchClause}`, searchParams);
    const [rows] = await pool.query(`
      SELECT
        CustomerKey,
        CustomerID,
        FirstName,
        LastName,
        Gender,
        Age,
        SignupDate,
        CustomerSegment,
        AcquisitionChannel,
        City,
        Country
      FROM dim_customer
      ${searchClause}
      ORDER BY CustomerKey DESC
      LIMIT ? OFFSET ?
    `, [...searchParams, limit, (page - 1) * limit]);

    res.json({
      status: "success",
      count: Number(countRow.total),
      data: rows,
      pagination: paginationMeta(page, limit, Number(countRow.total)),
    });
  } catch (error) {
    console.error(
      "Get customers error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch customers",
    });
  }
};

// ==========================================
// GET SINGLE CUSTOMER
// ==========================================

const getCustomerByKey = async (req, res) => {
  try {
    const { customerKey } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        CustomerKey,
        CustomerID,
        FirstName,
        LastName,
        Gender,
        Age,
        SignupDate,
        CustomerSegment,
        AcquisitionChannel,
        City,
        Country
      FROM dim_customer
      WHERE CustomerKey = ?
      `,
      [customerKey]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }

    res.json({
      status: "success",
      data: rows[0],
    });
  } catch (error) {
    console.error(
      "Get customer error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch customer",
    });
  }
};

// ==========================================
// CREATE CUSTOMER
// ==========================================

const createCustomer = async (req, res) => {
  try {
    const {
      CustomerID,
      FirstName,
      LastName,
      Gender,
      Age,
      SignupDate,
      CustomerSegment,
      AcquisitionChannel,
      City,
      Country,
    } = req.body;

    if (
      !CustomerID ||
      !FirstName ||
      !LastName ||
      !SignupDate
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "CustomerID, FirstName, LastName and SignupDate are required",
      });
    }

    if (
      Age !== "" &&
      Age != null &&
      (Number(Age) < 13 || Number(Age) > 100)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Age must be between 13 and 100",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO dim_customer
      (
        CustomerID,
        FirstName,
        LastName,
        Gender,
        Age,
        SignupDate,
        CustomerSegment,
        AcquisitionChannel,
        City,
        Country
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        CustomerID,
        FirstName,
        LastName,
        Gender || null,
        Age === "" || Age == null
          ? null
          : Age,
        SignupDate,
        CustomerSegment || null,
        AcquisitionChannel || null,
        City || null,
        Country || null,
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Customer created",
      data: {
        CustomerKey: result.insertId,
        CustomerID,
        FirstName,
        LastName,
      },
    });
  } catch (error) {
    console.error(
      "Create customer error:",
      error.message
    );

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message:
          "A customer with this CustomerID already exists",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to create customer",
    });
  }
};

// ==========================================
// UPDATE CUSTOMER
// ==========================================

const updateCustomer = async (req, res) => {
  try {
    const { customerKey } = req.params;

    const {
      FirstName,
      LastName,
      Gender,
      Age,
      SignupDate,
      CustomerSegment,
      AcquisitionChannel,
      City,
      Country,
    } = req.body;

    if (
      !FirstName ||
      !LastName ||
      !SignupDate
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "FirstName, LastName and SignupDate are required",
      });
    }

    if (
      Age !== "" &&
      Age != null &&
      (Number(Age) < 0 || Number(Age) > 120)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Age must be between 0 and 120",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE dim_customer
      SET
        FirstName = ?,
        LastName = ?,
        Gender = ?,
        Age = ?,
        SignupDate = ?,
        CustomerSegment = ?,
        AcquisitionChannel = ?,
        City = ?,
        Country = ?
      WHERE CustomerKey = ?
      `,
      [
        FirstName,
        LastName,
        Gender || null,
        Age === "" || Age == null
          ? null
          : Age,
        SignupDate,
        CustomerSegment || null,
        AcquisitionChannel || null,
        City || null,
        Country || null,
        customerKey,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }

    res.json({
      status: "success",
      message: "Customer updated",
    });
  } catch (error) {
    console.error(
      "Update customer error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message: "Failed to update customer",
    });
  }
};

// ==========================================
// DELETE CUSTOMER
// ==========================================

const deleteCustomer = async (req, res) => {
  try {
    const { customerKey } = req.params;

    const [result] = await pool.query(
      `
      DELETE FROM dim_customer
      WHERE CustomerKey = ?
      `,
      [customerKey]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }

    res.json({
      status: "success",
      message: "Customer deleted",
    });
  } catch (error) {
    console.error(
      "Delete customer error:",
      error.message
    );

    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        status: "error",
        message:
          "Cannot delete this customer because related records exist.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to delete customer",
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerByKey,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};