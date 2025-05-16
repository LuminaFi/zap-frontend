import { Params } from "next/dist/server/request/params";

export const getTransactionDetail = async (params: Params) => {
  const response = await fetch(`https://zap-service-jkce.onrender.com/api/transaction/${params.id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch transaction');
  }

  return data.transaction;
}