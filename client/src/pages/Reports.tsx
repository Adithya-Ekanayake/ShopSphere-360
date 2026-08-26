import { useState } from "react";
import {
  FileText,
  Download,
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  CalendarDays,
  Filter,
} from "lucide-react";

import "../styles/dashboard.css";
import "../styles/admin.css";

const Reports = () => {
  const [reportType, setReportType] = useState("All Reports");
  const [period, setPeriod] = useState("This Year");

  const reports = [
    {
      title: "Sales Report",
      description:
        "Detailed overview of sales performance, revenue and order activity.",
      category: "Sales",
      icon: BarChart3,
    },
    {
      title: "Customer Report",
      description:
        "Customer purchasing activity, segments and customer value insights.",
      category: "Customers",
      icon: Users,
    },
    {
      title: "Order Report",
      description:
        "Summary of orders, order values and transaction activity.",
      category: "Orders",
      icon: ShoppingCart,
    },
    {
      title: "Product Performance Report",
      description:
        "Product sales performance, revenue contribution and profitability.",
      category: "Products",
      icon: Package,
    },
    {
      title: "Profitability Report",
      description:
        "Revenue, costs, profit margins and overall business profitability.",
      category: "Financial",
      icon: TrendingUp,
    },
  ];

  const filteredReports =
    reportType === "All Reports"
      ? reports
      : reports.filter(
          (report) => report.category === reportType
        );

  const handleGenerateReport = (reportName: string) => {
    console.log(
      `Generating ${reportName} for ${period}`
    );

    alert(
      `${reportName} will be generated for ${period}.`
    );
  };

  return (
    <div className="dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-header">

        <div>
          <p className="panel-kicker">
            REPORTS
          </p>

          <h1>
            Reports & Insights
          </h1>

          <p
            style={{
              marginTop: "5px",
              color: "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            Generate business reports and review
            important performance information.
          </p>
        </div>

      </div>

      {/* =====================================================
          REPORT CONTROLS
      ===================================================== */}

      <section
        className="panel"
        style={{
          marginTop: "20px",
        }}
      >

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              REPORT FILTERS
            </span>

            <h2>
              Choose Report Criteria
            </h2>

            <p>
              Select a report category and reporting
              period.
            </p>

          </div>

          <Filter size={20} />

        </div>

        <div
          className="panel-body"
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >

          {/* REPORT TYPE */}

          <div
            style={{
              flex: "1 1 240px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Report Type
            </label>

            <select
              value={reportType}
              onChange={(e) =>
                setReportType(e.target.value)
              }
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "8px",
                border:
                  "1px solid var(--border-color)",
                background:
                  "var(--background-secondary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            >

              <option>
                All Reports
              </option>

              <option>
                Sales
              </option>

              <option>
                Customers
              </option>

              <option>
                Orders
              </option>

              <option>
                Products
              </option>

              <option>
                Financial
              </option>

            </select>

          </div>

          {/* PERIOD */}

          <div
            style={{
              flex: "1 1 240px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Reporting Period
            </label>

            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value)
              }
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "8px",
                border:
                  "1px solid var(--border-color)",
                background:
                  "var(--background-secondary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            >

              <option>
                This Month
              </option>

              <option>
                Last Month
              </option>

              <option>
                This Quarter
              </option>

              <option>
                Last Quarter
              </option>

              <option>
                This Year
              </option>

              <option>
                Last Year
              </option>

            </select>

          </div>

        </div>

      </section>

      {/* =====================================================
          REPORT SUMMARY
      ===================================================== */}

      <section
        className="dashboard-grid primary-grid"
        style={{
          marginTop: "20px",
        }}
      >

        {/* AVAILABLE REPORTS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                REPORT LIBRARY
              </span>

              <h2>
                Available Reports
              </h2>

              <p>
                Reports available for the selected
                criteria.
              </p>

            </div>

            <FileText size={20} />

          </div>

          <div className="metric-list">

            <div className="metric-item">

              <div>

                <span>
                  Total Reports
                </span>

                <small>
                  Available report templates
                </small>

              </div>

              <strong>
                {reports.length}
              </strong>

            </div>

            <div className="metric-item">

              <div>

                <span>
                  Selected Category
                </span>

                <small>
                  Current report filter
                </small>

              </div>

              <strong
                style={{
                  fontSize: "14px",
                }}
              >
                {reportType}
              </strong>

            </div>

            <div className="metric-item">

              <div>

                <span>
                  Reporting Period
                </span>

                <small>
                  Current time range
                </small>

              </div>

              <strong
                style={{
                  fontSize: "14px",
                }}
              >
                {period}
              </strong>

            </div>

          </div>

        </div>

        {/* QUICK INFO */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                REPORTING
              </span>

              <h2>
                Reporting Overview
              </h2>

              <p>
                Use reports to support business
                decisions.
              </p>

            </div>

            <CalendarDays size={20} />

          </div>

          <div
            className="panel-body"
            style={{
              paddingTop: "10px",
            }}
          >

            <p
              style={{
                color:
                  "var(--text-secondary)",
                lineHeight: 1.7,
                fontSize: "14px",
              }}
            >
              Generate structured reports from
              business data to understand sales,
              customers, orders, products and
              profitability.
            </p>

            <div
              style={{
                marginTop: "18px",
                padding: "14px",
                borderRadius: "10px",
                background:
                  "var(--background-secondary)",
                border:
                  "1px solid var(--border-color)",
              }}
            >

              <strong
                style={{
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Selected Period
              </strong>

              <span
                style={{
                  color:
                    "var(--text-secondary)",
                  fontSize: "13px",
                }}
              >
                {period}
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          REPORT CARDS
      ===================================================== */}

      <section
        style={{
          marginTop: "20px",
        }}
      >

        <div className="section-heading">

          <div>

            <span className="panel-kicker">
              REPORTS
            </span>

            <h2>
              Generate a Report
            </h2>

            <p>
              Select a report to generate detailed
              business information.
            </p>

          </div>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginTop: "16px",
          }}
        >

          {filteredReports.map(
            (report) => {

              const Icon = report.icon;

              return (

                <div
                  key={report.title}
                  className="panel"
                  style={{
                    margin: 0,
                  }}
                >

                  <div
                    className="panel-body"
                    style={{
                      padding: "20px",
                    }}
                  >

                    {/* ICON */}

                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "var(--background-secondary)",
                        color:
                          "var(--primary)",
                        marginBottom: "16px",
                      }}
                    >
                      <Icon size={20} />
                    </div>

                    {/* TITLE */}

                    <h3
                      style={{
                        margin: 0,
                        fontSize: "17px",
                      }}
                    >
                      {report.title}
                    </h3>

                    {/* DESCRIPTION */}

                    <p
                      style={{
                        marginTop: "8px",
                        color:
                          "var(--text-secondary)",
                        fontSize: "13px",
                        lineHeight: 1.6,
                        minHeight: "62px",
                      }}
                    >
                      {report.description}
                    </p>

                    {/* CATEGORY */}

                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "5px",
                        padding:
                          "5px 9px",
                        borderRadius: "6px",
                        background:
                          "var(--background-secondary)",
                        color:
                          "var(--text-secondary)",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {report.category}
                    </span>

                    {/* BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        handleGenerateReport(
                          report.title
                        )
                      }
                      style={{
                        width: "100%",
                        marginTop: "18px",
                        padding: "11px 14px",
                        border: "none",
                        borderRadius: "8px",
                        background:
                          "var(--primary)",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        gap: "8px",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >

                      <Download size={16} />

                      Generate Report

                    </button>

                  </div>

                </div>

              );

            }
          )}

        </div>

        {/* NO REPORTS */}

        {filteredReports.length === 0 && (

          <div
            className="panel"
            style={{
              marginTop: "16px",
            }}
          >

            <div
              className="panel-body"
              style={{
                textAlign: "center",
                padding: "50px",
              }}
            >

              <FileText
                size={32}
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              />

              <p
                style={{
                  marginTop: "12px",
                  color:
                    "var(--text-secondary)",
                }}
              >
                No reports available for this
                category.
              </p>

            </div>

          </div>

        )}

      </section>

    </div>
  );
};

export default Reports;