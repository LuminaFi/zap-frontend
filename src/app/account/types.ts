export interface ApiTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  valueInEther?: string;
  timestamp: string | number;
  formattedDate?: string;
  status?: string;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber: number;
  isContractInteraction?: boolean;
  functionName?: string | null;
  methodId?: string | null;
  token: string;
  valueInIDR?: string;
}

export interface TransactionData {
  id: string;
  txAddress: string;
  token: string;
  amount: string;
  type: 'received' | 'sent';
  date: string;
  hash: string;
  valueInIDR: string;
}

export interface ApiResponse {
  success: boolean;
  address: string;
  transactions: ApiTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  summary: {
    totalTransactions: number;
    sentTransactions: number;
    receivedTransactions: number;
    totalSent: string;
    totalReceived: string;
    lastTransaction: string | null;
  };
  error?: string;
}

export type FilterType = 'all' | 'sent' | 'received';
export type DirectionType = 'all' | 'from' | 'to';
export type SortType = 'asc' | 'desc';