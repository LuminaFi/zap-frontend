import { basicEthAddressRegex } from "./constant";

export const isValidWalletAddress = (address: string) => {
  if (!basicEthAddressRegex.test(address)) {
    return false;
  }

  if (/[a-f]/.test(address) && /[A-F]/.test(address)) {
  }

  return true;
};