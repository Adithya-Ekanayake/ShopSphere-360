const { body, param, query, validationResult } = require("express-validator");

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: errors.array().map((error) => `${error.path}: ${error.msg}`).join("; "),
      });
    }
    return next();
  },
];

const requiredText = (field, max = 255) => body(field).isString().trim().notEmpty().isLength({ max });
const optionalText = (field, max = 255) => body(field).optional({ values: "falsy" }).isString().trim().isLength({ max });
const positiveParam = (field) => param(field).isInt({ min: 1 }).toInt();

const loginValidation = validate([
  body("identifier").isString().trim().notEmpty().isLength({ max: 100 }),
  body("password").isString().notEmpty().isLength({ min: 8, max: 255 }),
]);

const productValidation = (isUpdate = false) => validate([
  ...(isUpdate ? [] : [requiredText("ProductID", 20)]),
  requiredText("ProductName", 150),
  requiredText("Category", 100),
  optionalText("Subcategory", 100),
  optionalText("Brand", 100),
  optionalText("Supplier", 100),
  body("UnitCost").isFloat({ min: 0 }).toFloat(),
  body("UnitPrice").isFloat({ min: 0 }).toFloat(),
]);

const customerValidation = (isUpdate = false) => validate([
  ...(isUpdate ? [] : [requiredText("CustomerID", 20)]),
  requiredText("FirstName", 50),
  requiredText("LastName", 50),
  optionalText("Gender", 20),
  body("Age").optional({ values: "falsy" }).isInt({ min: 13, max: 100 }).toInt(),
  body("SignupDate").isISO8601().toDate(),
  optionalText("CustomerSegment", 50),
  optionalText("AcquisitionChannel", 50),
  optionalText("City", 100),
  requiredText("Country", 100),
]);

const filterValidation = validate([
  query().custom((_, { req }) => {
    const allowed = new Set(["startDate", "endDate", "productKey", "channelKey", "locationKey", "segment", "status", "page", "limit", "search"]);
    const unknown = Object.keys(req.query).find((key) => !allowed.has(key));
    if (unknown) throw new Error(`unknown query parameter '${unknown}'`);
    return true;
  }),
  query("startDate").optional().isISO8601().withMessage("must be YYYY-MM-DD"),
  query("endDate").optional().isISO8601().withMessage("must be YYYY-MM-DD"),
  query("productKey").optional().isInt({ min: 1 }).toInt(),
  query("channelKey").optional().isInt({ min: 1 }).toInt(),
  query("locationKey").optional().isInt({ min: 1 }).toInt(),
  query("segment").optional().isIn(["Premium", "Regular", "Occasional", "New"]),
  query("status").optional().isIn(["Cancelled", "Closed", "Completed", "In Progress", "Open", "Pending", "Processing", "Resolved", "Returned", "Shipped"]),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search").optional().isString().trim().isLength({ max: 100 }),
  query().custom((_, { req }) => {
    if (req.query.startDate && req.query.endDate && req.query.startDate > req.query.endDate) {
      throw new Error("startDate must be on or before endDate");
    }
    return true;
  }),
]);

const reportValidation = validate([
  query().custom((_, { req }) => {
    const allowed = new Set(["startDate", "endDate"]);
    const unknown = Object.keys(req.query).find((key) => !allowed.has(key));
    if (unknown) throw new Error(`unknown query parameter '${unknown}'`);
    return true;
  }),
  query("startDate").optional().isISO8601().withMessage("must be YYYY-MM-DD"),
  query("endDate").optional().isISO8601().withMessage("must be YYYY-MM-DD"),
  query().custom((_, { req }) => {
    const hasStart = Boolean(req.query.startDate);
    const hasEnd = Boolean(req.query.endDate);
    if (hasStart !== hasEnd) throw new Error("startDate and endDate must be provided together");
    if (hasStart && req.query.startDate > req.query.endDate) {
      throw new Error("startDate must be on or before endDate");
    }
    return true;
  }),
]);

const predictionValidation = validate([
  query().custom((_, { req }) => {
    const allowed = new Set(["horizon", "limit"]);
    const unknown = Object.keys(req.query).find((key) => !allowed.has(key));
    if (unknown) throw new Error(`unknown query parameter '${unknown}'`);
    return true;
  }),
  query("horizon").optional().isInt({ min: 1, max: 24 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
]);

const exportValidation = validate([
  query().custom((_, { req }) => {
    const allowed = new Set(["dataset", "reportType", "startDate", "endDate", "productKey", "channelKey", "locationKey", "segment", "status"]);
    const unknown = Object.keys(req.query).find((key) => !allowed.has(key));
    if (unknown) throw new Error(`unknown query parameter '${unknown}'`);
    return true;
  }),
  query("dataset").optional().isIn(["sales", "customers", "products", "returns", "top-products", "rfm", "clv", "product-profitability"]),
  query("reportType").optional().isIn(["sales-summary", "customer-summary", "marketing-summary", "order-summary", "product-performance", "profitability-summary"]),
  query("startDate").optional().isISO8601().withMessage("must be YYYY-MM-DD"),
  query("endDate").optional().isISO8601().withMessage("must be YYYY-MM-DD"),
  query("productKey").optional().isInt({ min: 1 }).toInt(),
  query("channelKey").optional().isInt({ min: 1 }).toInt(),
  query("locationKey").optional().isInt({ min: 1 }).toInt(),
  query("segment").optional().isIn(["Premium", "Regular", "Occasional", "New"]),
  query("status").optional().isIn(["Cancelled", "Closed", "Completed", "In Progress", "Open", "Pending", "Processing", "Resolved", "Returned", "Shipped"]),
  query().custom((_, { req }) => {
    if (Boolean(req.query.startDate) !== Boolean(req.query.endDate)) {
      throw new Error("startDate and endDate must be provided together");
    }
    if (req.query.startDate && req.query.startDate > req.query.endDate) {
      throw new Error("startDate must be on or before endDate");
    }
    return true;
  }),
]);

const recommendationListValidation = validate([
  query().custom((_, { req }) => {
    const allowed = new Set(["status", "priority", "category", "page", "limit", "search"]);
    const unknown = Object.keys(req.query).find((key) => !allowed.has(key));
    if (unknown) throw new Error(`unknown query parameter '${unknown}'`);
    return true;
  }),
  query("status").optional().isIn(["New", "InProgress", "Done", "Dismissed"]),
  query("priority").optional().isIn(["Low", "Medium", "High"]),
  query("category").optional().isString().trim().isLength({ max: 50 }),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search").optional().isString().trim().isLength({ max: 100 }),
]);

const recommendationUpdateValidation = validate([
  positiveParam("recommendationKey"),
  body().custom((value) => {
    const allowed = new Set(["status", "assignedToUserKey"]);
    const unknown = Object.keys(value).find((key) => !allowed.has(key));
    if (unknown) throw new Error(`unknown body field '${unknown}'`);
    return true;
  }),
  body("status").optional().isIn(["New", "InProgress", "Done", "Dismissed"]),
  body("assignedToUserKey").optional({ nullable: true }).isInt({ min: 1 }).toInt(),
]);

module.exports = {
  validate,
  loginValidation,
  productValidation,
  customerValidation,
  positiveParam,
  filterValidation,
  reportValidation,
  predictionValidation,
  exportValidation,
  recommendationListValidation,
  recommendationUpdateValidation,
};
