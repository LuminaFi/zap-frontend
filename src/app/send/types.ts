export type QRTypes = "static" | "dynamic";
export type AddressType = `0x${string}`;

export interface SendData {
  address: AddressType;
  amount: number;
}

export interface TransferLimitRecommendation {
  message: string;
  healthStatus: string;
  healthDescription: string;
}

export interface TransferLimitResponse {
  success: boolean;
  reserve: string;
  minTransferAmount: string;
  recommendedMinAmount: string;
  maxTransferAmount: string;
  recommendedMaxAmount: string;
  reserveUtilizationPercentage: string;
  healthStatus: string;
  recommendations: TransferLimitRecommendation;
}

export interface TransferFee {
  token: string;
  tokenSymbol: string;
  priceUsd: number;
  priceIdr: number;
  adminFeePercentage: number;
  adminFeeAmount: number;
  spreadFeePercentage: number;
  spreadFeeAmount: number;
  totalFeePercentage: number;
  totalFeeAmount: number;
  amountBeforeFees: number;
  amountAfterFees: number;
  exchangeRate: number;
  timestamp: number;
  adminFeePercentageFormatted: string;
  spreadFeePercentageFormatted: string;
  totalFeePercentageFormatted: string;
}

export interface calculateAmountResponse {
  success: boolean;
  token: string;
  sourceAmount: number;
  idrxAmount: number;
  idrxAmountFormatted: string;
  fees: TransferFee;
}

export type TransferIDRXPayload = {
  recipientAddress: AddressType;
  idrxAmount: number;
};

export type TransferIDRXResponse = {
  success: boolean;
  transferId: string;
  recipient: string;
  amount: string;
  transactionHash: string;
};
