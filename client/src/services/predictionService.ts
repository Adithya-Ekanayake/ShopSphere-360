import api from "./api";
import type {
  RevenueForecastResponse,
  ProductDemandForecastResponse,
  ForecastMetadataResponse,
} from "../types/prediction";

export const predictionService = {
  async getRevenueForecast(): Promise<RevenueForecastResponse> {
    const response = await api.get("/predictions/revenue");
    return response.data.data;
  },

  async getProductDemandForecast(): Promise<ProductDemandForecastResponse> {
    const response = await api.get("/predictions/product-demand");
    return response.data.data;
  },

  async getMetadata(): Promise<ForecastMetadataResponse> {
    const response = await api.get("/predictions/metadata");
    return response.data;
  },
};

export default predictionService;