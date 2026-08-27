const jwt = require("jsonwebtoken");

/* ============================================================
   requireAuth
   Verifies Authorization: Bearer <token> header.
   Attaches decoded payload to req.user on success.
   Returns 401 if the token is missing, malformed, or expired.
   ============================================================ */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required. Please log in.",
    });
  }

  const token = authHeader.slice(7); // Strip "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { UserKey, Username, Role, FullName, iat, exp }
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Session expired. Please log in again.",
      });
    }
    return res.status(401).json({
      status: "error",
      message: "Invalid token. Please log in again.",
    });
  }
};

/* ============================================================
   requireRole(...allowedRoles)
   Factory that returns a middleware checking req.user.Role.
   Must be used AFTER requireAuth.
   Returns 403 if the user's role is not in allowedRoles.

   Usage:
     router.post("/", requireAuth, requireRole("Admin","Manager"), handler);
   ============================================================ */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.Role)) {
      return res.status(403).json({
        status: "error",
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}.`,
      });
    }
    return next();
  };
};

module.exports = { requireAuth, requireRole };
