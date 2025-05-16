import { defaultConfig } from "@xellar/kit";
import { sepolia } from "viem/chains";
import { Config } from "wagmi";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;
const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID;

export const config = defaultConfig({
  appName: "Xellar",
  walletConnectProjectId,
  xellarAppId,
  xellarEnv: "sandbox",
  chains: [sepolia],
  ssr: true
}) as Config;