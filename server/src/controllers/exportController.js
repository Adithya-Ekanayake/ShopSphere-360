const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { getExportRows } = require("../insights/engine");

const DATASETS = new Set(["sales", "customers", "products", "returns", "top-products", "rfm", "clv", "product-profitability", "marketing"]);
const REPORT_TYPES = new Set(["sales-summary", "customer-summary", "marketing-summary", "order-summary", "product-performance", "profitability-summary"]);
const CURRENCY_FIELDS = new Set(["Revenue", "Profit", "TotalRevenue", "TotalProfit", "TotalCost", "TotalRefundAmount", "MonetaryValue", "PredictedCLV", "AverageOrderValue", "AttributedRevenue", "Spend"]);

const filterQuery = (query) => {
  const { dataset, reportType, ...filters } = query;
  return filters;
};

const validateDataset = (dataset) => {
  if (!DATASETS.has(dataset)) throw new Error("Invalid dataset.");
  return dataset;
};

const validateReportType = (reportType) => {
  if (!REPORT_TYPES.has(reportType)) throw new Error("Invalid report type.");
  return reportType;
};

const exportCSV = async (req, res) => {
  try {
    const dataset = validateDataset(req.query.dataset);
    const rows = await getExportRows(dataset, filterQuery(req.query));
    const csv = new Parser({ fields: rows.length ? Object.keys(rows[0]) : undefined }).parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="shopsphere-${dataset}.csv"`);
    return res.send(csv);
  } catch (error) {
    if (error.message?.startsWith("Invalid")) return res.status(400).json({ status: "error", message: error.message });
    console.error("CSV export error:", error.message);
    return res.status(500).json({ status: "error", message: "Failed to export CSV" });
  }
};

const exportExcel = async (req, res) => {
  try {
    const dataset = validateDataset(req.query.dataset);
    const rows = await getExportRows(dataset, filterQuery(req.query));
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(dataset);
    const columns = rows.length ? Object.keys(rows[0]) : [];
    sheet.columns = columns.map((key) => ({ header: key, key, width: Math.min(Math.max(key.length + 4, 14), 28) }));
    rows.forEach((row) => sheet.addRow(row));
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      cell.alignment = { vertical: "middle" };
    });
    columns.forEach((key, index) => {
      if (CURRENCY_FIELDS.has(key)) sheet.getColumn(index + 1).numFmt = '"LKR "#,##0.00';
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="shopsphere-${dataset}.xlsx"`);
    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    if (error.message?.startsWith("Invalid")) return res.status(400).json({ status: "error", message: error.message });
    console.error("Excel export error:", error.message);
    return res.status(500).json({ status: "error", message: "Failed to export Excel" });
  }
};

const reportConfig = {
  "sales-summary": { title: "Sales Summary", dataset: "sales", columns: ["Year", "MonthName", "TotalOrders", "Revenue", "Profit"] },
  "customer-summary": { title: "Customer Summary", dataset: "customers", columns: ["CustomerName", "CustomerSegment", "TotalOrders", "TotalRevenue", "TotalProfit"] },
  "marketing-summary": { title: "Marketing Summary", dataset: "marketing", columns: ["ChannelName", "AttributedRevenue", "Spend", "ROAS"] },
  "order-summary": { title: "Order Summary", dataset: "sales", columns: ["Year", "MonthName", "TotalOrders", "Revenue", "Profit"] },
  "product-performance": { title: "Product Performance", dataset: "products", columns: ["ProductID", "ProductName", "Category", "UnitsSold", "TotalRevenue", "TotalProfit"] },
  "profitability-summary": { title: "Profitability Summary", dataset: "product-profitability", columns: ["ProductID", "ProductName", "Category", "TotalRevenue", "TotalCost", "TotalProfit", "ProfitMarginPercent"] },
};

const exportPDF = async (req, res) => {
  try {
    const reportType = validateReportType(req.query.reportType);
    const config = reportConfig[reportType];
    const rows = await getExportRows(config.dataset, filterQuery(req.query));
    const doc = new PDFDocument({ margin: 44, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="shopsphere-${reportType}.pdf"`);
    doc.pipe(res);
    doc.rect(0, 0, 595, 86).fill("#2563EB");
    doc.fillColor("#FFFFFF").fontSize(22).text("ShopSphere360", 44, 25);
    doc.fontSize(10).text("Management Analytics Report", 44, 54);
    doc.fillColor("#0F172A").fontSize(18).text(config.title, 44, 112);
    doc.fillColor("#64748B").fontSize(9).text(`Generated ${new Date().toLocaleString()}`, 44, 137);
    const numericFields = rows.length ? Object.keys(rows[0]).filter((key) => typeof rows[0][key] === "number" || CURRENCY_FIELDS.has(key)).slice(0, 3) : [];
    doc.fillColor("#0F172A").fontSize(11).text(`Records: ${rows.length.toLocaleString()}`, 44, 170);
    numericFields.forEach((key, index) => {
      const total = rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
      doc.fillColor("#2563EB").fontSize(9).text(key, 44 + index * 160, 198);
      doc.fillColor("#0F172A").fontSize(14).text(total.toLocaleString(undefined, { maximumFractionDigits: 2 }), 44 + index * 160, 213);
    });
    let y = 260;
    doc.fillColor("#2563EB").rect(44, y, 507, 22).fill();
    doc.fillColor("#FFFFFF").fontSize(8);
    config.columns.forEach((column, index) => doc.text(column, 50 + index * (507 / config.columns.length), y + 7, { width: 507 / config.columns.length - 6, ellipsis: true }));
    y += 30;
    doc.fillColor("#0F172A").fontSize(8);
    rows.slice(0, 25).forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) doc.rect(44, y - 4, 507, 20).fill("#F8FAFC");
      doc.fillColor("#0F172A");
      config.columns.forEach((column, index) => doc.text(String(row[column] ?? ""), 50 + index * (507 / config.columns.length), y, { width: 507 / config.columns.length - 6, ellipsis: true }));
      y += 20;
    });
    if (rows.length > 25) doc.fillColor("#64748B").text(`Showing first 25 of ${rows.length} records. Download CSV or Excel for the full dataset.`, 44, y + 14);
    doc.end();
  } catch (error) {
    if (error.message?.startsWith("Invalid")) return res.status(400).json({ status: "error", message: error.message });
    console.error("PDF export error:", error.message);
    return res.status(500).json({ status: "error", message: "Failed to export PDF" });
  }
};

module.exports = { exportCSV, exportExcel, exportPDF };
