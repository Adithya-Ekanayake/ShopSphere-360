import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Pencil,
  Plus,
  X,
  Search,
  Users,
  Globe,
  UserPlus,
  Layers,
} from "lucide-react";

import customerService from "../services/customerService";
import type {
  Customer,
  CustomerInput,
} from "../types/customer";

import "../styles/dashboard.css";
import "../styles/admin.css";

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

const CustomersAdmin = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [form, setForm] =
    useState<CustomerInput>(emptyForm);

  const [saving, setSaving] = useState(false);

  // ==========================================
  // LOAD CUSTOMERS
  // ==========================================

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const data = await customerService.getAll();

      setCustomers(data);
      setError("");
    } catch (err) {
      console.error("Failed to load customers:", err);

      setError("Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // ==========================================
  // FILTER OPTIONS
  // ==========================================

  const segments = useMemo(() => {
    return Array.from(
      new Set(
        customers
          .map((customer) => customer.CustomerSegment)
          .filter(Boolean)
      )
    ).sort();
  }, [customers]);

  const countries = useMemo(() => {
    return Array.from(
      new Set(
        customers
          .map((customer) => customer.Country)
          .filter(Boolean)
      )
    ).sort();
  }, [customers]);

  // ==========================================
  // FILTERED CUSTOMERS
  // ==========================================

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const fullName =
        `${customer.FirstName} ${customer.LastName}`.toLowerCase();

      const matchesSearch =
        !query ||
        customer.CustomerID.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        (customer.City ?? "")
          .toLowerCase()
          .includes(query) ||
        (customer.Country ?? "")
          .toLowerCase()
          .includes(query);

      const matchesSegment =
        !segmentFilter ||
        customer.CustomerSegment === segmentFilter;

      const matchesCountry =
        !countryFilter ||
        customer.Country === countryFilter;

      return (
        matchesSearch &&
        matchesSegment &&
        matchesCountry
      );
    });
  }, [
    customers,
    search,
    segmentFilter,
    countryFilter,
  ]);

  // ==========================================
  // SUMMARY DATA
  // ==========================================

  const totalCustomers = customers.length;

  const totalSegments = segments.length;

  const totalCountries = countries.length;

  const newCustomers = customers.filter((customer) => {
    if (!customer.SignupDate) return false;

    const signupDate = new Date(customer.SignupDate);

    const now = new Date();

    const monthsAgo = new Date();

    monthsAgo.setMonth(now.getMonth() - 1);

    return signupDate >= monthsAgo;
  }).length;

  // ==========================================
  // FORM
  // ==========================================

  const openCreateForm = () => {
    setEditingKey(null);

    setForm({
      ...emptyForm,
      SignupDate: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowForm(true);
  };

  const openEditForm = (customer: Customer) => {
    setEditingKey(customer.CustomerKey);

    setForm({
      CustomerID: customer.CustomerID,
      FirstName: customer.FirstName,
      LastName: customer.LastName,
      Gender: customer.Gender ?? "",
      Age: customer.Age ?? "",
      SignupDate: customer.SignupDate
        ? customer.SignupDate.substring(0, 10)
        : "",
      CustomerSegment:
        customer.CustomerSegment ?? "",
      AcquisitionChannel:
        customer.AcquisitionChannel ?? "",
      City: customer.City ?? "",
      Country: customer.Country ?? "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingKey(null);
    setForm(emptyForm);
  };

  const handleChange = (
    field: keyof CustomerInput,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================
  // SAVE
  // ==========================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setSaving(true);

      if (editingKey === null) {
        await customerService.create(form);
      } else {
        const { CustomerID, ...updateData } = form;

        await customerService.update(
          editingKey,
          updateData
        );
      }

      closeForm();

      await loadCustomers();
    } catch (err) {
      console.error(
        "Failed to save customer:",
        err
      );

      alert(
        "Failed to save customer. Check the console for details."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (
    customerKey: number
  ) => {
    const confirmed = window.confirm(
      "Delete this customer? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      await customerService.remove(customerKey);

      await loadCustomers();
    } catch (err) {
      console.error(
        "Failed to delete customer:",
        err
      );

      alert(
        "Failed to delete customer. They may have related orders or records."
      );
    }
  };

  return (
    <div className="dashboard">

      {/* ========================================
          PAGE HEADER
      ======================================== */}

      <div className="admin-header">

        <div>
          <p className="panel-kicker">
            CUSTOMER MANAGEMENT
          </p>

          <h1>Customers</h1>

          <p className="admin-page-description">
            Manage your customer base and customer information.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={openCreateForm}
        >
          <Plus size={16} />
          Add Customer
        </button>

      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* ========================================
          SUMMARY CARDS
      ======================================== */}

      <section className="admin-summary-grid">

        <div className="admin-summary-card">

          <div className="admin-summary-icon">
            <Users size={20} />
          </div>

          <div>
            <span>Total Customers</span>

            <strong>
              {loading
                ? "—"
                : totalCustomers.toLocaleString()}
            </strong>

            <small>
              Registered customers
            </small>
          </div>

        </div>

        <div className="admin-summary-card">

          <div className="admin-summary-icon">
            <Layers size={20} />
          </div>

          <div>
            <span>Customer Segments</span>

            <strong>
              {loading
                ? "—"
                : totalSegments}
            </strong>

            <small>
              Customer groups
            </small>
          </div>

        </div>

        <div className="admin-summary-card">

          <div className="admin-summary-icon">
            <Globe size={20} />
          </div>

          <div>
            <span>Countries</span>

            <strong>
              {loading
                ? "—"
                : totalCountries}
            </strong>

            <small>
              Customer locations
            </small>
          </div>

        </div>

        <div className="admin-summary-card">

          <div className="admin-summary-icon">
            <UserPlus size={20} />
          </div>

          <div>
            <span>New Customers</span>

            <strong>
              {loading
                ? "—"
                : newCustomers}
            </strong>

            <small>
              Signed up recently
            </small>
          </div>

        </div>

      </section>

      {/* ========================================
          SEARCH + FILTERS
      ======================================== */}

      <div className="admin-toolbar">

        <div className="admin-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <select
          value={segmentFilter}
          onChange={(event) =>
            setSegmentFilter(event.target.value)
          }
          className="admin-filter"
        >
          <option value="">
            All Segments
          </option>

          {segments.map((segment) => (
            <option
              key={segment}
              value={segment}
            >
              {segment}
            </option>
          ))}
        </select>

        <select
          value={countryFilter}
          onChange={(event) =>
            setCountryFilter(event.target.value)
          }
          className="admin-filter"
        >
          <option value="">
            All Countries
          </option>

          {countries.map((country) => (
            <option
              key={country}
              value={country}
            >
              {country}
            </option>
          ))}
        </select>

      </div>

      {/* ========================================
          CUSTOMER TABLE
      ======================================== */}

      {!loading && !error && (
        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Customer</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Segment</th>
                <th>Channel</th>
                <th>City</th>
                <th>Country</th>
                <th>Signup Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {filteredCustomers.length === 0 ? (

                <tr>
                  <td
                    colSpan={9}
                    className="admin-empty"
                  >
                    No customers found.
                  </td>
                </tr>

              ) : (

                filteredCustomers.map((customer) => (

                  <tr
                    key={customer.CustomerKey}
                  >

                    <td>
                      <div className="customer-cell">

                        <div className="customer-avatar">
                          {customer.FirstName
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {customer.FirstName}{" "}
                            {customer.LastName}
                          </strong>

                          <small>
                            {customer.CustomerID}
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>
                      {customer.Gender || "-"}
                    </td>

                    <td>
                      {customer.Age ?? "-"}
                    </td>

                    <td>
                      <span className="customer-segment">
                        {customer.CustomerSegment ||
                          "-"}
                      </span>
                    </td>

                    <td>
                      {customer.AcquisitionChannel ||
                        "-"}
                    </td>

                    <td>
                      {customer.City || "-"}
                    </td>

                    <td>
                      {customer.Country || "-"}
                    </td>

                    <td>
                      {customer.SignupDate
                        ? new Date(
                            customer.SignupDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <div className="admin-actions">

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(customer)
                          }
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              customer.CustomerKey
                            )
                          }
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>
      )}

      {/* ========================================
          ADD / EDIT MODAL
      ======================================== */}

      {showForm && (

        <div
          className="admin-modal-overlay"
          onClick={closeForm}
        >

          <div
            className="admin-modal customer-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>
                <span className="panel-kicker">
                  CUSTOMER
                </span>

                <h2>
                  {editingKey === null
                    ? "Add Customer"
                    : "Edit Customer"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-form customer-form"
            >

              <div className="admin-form-grid">

                {/* CUSTOMER ID */}

                <label>
                  Customer ID

                  <input
                    value={form.CustomerID}
                    onChange={(event) =>
                      handleChange(
                        "CustomerID",
                        event.target.value
                      )
                    }
                    disabled={editingKey !== null}
                    required
                  />
                </label>

                {/* FIRST NAME */}

                <label>
                  First Name

                  <input
                    value={form.FirstName}
                    onChange={(event) =>
                      handleChange(
                        "FirstName",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                {/* LAST NAME */}

                <label>
                  Last Name

                  <input
                    value={form.LastName}
                    onChange={(event) =>
                      handleChange(
                        "LastName",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                {/* GENDER */}

                <label>
                  Gender

                  <select
                    value={form.Gender}
                    onChange={(event) =>
                      handleChange(
                        "Gender",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </label>

                {/* AGE */}

                <label>
                  Age

                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={form.Age}
                    onChange={(event) =>
                      handleChange(
                        "Age",
                        event.target.value
                      )
                    }
                  />
                </label>

                {/* SIGNUP DATE */}

                <label>
                  Signup Date

                  <input
                    type="date"
                    value={form.SignupDate}
                    onChange={(event) =>
                      handleChange(
                        "SignupDate",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                {/* SEGMENT */}

                <label>
                  Customer Segment

                  <input
                    value={form.CustomerSegment}
                    onChange={(event) =>
                      handleChange(
                        "CustomerSegment",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Premium"
                  />
                </label>

                {/* ACQUISITION CHANNEL */}

                <label>
                  Acquisition Channel

                  <input
                    value={form.AcquisitionChannel}
                    onChange={(event) =>
                      handleChange(
                        "AcquisitionChannel",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Social Media"
                  />
                </label>

                {/* CITY */}

                <label>
                  City

                  <input
                    value={form.City}
                    onChange={(event) =>
                      handleChange(
                        "City",
                        event.target.value
                      )
                    }
                  />
                </label>

                {/* COUNTRY */}

                <label>
                  Country

                  <input
                    value={form.Country}
                    onChange={(event) =>
                      handleChange(
                        "Country",
                        event.target.value
                      )
                    }
                  />
                </label>

              </div>

              <div className="admin-form-actions">

                <button
                  type="button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingKey === null
                    ? "Add Customer"
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default CustomersAdmin;