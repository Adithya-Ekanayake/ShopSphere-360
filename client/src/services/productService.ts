import api from "./api";
import type { Product, ProductInput } from "../types/product";

export const productService = {
  // ==========================================
  // GET ALL PRODUCTS
  // ==========================================

  async getAll(): Promise<Product[]> {
    const response = await api.get("/products");

    return response.data.data ?? [];
  },

  // ==========================================
  // GET SINGLE PRODUCT
  // ==========================================

  async getOne(productKey: number): Promise<Product> {
    const response = await api.get(`/products/${productKey}`);

    return response.data.data;
  },

  // ==========================================
  // CREATE PRODUCT
  // ==========================================

  async create(product: ProductInput): Promise<void> {
    await api.post("/products", product);
  },

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  async update(
    productKey: number,
    product: Omit<ProductInput, "ProductID"> | ProductInput
  ): Promise<void> {
    await api.put(`/products/${productKey}`, product);
  },

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  async remove(productKey: number): Promise<void> {
    await api.delete(`/products/${productKey}`);
  },

  // Backward compatibility aliases
  getProducts(): Promise<Product[]> {
    return this.getAll();
  },
  getProduct(productKey: number): Promise<Product> {
    return this.getOne(productKey);
  },
  createProduct(product: ProductInput): Promise<void> {
    return this.create(product);
  },
  updateProduct(productKey: number, product: ProductInput): Promise<void> {
    return this.update(productKey, product);
  },
  deleteProduct(productKey: number): Promise<void> {
    return this.remove(productKey);
  },
};

export default productService;