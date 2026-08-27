const { evaluateInsights } = require("../insights/engine");

const getInsights = async (req, res) => {
  try {
    const insights = await evaluateInsights(req.query);
    return res.json({ status: "success", count: insights.length, data: insights });
  } catch (error) {
    if (error.message?.startsWith("Invalid")) {
      return res.status(400).json({ status: "error", message: error.message });
    }
    console.error("Insights error:", error.message);
    return res.status(500).json({ status: "error", message: "Failed to generate insights" });
  }
};

module.exports = { getInsights };
