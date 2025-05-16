import { ApiResponse } from "./types";

export const getTransaction = async (userAddress: string, queryParams: string) => {
  const response = await fetch(`https://zap-service-jkce.onrender.com/api/transactions/${userAddress}?${queryParams}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch transactions');
  }

  return data;
}

export const getBalance = async (userAddress: string) => {
  const response = await fetch(`https://zap-service-jkce.onrender.com/api/idrx-balance/${userAddress}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch balance: ${response.status}`);
  }

  const data = await response.json();

  return data;
}