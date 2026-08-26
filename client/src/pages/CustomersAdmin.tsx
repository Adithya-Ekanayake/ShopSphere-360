import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Pencil,
  Plus,
  X,
  Search,
  Users,
  UserCheck,
  Crown,
  Globe,
  Loader2,
  AlertCircle,
  RotateCw,
} from "lucide-react";

import customerService from "../services/customerService";
import type {
  Customer,
  CustomerInput,
} from "../types/customer";

import "../styles/dashboard.css";
import "../styles/admin.css";

const CustomersAdmin = () => {
  // =========================================================
  // DARK MODE
  // =========================================================

  const [darkMode] = useState<boolean>(() => {
    return localStorage.getItem("shopsphere-theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);

    localStorage.setItem(
      "shopsphere-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // =========================================================
  // EMPTY FORM
  // =========================================================

  const emptyForm: CustomerInput = {
    CustomerID: "",
    FirstName: "",
    LastName: "",
    Gender: "",
    Age: "",
    SignupDate: "",
    CustomerSegment: "",
    AcquisitionChannel: "",
    City: "",
    Country: "",
  };

  // =========================================================
  // STATE
  // =========================================================

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // FETCH CUSTOMERS
  // =========================================================

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================================================
  // FILTER CUSTOMERS
  // =========================================================

  const filteredCustomers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !searchTerm ||
        String(customer.CustomerID ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(customer.FirstName ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(customer.LastName ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        `${customer.FirstName ?? ""} ${customer.LastName ?? ""}`
          .toLowerCase()
          .includes(searchTerm) ||
        String(customer.City ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(customer.Country ?? "")
          .toLowerCase()
          .includes(searchTerm);

      const matchesSegment =
        !segmentFilter || customer.CustomerSegment === segmentFilter;

      const matchesCountry =
        !countryFilter || customer.Country === countryFilter;

      return matchesSearch && matchesSegment && matchesCountry;
    });
  }, [customers, search, segmentFilter, countryFilter]);

  // =========================================================
  // UNIQUE SEGMENTS & COUNTRIES
  // =========================================================

  const segments = useMemo(() => {
    const list: string[] = [];
    customers.forEach((c) => {
      if (c.CustomerSegment && !list.includes(c.CustomerSegment)) {
        list.push(c.CustomerSegment);
      }
    });
    return list;
  }, [customers]);

  const countries = useMemo(() => {
    const list: string[] = [];
    customers.forEach((c) => {
      if (c.Country && !list.includes(c.Country)) {
        list.push(c.Country);
      }
    });
    return list;
  }, [customers]);

  // =========================================================
  // KPI STATS
  // =========================================================

  const premiumCount = useMemo(
    () =>
      customers.filter((c) => c.CustomerSegment === "Premium").length,
    [customers]
  );

  const regularCount = useMemo(
    () =>
      customers.filter((c) => c.CustomerSegment === "Regular").length,
    [customers]
  );

  const uniqueCountriesCount = useMemo(
    () => countries.length,
    [countries]
  );

  // =========================================================
  // FORM SUBMIT
  // =========================================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");

      if (editingKey !== null) {
        await customerService.update(editingKey, {
          FirstName: form.FirstName,
          LastName: form.LastName,
          Gender: form.Gender,
          Age: form.Age ? Number(form.Age) : "",
          SignupDate: form.SignupDate,
          CustomerSegment: form.CustomerSegment,
          AcquisitionChannel: form.AcquisitionChannel,
          City: form.City,
          Country: form.Country,
        });
      } else {
        await customerService.create({
          ...form,
          Age: form.Age ? Number(form.Age) : "",
        });
      }

      const data = await customerService.getAll();
      setCustomers(data);

      setShowForm(false);
      setEditingKey(null);
      setForm({ ...emptyForm });
    } catch (err) {
      console.error("Failed to save customer:", err);
      setError("Failed to save customer. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT CUSTOMER
  // =========================================================

  const handleEdit = (customer: Customer) => {
    setEditingKey(customer.CustomerKey);

    setForm({
      CustomerID: customer.CustomerID ?? "",
      FirstName: customer.FirstName ?? "",
      LastName: customer.LastName ?? "",
      Gender: customer.Gender ?? "",
      Age: customer.Age != null ? String(customer.Age) : "",
      SignupDate: customer.SignupDate
        ? customer.SignupDate.slice(0, 10)
        : "",
      CustomerSegment: customer.CustomerSegment ?? "",
      AcquisitionChannel: customer.AcquisitionChannel ?? "",
      City: customer.City ?? "",
      Country: customer.Country ?? "",
    });

    setShowForm(true);
  };

  // =========================================================
  // DELETE CUSTOMER
  // =========================================================

  const handleDelete = async (customerKey: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await customerService.remove(customerKey);

      setCustomers((previousCustomers) =>
        previousCustomers.filter(
          (customer) => customer.CustomerKey !== customerKey
        )
      );
    } catch (err) {
      console.error("Failed to delete customer:", err);
      setError("Failed to delete customer. Please try again.");
    }
  };

  // =========================================================
  // CANCEL FORM
  // =========================================================

  const handleCancel = () => {
    setShowForm(false);
    setEditingKey(null);
    setForm({ ...emptyForm });
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAddCustomer = () => {
    setEditingKey(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setError("");
  };

  // Helper for segment class
  const getSegmentClass = (segment?: string | null) => {
    const seg = (segment ?? "").toLowerCase();
    if (seg === "premium") return "customer-segment premium";
    if (seg === "regular") return "customer-segment regular";
    if (seg === "occasional") return "customer-segment occasional";
    if (seg === "new") return "customer-segment new";
    return "customer-segment";
  };

  // Helper for initials
  const getInitials = (first?: string, last?: string) => {
    const f = (first ?? "").trim().charAt(0).toUpperCase();
    const l = (last ?? "").trim().charAt(0).toUpperCase();
    return f || l ? `${f}${l}` : "CU";
  };

  // Helper for date format
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="admin-loading" style={{ marginTop: "32px" }}>
        <Loader2 className="admin-spinner" />
        <p>Loading customers...</p>
      </div>
    );
  }

  // =========================================================
  // PAGE RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="admin-header">
        <div>
          <p className="panel-kicker">CUSTOMERS</p>
          <h1>Customers Administration</h1>
          <p className="admin-page-description">
            Manage customer profiles, segmentation, and contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCustomer}
          className="admin-btn admin-btn-primary"
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* =====================================================
          KPI SUMMARY CARDS
          ===================================================== */}

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Users size={20} />
          </div>
          <div className="kpi-content">
            <span>Total Customers</span>
            <strong>{customers.length.toLocaleString()}</strong>
            <small>Active in database</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Crown size={20} />
          </div>
          <div className="kpi-content">
            <span>Premium Segment</span>
            <strong>{premiumCount.toLocaleString()}</strong>
            <small>High value clients</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <UserCheck size={20} />
          </div>
          <div className="kpi-content">
            <span>Regular Segment</span>
            <strong>{regularCount.toLocaleString()}</strong>
            <small>Standard tier</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Globe size={20} />
          </div>
          <div className="kpi-content">
            <span>Global Reach</span>
            <strong>{uniqueCountriesCount.toLocaleString()}</strong>
            <small>Active countries</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="admin-error-box">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================================
          CUSTOMER DIRECTORY PANEL
          ===================================================== */}

      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-header">
          <div>
            <span className="panel-kicker">CUSTOMER MANAGEMENT</span>
            <h2>Customer Directory</h2>
            <p>Search, filter and manage customer accounts.</p>
          </div>
          <Users size={20} />
        </div>

        <div className="panel-body">
          {/* TOOLBAR */}
          <div className="admin-toolbar">
            <div className="admin-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by ID, name, city, country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="admin-search-clear"
                  onClick={() => setSearch("")}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="admin-filter"
            >
              <option value="">All Segments</option>
              {segments.map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </select>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="admin-filter"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* CUSTOMER TABLE */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Gender & Age</th>
                  <th>Signup Date</th>
                  <th>Segment</th>
                  <th>Channel</th>
                  <th>Location</th>
                  <th style={{ textAlign: "right", width: "90px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="admin-empty">
                      <Users size={32} />
                      <strong>No customers found</strong>
                      <span>
                        Try adjusting your search criteria or add a new customer.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.CustomerKey}>
                      {/* CUSTOMER ID */}
                      <td className="product-id">
                        {customer.CustomerID || "—"}
                      </td>

                      {/* NAME & AVATAR */}
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {getInitials(customer.FirstName, customer.LastName)}
                          </div>
                          <div>
                            <strong>
                              {customer.FirstName} {customer.LastName}
                            </strong>
                            <small>
                              {customer.City && customer.Country
                                ? `${customer.City}, ${customer.Country}`
                                : customer.Country || customer.City || "Location not set"}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* GENDER & AGE */}
                      <td>
                        <span>
                          {customer.Gender || "—"}
                          {customer.Age ? ` (${customer.Age} yrs)` : ""}
                        </span>
                      </td>

                      {/* SIGNUP DATE */}
                      <td>
                        <span>{formatDate(customer.SignupDate)}</span>
                      </td>

                      {/* SEGMENT */}
                      <td>
                        <span className={getSegmentClass(customer.CustomerSegment)}>
                          {customer.CustomerSegment || "Unassigned"}
                        </span>
                      </td>

                      {/* CHANNEL */}
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {customer.AcquisitionChannel || "Direct"}
                        </span>
                      </td>

                      {/* LOCATION */}
                      <td>
                        <span>
                          {customer.City
                            ? `${customer.City}${customer.Country ? `, ${customer.Country}` : ""}`
                            : customer.Country || "—"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td style={{ textAlign: "right" }}>
                        <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => handleEdit(customer)}
                            className="admin-action-edit"
                            title="Edit customer"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(customer.CustomerKey)}
                            className="admin-action-delete"
                            title="Delete customer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-soft)",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            <p style={{ margin: 0 }}>
              Showing <strong>{filteredCustomers.length}</strong> of{" "}
              <strong>{customers.length}</strong> customers
            </p>

            <button
              type="button"
              onClick={fetchCustomers}
              className="admin-btn"
              style={{ padding: "6px 12px", minHeight: "32px", fontSize: "12px" }}
            >
              <RotateCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          ADD / EDIT MODAL
          ===================================================== */}

      {showForm && (
        <div className="admin-modal-overlay" onClick={handleCancel}>
          <div
            className="admin-modal customer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span className="panel-kicker">CUSTOMER PROFILE</span>
                <h2>
                  {editingKey !== null
                    ? "Edit Customer"
                    : "Add New Customer"}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="admin-modal-close"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form customer-form">
              <div className="admin-form-grid">
                {/* CUSTOMER ID */}
                <label>
                  <span>
                    Customer ID {editingKey === null && <em>*</em>}
                  </span>
                  <input
                    type="text"
                    name="CustomerID"
                    value={form.CustomerID}
                    onChange={handleInputChange}
                    placeholder="e.g. CUST-1001"
                    required
                    disabled={editingKey !== null}
                  />
                </label>

                {/* FIRST NAME */}
                <label>
                  <span>
                    First Name <em>*</em>
                  </span>
                  <input
                    type="text"
                    name="FirstName"
                    value={form.FirstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    required
                  />
                </label>

                {/* LAST NAME */}
                <label>
                  <span>
                    Last Name <em>*</em>
                  </span>
                  <input
                    type="text"
                    name="LastName"
                    value={form.LastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    required
                  />
                </label>

                {/* GENDER */}
                <label>
                  <span>Gender</span>
                  <select
                    name="Gender"
                    value={form.Gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                {/* AGE */}
                <label>
                  <span>Age</span>
                  <input
                    type="number"
                    name="Age"
                    value={form.Age}
                    onChange={handleInputChange}
                    placeholder="Age in years"
                    min="0"
                    max="120"
                  />
                </label>

                {/* SIGNUP DATE */}
                <label>
                  <span>Signup Date</span>
                  <input
                    type="date"
                    name="SignupDate"
                    value={form.SignupDate}
                    onChange={handleInputChange}
                  />
                </label>

                {/* CUSTOMER SEGMENT */}
                <label>
                  <span>Customer Segment</span>
                  <select
                    name="CustomerSegment"
                    value={form.CustomerSegment}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Segment</option>
                    <option value="Premium">Premium</option>
                    <option value="Regular">Regular</option>
                    <option value="Occasional">Occasional</option>
                    <option value="New">New</option>
                  </select>
                </label>

                {/* ACQUISITION CHANNEL */}
                <label>
                  <span>Acquisition Channel</span>
                  <select
                    name="AcquisitionChannel"
                    value={form.AcquisitionChannel}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Channel</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Search">Search</option>
                    <option value="Email">Email</option>
                    <option value="Referral">Referral</option>
                    <option value="Direct">Direct</option>
                    <option value="Paid Ads">Paid Ads</option>
                  </select>
                </label>

                {/* CITY */}
                <label>
                  <span>City</span>
                  <input
                    type="text"
                    name="City"
                    value={form.City}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </label>

                {/* COUNTRY */}
                <label>
                  <span>Country</span>
                  <input
                    type="text"
                    name="Country"
                    value={form.Country}
                    onChange={handleInputChange}
                    placeholder="Country"
                  />
                </label>
              </div>

              {/* FORM ACTIONS */}
              <div className="admin-form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="admin-btn"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                >
                  {saving
                    ? "Saving..."
                    : editingKey !== null
                    ? "Update Customer"
                    : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomersAdmin;