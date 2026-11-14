"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Address } from "viem";
import {
  network,
  walletClient,
  type WalletProvider,
} from "@/lib/genlayer/client";

declare global {
  interface Window {
    ethereum?: WalletProvider & {
      on?: (event: string, cb: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        cb: (...args: unknown[]) => void,
      ) => void;
    };
  }
}
type WalletState = {
  address?: Address;
  provider?: WalletProvider;
  chainId?: number;
  connecting: boolean;
  error?: string;
  connect: () => Promise<void>;
  disconnect: () => void;
};
const Wallet = createContext<WalletState>({
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});
export function useWallet() {
  return useContext(Wallet);
}
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [address, setAddress] = useState<Address>();
  const [chainId, setChainId] = useState<number>();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string>();
  const [provider, setProvider] = useState<WalletProvider>();
  useEffect(() => {
    const p = window.ethereum;
    if (!p) return;
    const accounts = (...args: unknown[]) => {
      const list = args[0];
      setAddress(
        Array.isArray(list) && typeof list[0] === "string"
          ? (list[0] as Address)
          : undefined,
      );
      queryClient.clear();
    };
    const chain = (...args: unknown[]) => {
      setChainId(Number(args[0]));
      queryClient.clear();
    };
    p.on?.("accountsChanged", accounts);
    p.on?.("chainChanged", chain);
    return () => {
      p.removeListener?.("accountsChanged", accounts);
      p.removeListener?.("chainChanged", chain);
    };
  }, [queryClient]);
  async function connect() {
    setError(undefined);
    setConnecting(true);
    try {
      const p = window.ethereum;
      if (!p)
        throw new Error(
          "Install an EIP-1193 MetaMask wallet with GenLayer Snap support to connect.",
        );
      const result: unknown = await p.request({
        method: "eth_requestAccounts",
      });
      if (!Array.isArray(result) || typeof result[0] !== "string")
        throw new Error("No wallet account was selected.");
      const account = result[0] as Address;
      await walletClient(account, p).connect("studionet");
      const id: unknown = await p.request({ method: "eth_chainId" });
      setChainId(Number(id));
      if (Number(id) !== network.id)
        throw new Error(`Switch to ${network.name} in your wallet.`);
      setProvider(p);
      setAddress(account);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet connection failed");
    } finally {
      setConnecting(false);
    }
  }
  function disconnect() {
    setAddress(undefined);
    setError(undefined);
    queryClient.clear();
  }
  return (
    <QueryClientProvider client={queryClient}>
      <Wallet.Provider
        value={{
          address,
          provider,
          chainId,
          connecting,
          error,
          connect,
          disconnect,
        }}
      >
        {children}
      </Wallet.Provider>
    </QueryClientProvider>
  );
}
