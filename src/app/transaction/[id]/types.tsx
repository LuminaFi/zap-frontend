export interface TransactionDetails {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueInEther?: string;
  valueInIDR?: string;
  timestamp: string | number;
  formattedDate?: string;
  status?: string;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber: number;
  token: string;
}