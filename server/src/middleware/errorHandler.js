const errorHandler = (error, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, error);

  if (res.headersSent) return next(error);

  const isDevelopment = process.env.NODE_ENV !== "production";
  return res.status(error.statusCode || 500).json({
    status: "error",
    message: isDevelopment && error.expose ? error.message : "An unexpected server error occurred.",
  });
};

module.exports = errorHandler;
