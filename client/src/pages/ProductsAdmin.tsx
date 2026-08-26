import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Pencil,
  Plus,
  X,
  Search,
  Package,
  RefreshCw,
} from "lucide-react";

import productService from "../services/productService";
import type {
  Product,
  ProductInput,
} from "../types/product";

import "../styles/dashboard.css";
import "../styles/admin.css";

const emptyForm: ProductInput = {
  ProductID: "",
  ProductName: "",
  Category: "",
  Subcategory: "",
  Brand: "",
  Supplier: "",
  UnitCost: 0,
  UnitPrice: 0,
};

const ProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<number | null>(null);

  const [form, setForm] =
    useState<ProductInput>(emptyForm);

  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await productService.getAll();

      setProducts(data);
    } catch (err) {
      console.error(
        "Failed to load products:",
        err
      );

      setError(
        "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredProducts = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.ProductID
          ?.toLowerCase()
          .includes(search) ||
        product.ProductName
          ?.toLowerCase()
          .includes(search) ||
        product.Category
          ?.toLowerCase()
          .includes(search) ||
        product.Subcategory
          ?.toLowerCase()
          .includes(search) ||
        product.Brand
          ?.toLowerCase()
          .includes(search) ||
        product.Supplier
          ?.toLowerCase()
          .includes(search)
      );
    });
  }, [products, searchTerm]);

  // ==========================================
  // CREATE FORM
  // ==========================================

  const openCreateForm = () => {
    setEditingKey(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  // ==========================================
  // EDIT FORM
  // ==========================================

  const openEditForm = (product: Product) => {
    setEditingKey(product.ProductKey);

    setForm({
      ProductID: product.ProductID,
      ProductName: product.ProductName,
      Category: product.Category,
      Subcategory:
        product.Subcategory ?? "",
      Brand:
        product.Brand ?? "",
      Supplier:
        product.Supplier ?? "",
      UnitCost: Number(product.UnitCost),
      UnitPrice: Number(product.UnitPrice),
    });

    setShowForm(true);
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {
    setShowForm(false);
    setEditingKey(null);
    setForm({ ...emptyForm });
  };

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (
    field: keyof ProductInput,
    value: string | number
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !form.ProductID.trim() ||
      !form.ProductName.trim() ||
      !form.Category.trim()
    ) {
      alert(
        "Please fill in all required fields."
      );

      return;
    }

    if (
      Number(form.UnitCost) < 0 ||
      Number(form.UnitPrice) < 0
    ) {
      alert(
        "Unit cost and unit price cannot be negative."
      );

      return;
    }

    try {
      setSaving(true);

      if (editingKey === null) {
        await productService.create({
          ...form,
          UnitCost: Number(form.UnitCost),
          UnitPrice: Number(form.UnitPrice),
        });
      } else {
        await productService.update(
          editingKey,
          {
            ...form,
            UnitCost: Number(form.UnitCost),
            UnitPrice: Number(form.UnitPrice),
          }
        );
      }

      closeForm();

      await loadProducts();
    } catch (err) {
      console.error(
        "Failed to save product:",
        err
      );

      alert(
        "Failed to save product. Please check the server."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (
    productKey: number
  ) => {
    const confirmed = window.confirm(
      "Delete this product?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await productService.remove(productKey);

      await loadProducts();
    } catch (err) {
      console.error(
        "Failed to delete product:",
        err
      );

      alert(
        "Failed to delete product. It may have related orders, returns, or reviews."
      );
    }
  };

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (
    value: number | string
  ) => {
    return `LKR ${Number(value).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-page">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="admin-header">

        <div className="admin-title">

          <div className="admin-title-icon">
            <Package size={22} />
          </div>

          <div>
            <span className="admin-kicker">
              CATALOG
            </span>

            <h1>Products</h1>

            <p>
              Manage products, pricing and product
              information.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={openCreateForm}
        >
          <Plus size={17} />
          Add Product
        </button>

      </div>

      {/* ====================================== */}
      {/* TOOLBAR */}
      {/* ====================================== */}

      <div className="admin-toolbar">

        <div className="admin-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              className="admin-search-clear"
            >
              <X size={15} />
            </button>
          )}

        </div>

        <div className="admin-toolbar-right">

          <span className="admin-count">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}
          </span>

          <button
            type="button"
            className="admin-refresh"
            onClick={loadProducts}
            title="Refresh products"
          >
            <RefreshCw size={16} />
          </button>

        </div>

      </div>

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div className="admin-error-box">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadProducts}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ====================================== */}
      {/* LOADING */}
      {/* ====================================== */}

      {loading && (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>
            Loading products...
          </span>
        </div>
      )}

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      {!loading && !error && (
        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Brand</th>
                <th>Supplier</th>
                <th>Unit Cost</th>
                <th>Unit Price</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredProducts.length === 0 ? (

                <tr>
                  <td
                    colSpan={9}
                    className="admin-empty"
                  >
                    <Package size={32} />

                    <strong>
                      {searchTerm
                        ? "No products found"
                        : "No products available"}
                    </strong>

                    <span>
                      {searchTerm
                        ? "Try a different search term."
                        : "Add your first product to get started."}
                    </span>
                  </td>
                </tr>

              ) : (

                filteredProducts.map(
                  (product) => (
                    <tr
                      key={
                        product.ProductKey
                      }
                    >

                      <td>
                        <span className="product-id">
                          {product.ProductID}
                        </span>
                      </td>

                      <td>
                        <div className="product-name">
                          <strong>
                            {
                              product.ProductName
                            }
                          </strong>
                        </div>
                      </td>

                      <td>
                        <span className="category-badge">
                          {
                            product.Category
                          }
                        </span>
                      </td>

                      <td>
                        {
                          product.Subcategory ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          product.Brand ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          product.Supplier ||
                          "-"
                        }
                      </td>

                      <td>
                        <span className="price">
                          {formatCurrency(
                            product.UnitCost
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="price price-selling">
                          {formatCurrency(
                            product.UnitPrice
                          )}
                        </span>
                      </td>

                      <td>

                        <div className="admin-actions">

                          <button
                            type="button"
                            className="admin-action-edit"
                            onClick={() =>
                              openEditForm(
                                product
                              )
                            }
                            title="Edit product"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            className="admin-action-delete"
                            onClick={() =>
                              handleDelete(
                                product.ProductKey
                              )
                            }
                            title="Delete product"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )

              )}

            </tbody>

          </table>

        </div>
      )}

      {/* ====================================== */}
      {/* MODAL */}
      {/* ====================================== */}

      {showForm && (
        <div
          className="admin-modal-overlay"
          onClick={closeForm}
        >

          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>
                <span className="admin-kicker">
                  PRODUCT
                </span>

                <h2>
                  {editingKey === null
                    ? "Add Product"
                    : "Edit Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="admin-modal-close"
              >
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-form"
            >

              {/* Product ID */}

              <label>
                <span>
                  Product ID
                  <em>*</em>
                </span>

                <input
                  type="text"
                  value={
                    form.ProductID
                  }
                  onChange={(event) =>
                    handleChange(
                      "ProductID",
                      event.target.value
                    )
                  }
                  disabled={
                    editingKey !== null
                  }
                  placeholder="e.g. PROD-001"
                  required
                />
              </label>

              {/* Product Name */}

              <label>
                <span>
                  Product Name
                  <em>*</em>
                </span>

                <input
                  type="text"
                  value={
                    form.ProductName
                  }
                  onChange={(event) =>
                    handleChange(
                      "ProductName",
                      event.target.value
                    )
                  }
                  placeholder="Enter product name"
                  required
                />
              </label>

              {/* Category */}

              <label>
                <span>
                  Category
                  <em>*</em>
                </span>

                <input
                  type="text"
                  value={
                    form.Category
                  }
                  onChange={(event) =>
                    handleChange(
                      "Category",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Electronics"
                  required
                />
              </label>

              {/* Subcategory */}

              <label>
                <span>
                  Subcategory
                </span>

                <input
                  type="text"
                  value={
                    form.Subcategory ??
                    ""
                  }
                  onChange={(event) =>
                    handleChange(
                      "Subcategory",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Smartphones"
                />
              </label>

              {/* Brand */}

              <label>
                <span>
                  Brand
                </span>

                <input
                  type="text"
                  value={
                    form.Brand ?? ""
                  }
                  onChange={(event) =>
                    handleChange(
                      "Brand",
                      event.target.value
                    )
                  }
                  placeholder="Enter brand"
                />
              </label>

              {/* Supplier */}

              <label>
                <span>
                  Supplier
                </span>

                <input
                  type="text"
                  value={
                    form.Supplier ?? ""
                  }
                  onChange={(event) =>
                    handleChange(
                      "Supplier",
                      event.target.value
                    )
                  }
                  placeholder="Enter supplier"
                />
              </label>

              {/* Prices */}

              <div className="admin-form-row">

                <label>
                  <span>
                    Unit Cost
                    <em>*</em>
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={
                      form.UnitCost
                    }
                    onChange={(event) =>
                      handleChange(
                        "UnitCost",
                        Number(
                          event.target.value
                        )
                      )
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Unit Price
                    <em>*</em>
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={
                      form.UnitPrice
                    }
                    onChange={(event) =>
                      handleChange(
                        "UnitPrice",
                        Number(
                          event.target.value
                        )
                      )
                    }
                    required
                  />
                </label>

              </div>

              {/* Actions */}

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-btn"
                  onClick={closeForm}
                  disabled={saving}
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
                    ? "Add Product"
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

export default ProductsAdmin;