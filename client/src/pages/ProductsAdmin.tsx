import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Pencil,
  Plus,
  X,
  Search,
  Package,
  Boxes,
  DollarSign,
  TrendingUp,
  RotateCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

import productService from "../services/productService";
import type { Product, ProductInput } from "../types/product";

import "../styles/dashboard.css";
import "../styles/admin.css";

const ProductsAdmin = () => {
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

  const emptyForm: ProductInput = {
    ProductID: "",
    ProductName: "",
    Category: "",
    Subcategory: "",
    Brand: "",
    Supplier: "",
    UnitCost: "",
    UnitPrice: "",
  };

  // =========================================================
  // STATE
  // =========================================================

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // FETCH PRODUCTS (REAL-TIME)
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Unable to load real-time products data. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        String(product.ProductID ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(product.ProductName ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(product.Category ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(product.Subcategory ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(product.Brand ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(product.Supplier ?? "")
          .toLowerCase()
          .includes(searchTerm);

      const matchesCategory =
        !categoryFilter || product.Category === categoryFilter;

      const matchesBrand =
        !brandFilter || product.Brand === brandFilter;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, search, categoryFilter, brandFilter]);

  // =========================================================
  // UNIQUE CATEGORIES & BRANDS
  // =========================================================

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.Category) set.add(p.Category);
    });
    return Array.from(set);
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.Brand) set.add(p.Brand);
    });
    return Array.from(set);
  }, [products]);

  // =========================================================
  // REAL-TIME KPI TOTALS
  // =========================================================

  const totalProductsCount = products.length;

  const totalUnitsSold = useMemo(() => {
    return products.reduce(
      (sum, p) => sum + Number(p.UnitsSold || 0),
      0
    );
  }, [products]);

  const totalRevenue = useMemo(() => {
    return products.reduce(
      (sum, p) => sum + Number(p.TotalRevenue || 0),
      0
    );
  }, [products]);

  const averageMargin = useMemo(() => {
    if (products.length === 0) return 0;
    const validMargins = products.map((p) => {
      const price = Number(p.UnitPrice || 0);
      const cost = Number(p.UnitCost || 0);
      return price > 0 ? ((price - cost) / price) * 100 : 0;
    });
    const sum = validMargins.reduce((a, b) => a + b, 0);
    return sum / validMargins.length;
  }, [products]);

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatCurrency = (val: number | string) => {
    const num = Number(val || 0);
    return `LKR ${num.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================================
  // HANDLERS
  // =========================================================

  const handleAdd = () => {
    setEditingKey(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  };

  const handleEdit = (product: Product) => {
    setEditingKey(product.ProductKey);
    setForm({
      ProductID: product.ProductID ?? "",
      ProductName: product.ProductName ?? "",
      Category: product.Category ?? "",
      Subcategory: product.Subcategory ?? "",
      Brand: product.Brand ?? "",
      Supplier: product.Supplier ?? "",
      UnitCost: product.UnitCost != null ? String(product.UnitCost) : "",
      UnitPrice: product.UnitPrice != null ? String(product.UnitPrice) : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (productKey: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? Real-time database records will be permanently removed."
    );

    if (!confirmed) return;

    try {
      setError("");
      await productService.remove(productKey);
      await fetchProducts();
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to delete product. It may be referenced by existing orders."
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingKey(null);
    setForm(emptyForm);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        UnitCost: Number(form.UnitCost || 0),
        UnitPrice: Number(form.UnitPrice || 0),
      };

      if (editingKey === null) {
        await productService.create(payload);
      } else {
        await productService.update(editingKey, payload);
      }

      await fetchProducts();
      setShowForm(false);
      setEditingKey(null);
      setForm(emptyForm);
    } catch (err: any) {
      console.error("Failed to save product:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to save product to database. Please check input values."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading && products.length === 0) {
    return (
      <div className="admin-loading" style={{ marginTop: "32px" }}>
        <Loader2 className="admin-spinner" />
        <p>Loading real-time products data...</p>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="admin-header">
        <div>
          <p className="panel-kicker">PRODUCTS</p>
          <h1>Products Administration</h1>
          <p className="admin-page-description">
            Live catalog management, cost tracking, pricing, and sales performance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="admin-btn admin-btn-primary"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* =====================================================
          REAL-TIME KPI CARDS
          ===================================================== */}

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Package size={20} />
          </div>
          <div className="kpi-content">
            <span>Total Products</span>
            <strong>{totalProductsCount.toLocaleString()}</strong>
            <small>Live catalog count</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Boxes size={20} />
          </div>
          <div className="kpi-content">
            <span>Categories</span>
            <strong>{categories.length.toLocaleString()}</strong>
            <small>{brands.length} unique brands</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <DollarSign size={20} />
          </div>
          <div className="kpi-content">
            <span>Product Revenue</span>
            <strong>
              {totalRevenue > 0 ? formatCurrency(totalRevenue) : "LKR 0.00"}
            </strong>
            <small>{totalUnitsSold.toLocaleString()} units sold</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-content">
            <span>Avg Gross Margin</span>
            <strong>{averageMargin.toFixed(1)}%</strong>
            <small>Live profitability</small>
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
          PRODUCT LIST PANEL
          ===================================================== */}

      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-header">
          <div>
            <span className="panel-kicker">PRODUCT MANAGEMENT</span>
            <h2>Product Catalog</h2>
            <p>Real-time list of products from database.</p>
          </div>

          <Package size={20} />
        </div>

        <div className="panel-body">
          {/* TOOLBAR */}
          <div className="admin-toolbar">
            {/* SEARCH */}
            <div className="admin-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search products by ID, name, brand, category..."
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

            {/* CATEGORY FILTER */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-filter"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* BRAND FILTER */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="admin-filter"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* PRODUCT TABLE */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>Product ID</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Brand / Supplier</th>
                  <th>Unit Cost</th>
                  <th>Unit Price</th>
                  <th>Gross Margin</th>
                  <th>Units Sold</th>
                  <th style={{ textAlign: "right", width: "90px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="admin-empty">
                      <Package size={32} />
                      <strong>No products found</strong>
                      <span>
                        Try adjusting your search criteria or add a new product.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const price = Number(product.UnitPrice || 0);
                    const cost = Number(product.UnitCost || 0);
                    const margin =
                      price > 0 ? (((price - cost) / price) * 100).toFixed(1) : "0.0";
                    const unitsSold = Number(product.UnitsSold || 0);

                    return (
                      <tr key={product.ProductKey}>
                        {/* PRODUCT ID */}
                        <td className="product-id">
                          {product.ProductID || "—"}
                        </td>

                        {/* NAME & SUBCATEGORY */}
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">
                              <Package size={15} />
                            </div>
                            <div>
                              <strong>{product.ProductName}</strong>
                              <small>
                                {product.Subcategory || "General"}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY */}
                        <td>
                          <span className="category-badge">
                            {product.Category}
                          </span>
                        </td>

                        {/* BRAND / SUPPLIER */}
                        <td>
                          <div>
                            <span style={{ fontWeight: 600, display: "block", fontSize: "12px" }}>
                              {product.Brand || "—"}
                            </span>
                            <small style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
                              {product.Supplier ? `Supplier: ${product.Supplier}` : ""}
                            </small>
                          </div>
                        </td>

                        {/* UNIT COST */}
                        <td>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {formatCurrency(product.UnitCost)}
                          </span>
                        </td>

                        {/* UNIT PRICE */}
                        <td>
                          <strong style={{ color: "var(--text)" }}>
                            {formatCurrency(product.UnitPrice)}
                          </strong>
                        </td>

                        {/* MARGIN */}
                        <td>
                          <span
                            className="customer-segment"
                            style={{
                              background:
                                Number(margin) >= 30
                                  ? "rgba(16, 185, 129, 0.12)"
                                  : Number(margin) > 0
                                  ? "rgba(37, 99, 235, 0.12)"
                                  : "rgba(239, 68, 68, 0.12)",
                              color:
                                Number(margin) >= 30
                                  ? "#059669"
                                  : Number(margin) > 0
                                  ? "var(--primary)"
                                  : "#dc2626",
                            }}
                          >
                            {margin}%
                          </span>
                        </td>

                        {/* UNITS SOLD */}
                        <td>
                          <span style={{ fontWeight: 600, color: "var(--text)" }}>
                            {unitsSold.toLocaleString()} units
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td style={{ textAlign: "right" }}>
                          <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => handleEdit(product)}
                              className="admin-action-edit"
                              title="Edit product"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(product.ProductKey)}
                              className="admin-action-delete"
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
              Showing <strong>{filteredProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> live products
            </p>

            <button
              type="button"
              onClick={fetchProducts}
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
                <span className="panel-kicker">PRODUCT RECORD</span>
                <h2>
                  {editingKey === null
                    ? "Add New Product"
                    : "Edit Product"}
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
                {/* PRODUCT ID */}
                <label>
                  <span>
                    Product ID {editingKey === null && <em>*</em>}
                  </span>
                  <input
                    type="text"
                    name="ProductID"
                    value={form.ProductID}
                    onChange={handleInputChange}
                    placeholder="e.g. PROD-1001"
                    required
                    disabled={editingKey !== null}
                  />
                </label>

                {/* PRODUCT NAME */}
                <label>
                  <span>
                    Product Name <em>*</em>
                  </span>
                  <input
                    type="text"
                    name="ProductName"
                    value={form.ProductName}
                    onChange={handleInputChange}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    required
                  />
                </label>

                {/* CATEGORY */}
                <label>
                  <span>
                    Category <em>*</em>
                  </span>
                  <input
                    type="text"
                    name="Category"
                    value={form.Category}
                    onChange={handleInputChange}
                    placeholder="e.g. Electronics, Footwear, etc."
                    required
                  />
                </label>

                {/* SUBCATEGORY */}
                <label>
                  <span>Subcategory</span>
                  <input
                    type="text"
                    name="Subcategory"
                    value={form.Subcategory ?? ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Audio, Running, etc."
                  />
                </label>

                {/* BRAND */}
                <label>
                  <span>Brand</span>
                  <input
                    type="text"
                    name="Brand"
                    value={form.Brand ?? ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Sony, Nike, Apple"
                  />
                </label>

                {/* SUPPLIER */}
                <label>
                  <span>Supplier</span>
                  <input
                    type="text"
                    name="Supplier"
                    value={form.Supplier ?? ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Apex Global Distributors"
                  />
                </label>

                {/* UNIT COST */}
                <label>
                  <span>
                    Unit Cost (LKR) <em>*</em>
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="UnitCost"
                    value={form.UnitCost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </label>

                {/* UNIT PRICE */}
                <label>
                  <span>
                    Unit Price (LKR) <em>*</em>
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="UnitPrice"
                    value={form.UnitPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
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
                    : editingKey === null
                    ? "Create Product"
                    : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsAdmin;