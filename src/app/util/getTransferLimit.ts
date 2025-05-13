import { Token, TransferLimitResponse } from "../send/types";
import { BACKEND_URL } from "./constant";

export const getTransferLimit = async (token?: Token | null): Promise<TransferLimitResponse> => {
  const url = token ? `${BACKEND_URL}/transfer-limits?token=${token.id}` : `${BACKEND_URL}/transfer-limits`;

  const transferLimitResponse = await fetch(`${url}`, {
    method: "GET",
  });
  return await transferLimitResponse.json();
};