const pool = require("../config/db");
const { evaluateInsights } = require("../insights/engine");
const { parsePagination, paginationMeta } = require("../utils/pagination");

const priorityForSeverity = {
  info: "Low",
  warning: "Medium",
  critical: "High",
};

const OPEN_STATUSES = ["New", "InProgress"];
const STATUSES = ["New", "InProgress", "Done", "Dismissed"];
const PRIORITIES = ["Low", "Medium", "High"];

const getRecommendations = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const { page, limit, search } = parsePagination(req.query);
    const conditions = [];
    const params = [];

    if (status) {
      if (!STATUSES.includes(status)) return res.status(400).json({ status: "error", message: "Invalid recommendation status." });
      conditions.push("r.Status = ?");
      params.push(status);
    }
    if (category) {
      conditions.push("r.Category = ?");
      params.push(category);
    }
    if (priority) {
      if (!PRIORITIES.includes(priority)) return res.status(400).json({ status: "error", message: "Invalid recommendation priority." });
      conditions.push("r.Priority = ?");
      params.push(priority);
    }
    if (search) {
      conditions.push("(r.Title LIKE ? OR r.Finding LIKE ? OR r.RecommendationText LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM recommendations r ${where}`, params);

    const [rows] = await pool.query(`
      SELECT r.*, u.Username AS AssignedToUsername, u.FullName AS AssignedToName
      FROM recommendations r
      LEFT JOIN users u ON r.AssignedToUserKey = u.UserKey
      ${where}
      ORDER BY FIELD(r.Priority, 'High', 'Medium', 'Low'), r.UpdatedAt DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, (page - 1) * limit]);

    return res.json({ status: "success", count: Number(countRow.total), data: rows, pagination: paginationMeta(page, limit, Number(countRow.total)) });
  } catch (error) {
    console.error("Get recommendations error:", error.message);
    return res.status(500).json({ status: "error", message: "Failed to fetch recommendations" });
  }
};

const syncRecommendations = async (req, res) => {
  try {
    const insights = await evaluateInsights(req.query);
    const [openRows] = await pool.query(
      "SELECT InsightId FROM recommendations WHERE Status IN (?, ?)",
      OPEN_STATUSES
    );
    const openInsightIds = new Set(openRows.map((row) => row.InsightId));
    let created = 0;

    for (const insight of insights) {
      if (openInsightIds.has(insight.id)) continue;
      await pool.query(`
        INSERT INTO recommendations
          (InsightId, Category, Title, Finding, Implication, RecommendationText, Priority)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        insight.id,
        insight.category,
        insight.title,
        insight.finding,
        insight.implication,
        insight.recommendation,
        priorityForSeverity[insight.severity],
      ]);
      created += 1;
    }

    return res.json({
      status: "success",
      message: `Recommendation sync complete. ${created} new recommendation(s) created.`,
      count: created,
      data: { created, triggered: insights.length },
    });
  } catch (error) {
    if (error.message?.startsWith("Invalid")) return res.status(400).json({ status: "error", message: error.message });
    console.error("Sync recommendations error:", error.message);
    return res.status(500).json({ status: "error", message: "Failed to sync recommendations" });
  }
};

const updateRecommendationStatus = async (req, res) => {
  try {
    const { status, assignedToUserKey } = req.body;
    if (status !== undefined && !STATUSES.includes(status)) {
      return res.status(400).json({ status: "error", message: "Invalid recommendation status." });
    }
    if (assignedToUserKey !== undefined && assignedToUserKey !== null && (!Number.isInteger(Number(assignedToUserKey)) || Number(assignedToUserKey) < 1)) {
      return res.status(400).json({ status: "error", message: "Invalid assignee." });
    }
    if (status === undefined && assignedToUserKey === undefined) {
      return res.status(400).json({ status: "error", message: "Status or assignee is required." });
    }

    const updates = [];
    const params = [];
    if (status !== undefined) {
      updates.push("Status = ?");
      params.push(status);
      updates.push("ResolvedAt = ?");
      params.push(["Done", "Dismissed"].includes(status) ? new Date() : null);
    }
    if (assignedToUserKey !== undefined) {
      updates.push("AssignedToUserKey = ?");
      params.push(assignedToUserKey === null ? null : Number(assignedToUserKey));
    }
    updates.push("UpdatedByUserKey = ?");
    params.push(req.user.UserKey);
    updates.push("UpdatedAt = CURRENT_TIMESTAMP");
    params.push(req.params.recommendationKey);

    const [result] = await pool.query(
      `UPDATE recommendations SET ${updates.join(", ")} WHERE RecommendationKey = ?`,
      params
    );
    if (result.affectedRows === 0) return res.status(404).json({ status: "error", message: "Recommendation not found" });

    const [rows] = await pool.query("SELECT * FROM recommendations WHERE RecommendationKey = ?", [req.params.recommendationKey]);
    return res.json({ status: "success", data: rows[0] });
  } catch (error) {
    console.error("Update recommendation error:", error.message);
    return res.status(500).json({ status: "error", message: "Failed to update recommendation" });
  }
};

module.exports = { syncRecommendations, getRecommendations, updateRecommendationStatus };
