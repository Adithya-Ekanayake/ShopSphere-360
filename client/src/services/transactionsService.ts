import api from "./api";

import type {
  TransactionKPI,
  Transaction,
  TransactionByMethod,
} from "../types/transactions";

const transactionsService = {
  async getKPIs(): Promise<TransactionKPI> {
    const response = await api.get("/transactions/kpis");

    return response.data?.data ?? {
      TotalTransactions: 0,
      TotalPaymentAmount: 0,
      TotalTransactionFees: 0,
      AverageTransactionValue: 0,
    };
  },

  async getTransactions(): Promise<Transaction[]> {
    const response = await api.get("/transactions");

    return response.data?.data ?? [];
  },

  async getTransactionsByMethod(): Promise<TransactionByMethod[]> {
    const response = await api.get("/transactions/methods");

    return response.data?.data ?? [];
  },
};

export default transactionsService;