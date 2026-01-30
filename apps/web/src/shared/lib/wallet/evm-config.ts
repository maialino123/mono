import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, http } from "wagmi";
import { sepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const evmConfig = getDefaultConfig({
  appName: "CyberK Flow",
  projectId,
  chains: [sepolia],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [sepolia.id]: http(),
  },
});
