import api from "./api";
import type { Product, ProductInput } from "../types/product";

const productService = {
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
    product: ProductInput
  ): Promise<void> {
    await api.put(`/products/${productKey}`, product);
  },

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  async remove(productKey: number): Promise<void> {
    await api.delete(`/products/${productKey}`);
  },
};

export default productService;