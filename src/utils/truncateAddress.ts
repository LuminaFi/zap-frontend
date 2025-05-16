export const truncateAddress = (address: string) => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
};