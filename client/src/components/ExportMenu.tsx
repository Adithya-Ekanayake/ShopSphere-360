import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import exportService, { type ExportDataset, type ExportReportType } from "../services/exportService";
import { useFilters } from "../context/FilterContext";

const ExportMenu = ({ dataset, reportType, label }: { dataset?: ExportDataset; reportType?: ExportReportType; label?: string }) => {
  const { filters } = useFilters();
  const [active, setActive] = useState("");
  const [error, setError] = useState("");

  const run = async (format: "csv" | "excel" | "pdf") => {
    setActive(format);
    setError("");
    try {
      if (format === "csv" && dataset) await exportService.exportCSV(dataset, filters);
      if (format === "excel" && dataset) await exportService.exportExcel(dataset, filters);
      if (format === "pdf" && reportType) await exportService.exportPDF(reportType, filters);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed");
    } finally {
      setActive("");
    }
  };

  return <div className="export-menu" aria-label={label ? `${label} export options` : "Export options"}>
    {label ? <span className="export-menu-label">{label}</span> : null}
    {dataset ? <>
      <button className="admin-btn" type="button" disabled={!!active} onClick={() => run("csv")} title="Download CSV"><Download size={14} />{active === "csv" ? "Preparing..." : "CSV"}</button>
      <button className="admin-btn" type="button" disabled={!!active} onClick={() => run("excel")} title="Download Excel"><FileSpreadsheet size={14} />{active === "excel" ? "Preparing..." : "Excel"}</button>
    </> : null}
    {reportType ? <button className="admin-btn" type="button" disabled={!!active} onClick={() => run("pdf")} title="Download PDF"><FileText size={14} />{active === "pdf" ? "Preparing..." : "PDF"}</button> : null}
    {error ? <span className="export-error">{error}</span> : null}
  </div>;
};

export default ExportMenu;
