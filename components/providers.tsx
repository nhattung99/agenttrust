"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Address } from "viem";
import { type WalletProvider } from "@/lib/genlayer/client";
import { connectWallet, walletErrorMessage } from "@/lib/genlayer/wallet";

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
  const connectingRef = useRef(false);
  useEffect(() => {
    const p = provider;
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
  }, [queryClient, provider]);
  async function connect() {
    if (connectingRef.current) return;
    connectingRef.current = true;
    setError(undefined);
    setConnecting(true);
    try {
      const p = window.ethereum;
      if (!p)
        throw new Error(
          "Install an EIP-1193 wallet such as MetaMask in Chrome, unlock it, and reload this page.",
        );
      const result = await connectWallet(p);
      setChainId(result.chainId);
      setProvider(p);
      setAddress(result.address);
      queryClient.clear();
    } catch (e) {
      setAddress(undefined);
      setProvider(undefined);
      setChainId(undefined);
      setError(walletErrorMessage(e));
    } finally {
      connectingRef.current = false;
      setConnecting(false);
    }
  }
  function disconnect() {
    setAddress(undefined);
    setProvider(undefined);
    setChainId(undefined);
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
