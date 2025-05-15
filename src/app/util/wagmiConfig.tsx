import { mainnet, sepolia } from "viem/chains";
import { createConfig, http, injected } from "wagmi";
import { metaMask } from "wagmi/connectors";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  connectors: [injected(), metaMask()],
});
