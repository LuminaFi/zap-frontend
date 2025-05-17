import { TransactionDetails } from "@/app/transaction/[id]/types";
import { formatAbbreviatedNumber } from "./formatNumber";

export const getTransactionFormattedAmount = (transaction: TransactionDetails) => {
  if (!transaction) return '';
  
  if (transaction.valueInIDR) {
    return formatAbbreviatedNumber(transaction.valueInIDR);
  }
  
  return formatAbbreviatedNumber(transaction.valueInEther || transaction.value);
};