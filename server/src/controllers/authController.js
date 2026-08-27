const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/* ============================================================
   POST /api/auth/login
   Body: { identifier: string, password: string }
   identifier = Username or Email
   ============================================================ */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username / Email and password are required.",
      });
    }

    const id = identifier.trim();

    const [rows] = await pool.query(
      `SELECT UserKey, Username, Email, PasswordHash, Role, FullName, IsActive
       FROM users
       WHERE (Username = ? OR Email = ?) AND IsActive = TRUE
       LIMIT 1`,
      [id, id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
      });
    }

    const payload = {
      UserKey: user.UserKey,
      Username: user.Username,
      Role: user.Role,
      FullName: user.FullName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    });

    return res.json({
      status: "success",
      data: {
        token,
        user: {
          UserKey: user.UserKey,
          Username: user.Username,
          Email: user.Email,
          Role: user.Role,
          FullName: user.FullName,
        },
      },
    });
  } catch (err) {
    console.error("[authController.login]", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error during login.",
    });
  }
};

/* ============================================================
   GET /api/auth/me   (protected — requireAuth applied in route)
   ============================================================ */
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT UserKey, Username, Email, Role, FullName, CreatedAt
       FROM users
       WHERE UserKey = ? AND IsActive = TRUE
       LIMIT 1`,
      [req.user.UserKey]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found or account is inactive.",
      });
    }

    return res.json({ status: "success", data: rows[0] });
  } catch (err) {
    console.error("[authController.getMe]", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch user profile.",
    });
  }
};

module.exports = { login, getMe };
