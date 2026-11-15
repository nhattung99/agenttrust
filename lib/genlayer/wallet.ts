import { studionet } from "genlayer-js/chains";
import { isAddress, type Address } from "viem";
import type { WalletProvider } from "./client";

type ProviderFailure = { code?: number; message?: string };
export function providerFailure(error: unknown): ProviderFailure {
  const queue: unknown[] = [error];
  const seen = new Set<unknown>();
  let message: string | undefined;
  let code: number | undefined;
  const actionable = new Set([
    4001, 4100, 4200, 4900, 4901, 4902, -32002, -32601,
  ]);
  for (let i = 0; queue.length && i < 12; i++) {
    const value = queue.shift();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    if (typeof value === "string") {
      message ??= value;
      continue;
    }
    if (typeof value !== "object") continue;
    const item = value as Record<string, unknown>;
    if (typeof item.message === "string") message ??= item.message;
    if (typeof item.rpcCode === "number") code = item.rpcCode;
    else if (
      typeof item.code === "number" &&
      (code === undefined || !actionable.has(code))
    )
      code = item.code;
    for (const key of ["cause", "error", "originalError", "data"])
      if (item[key]) queue.push(item[key]);
  }
  return { code, message: message?.replace(/[\r\n\t]+/g, " ").slice(0, 350) };
}
export class WalletConnectionError extends Error {
  constructor(
    public readonly stage: string,
    public readonly original: unknown,
  ) {
    super(walletErrorMessage(original, stage));
  }
}
export function walletErrorMessage(
  error: unknown,
  stage = "Connect wallet",
): string {
  if (error instanceof WalletConnectionError) return error.message;
  const { code, message } = providerFailure(error);
  const suffix = code === undefined ? "" : ` (code ${code})`;
  let detail =
    message ||
    "The wallet did not provide an error message. Unlock your wallet and retry.";
  if (code === 4001)
    detail =
      "Request declined in your wallet. Reconnect when you are ready to approve it.";
  else if (code === -32002)
    detail =
      "A wallet request is already open. Open the wallet extension and finish or cancel that request before retrying.";
  else if (code === 4100)
    detail =
      "This site is not authorized. Open your wallet permissions and connect this site.";
  else if (code === 4200 || code === -32601)
    detail =
      "This wallet does not support the requested method. Try the MetaMask extension in Chrome.";
  else if (code === 4900 || code === 4901)
    detail =
      "The wallet cannot reach the network. Unlock it, check its connection, and retry.";
  return `${stage}: ${detail}${suffix}`;
}
async function step<T>(stage: string, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new WalletConnectionError(stage, error);
  }
}
export async function ensureStudionet(provider: WalletProvider) {
  const chainId = `0x${studionet.id.toString(16)}`;
  const current = await step("Read wallet network", () =>
    provider.request({ method: "eth_chainId" }),
  );
  if (Number(current) !== studionet.id) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    } catch (error) {
      // Only the documented unknown-chain error permits adding the SDK preset.
      if (providerFailure(error).code !== 4902)
        throw new WalletConnectionError("Switch to Studionet", error);
      await step("Add Studionet", () =>
        provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId,
              chainName: studionet.name,
              nativeCurrency: studionet.nativeCurrency,
              rpcUrls: [...studionet.rpcUrls.default.http],
              ...(studionet.blockExplorers?.default.url
                ? { blockExplorerUrls: [studionet.blockExplorers.default.url] }
                : {}),
            },
          ],
        }),
      );
      await step("Switch to Studionet", () =>
        provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        }),
      );
    }
  }
  const finalId = await step("Verify wallet network", () =>
    provider.request({ method: "eth_chainId" }),
  );
  if (Number(finalId) !== studionet.id)
    throw new WalletConnectionError(
      "Verify wallet network",
      new Error(
        `Switch to ${studionet.name} in your wallet before continuing.`,
      ),
    );
  return studionet.id;
}
export async function connectWallet(
  provider: WalletProvider,
): Promise<{ address: Address; chainId: number }> {
  const accounts: unknown = await step("Select wallet account", () =>
    provider.request({ method: "eth_requestAccounts" }),
  );
  if (
    !Array.isArray(accounts) ||
    typeof accounts[0] !== "string" ||
    !isAddress(accounts[0])
  )
    throw new WalletConnectionError(
      "Select wallet account",
      new Error("No valid wallet account was selected."),
    );
  const chainId = await ensureStudionet(provider);
  // Re-read permissions after network prompts: an account can change while open.
  const latest: unknown = await step("Verify selected account", () =>
    provider.request({ method: "eth_accounts" }),
  );
  if (
    !Array.isArray(latest) ||
    typeof latest[0] !== "string" ||
    !isAddress(latest[0])
  )
    throw new WalletConnectionError(
      "Verify selected account",
      new Error("Wallet account access was removed. Connect again."),
    );
  return { address: latest[0] as Address, chainId };
}
