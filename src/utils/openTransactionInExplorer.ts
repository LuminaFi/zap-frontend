import { TransactionDetails } from "@/app/transaction/[id]/types";

export const openTransactionInExplorer = (transaction: TransactionDetails | undefined) => {
  window.open(`https://sepolia-blockscout.lisk.com/tx/${transaction?.hash}`, '_blank');
};