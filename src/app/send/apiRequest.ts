import { BACKEND_URL } from "@/utils/constant";
import { CalculateAmountResponse, Network, Token, TokenPrice, TransferFeeResponse, TransferIDRXPayload } from "./types";

export const calculateStaticQrAmount = async (amount: number, selectedToken: Token | null) => {
  const calculateAmountResponse = await fetch(
    `${BACKEND_URL}/calculate-fees?token=${selectedToken?.id}&amount=${amount}`,
    {
      method: "GET",
    }
  );
  const amountWithFee: TransferFeeResponse =
    await calculateAmountResponse.json();
  if (!amountWithFee || !amountWithFee.success) {
    throw new Error("Failed to calculate amount");
  }

  return `${ amountWithFee.result.amountBeforeFees + amountWithFee.result.totalFeeAmount }`;
};

export const calculateDynamicQrAmount = async (amount: number, selectedToken: Token | null) => {
  const calculateAmountResponse = await fetch(
    `${BACKEND_URL}/calculate-source?token=${selectedToken?.id}&idrxAmount=${amount}`,
    {
      method: "GET",
    }
  );
  const amountWithFee: CalculateAmountResponse =
    await calculateAmountResponse.json();
  if (!amountWithFee || !amountWithFee.success) {
    throw new Error("Failed to calculate amount");
  }

  return `${ amountWithFee.fees.amountBeforeFees + amountWithFee.fees.totalFeeAmount }`;
};

export const transfer = async ({
  recipientAddress,
  idrxAmount,
}: TransferIDRXPayload) => {
  const response = await fetch(`${BACKEND_URL}/meta-transfer`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: recipientAddress,
      idrxAmount: String(idrxAmount),
    }),
  });

  const data = await response.json();

  return {
    success: data.success,
    transferId: data.transferId,
    recipient: data.recipient,
    amount: data.amount,
    transactionHash: data.transactionHash,
  };
};

export const getSupportedNetworks = async (): Promise<Network[]> => {
  try {
    const response = await fetch('https://zap-service-jkce.onrender.com/api/supported-networks', {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch networks: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      const possibleArrays = Object.values(data).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        return possibleArrays[0] as Network[];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching networks:', error);
    return [];
  }
};

export const getTokenPrice = async (token: string): Promise<TokenPrice> => {
  try {
    const response = await fetch(`https://zap-service-jkce.onrender.com/api/token-price/${token}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch token price: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data
  } catch (error) {
    console.error('Error fetching networks:', error);
    throw error;
  }
};

export const getNetworkTokens = async (networkId: string): Promise<Token[]> => {
  try {
    const response = await fetch(`https://zap-service-jkce.onrender.com/api/network/${networkId}/tokens`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tokens: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && data.tokens) {
      return data.tokens;
    } else if (data && typeof data === 'object') {
      const possibleArrays = Object.values(data).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        return possibleArrays[0] as Token[];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
};