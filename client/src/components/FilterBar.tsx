import { useMemo } from "react";
import { X, Filter, XCircle } from "lucide-react";
import { useFilters } from "../context/FilterContext";

import "../styles/dashboard.css";
import "../styles/admin.css";

const FilterBar = () => {
  const { filters, filterOptions, isLoadingOptions, updateFilter, resetFilters } = useFilters();

  const filterConfig = useMemo(
    () => [
      {
        key: "startDate" as const,
        label: "Start Date",
        type: "date",
        placeholder: "YYYY-MM-DD",
        value: filters.startDate,
      },
      {
        key: "endDate" as const,
        label: "End Date",
        type: "date",
        placeholder: "YYYY-MM-DD",
        value: filters.endDate,
      },
      {
        key: "segment" as const,
        label: "Segment",
        type: "select",
        options: filterOptions?.segments ?? [],
        value: filters.segment,
      },
      {
        key: "channelKey" as const,
        label: "Channel",
        type: "select",
        options: filterOptions?.channels ?? [],
        value: filters.channelKey,
      },
      {
        key: "locationKey" as const,
        label: "Location",
        type: "select",
        options: filterOptions?.locations ?? [],
        value: filters.locationKey,
      },
      {
        key: "productKey" as const,
        label: "Product",
        type: "select",
        options: filterOptions?.products ?? [],
        value: filters.productKey,
      },
      {
        key: "status" as const,
        label: "Status",
        type: "select",
        options: filterOptions?.statuses ?? [],
        value: filters.status,
      },
    ],
    [filters, filterOptions]
  );

  const activeCount = Object.values(filters).filter((v) => v !== "").length;

  return (
    <div
      className="filter-bar"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        alignItems: "flex-end",
        padding: "16px 20px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
          marginBottom: "8px",
        }}
      >
        <Filter size={18} style={{ color: "var(--primary)" }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
          Filters
        </span>
      </div>

      {/* Filter Fields */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          columnGap: "16px",
          alignItems: "flex-end",
          flex: 1,
        }}
      >
        {filterConfig.map(({ key, label, type, value, options = [] }) => (
          <div
            key={key}
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              gap: "5px",
              minWidth: type === "date" ? "145px" : "160px",
              flex: type === "date" ? "0 1 145px" : "1 1 160px",
            }}
          >
            <label
              htmlFor={key}
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {label}
            </label>

            {type === "date" ? (
              <div className="filter-control-wrapper">
                <input
                  id={key}
                  type="date"
                  value={value}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      const formatted = date.toISOString().split("T")[0];
                      updateFilter(key, formatted);
                    }
                  }}
                  className="filter-control filter-date"
                  disabled={isLoadingOptions}
                />
              </div>
            ) : (
              <div className="filter-control-wrapper">
                <select
                  value={value}
                  onChange={(e) => updateFilter(key, e.target.value)}
                  disabled={isLoadingOptions}
                  className="filter-control filter-select"
                >
                  <option value="">All</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="filter-select-arrow">
                  ▼
                </div>
              </div>
            )}

            {/* Clear button for active filters */}
            {value && (
              <button
                type="button"
                onClick={() => updateFilter(key, "")}
                style={{
                  position: "absolute",
                  right: "32px",
                  top: "28px",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label={`Clear ${label} filter`}
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
        ))}

        {/* Reset Button */}
        <button
          type="button"
          onClick={resetFilters}
          disabled={!Object.values(filters).some((v) => v !== "")}
          className="admin-btn"
          style={{
            height: "38px",
            minHeight: "38px",
            boxSizing: "border-box",
            padding: "0 16px",
            fontSize: "12px",
            fontWeight: 600,
            opacity: activeCount === 0 ? 0.5 : 1,
          }}
        >
          <X size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Active Filters Summary */}
      {activeCount > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid var(--border)",
            width: "100%",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Active filters:
          </span>
          {Object.entries(filters)
            .filter(([, v]) => v !== "")
            .map(([key, value]) => (
              <span
                key={key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 8px",
                  background: "var(--primary-soft)",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "var(--primary)",
                }}
              >
                <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
                  {key}
                </span>
                <span>{value}</span>
                <button
                  type="button"
                  onClick={() => updateFilter(key as keyof typeof filters, "")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    cursor: "pointer",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;