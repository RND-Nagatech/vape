import axios from "axios";
import type { TransactionInput, TransactionResponse } from "../types/transaction";

export const saveTransaction = async (
  baseUrl: string,
  token: string,
  payload: TransactionInput,
): Promise<TransactionResponse> => {
  const response = await axios.post(
    `${baseUrl.replace(/\/$/, "")}/penjualan`,
    payload,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    },
  );

  return response.data?.data || response.data;
};
