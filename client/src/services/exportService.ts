import api from "./api";
import { serializeFilters } from "./analyticsService";
import type { DashboardFilters } from "../types/filters";

export type ExportDataset = "sales" | "customers" | "products" | "returns" | "top-products" | "rfm" | "clv" | "product-profitability";
export type ExportReportType = "sales-summary" | "customer-summary" | "marketing-summary" | "order-summary" | "product-performance" | "profitability-summary";

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const requestFile = async (path: string, params: Record<string, string>) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`${path}?${query}`, { responseType: "blob" });
  const disposition = response.headers["content-disposition"] as string | undefined;
  const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? "shopsphere-export";
  downloadBlob(response.data, filename);
};

const exportCSV = (dataset: ExportDataset, filters?: Partial<DashboardFilters>) => requestFile("/export/csv", { dataset, ...Object.fromEntries(new URLSearchParams(serializeFilters(filters))) });
const exportExcel = (dataset: ExportDataset, filters?: Partial<DashboardFilters>) => requestFile("/export/excel", { dataset, ...Object.fromEntries(new URLSearchParams(serializeFilters(filters))) });
const exportPDF = (reportType: ExportReportType, filters?: Partial<DashboardFilters>) => requestFile("/export/pdf", { reportType, ...Object.fromEntries(new URLSearchParams(serializeFilters(filters))) });

export default { exportCSV, exportExcel, exportPDF };
