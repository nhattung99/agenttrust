import { describe, expect, it, vi } from "vitest";
import { studionet } from "genlayer-js/chains";
import {
  connectWallet,
  ensureStudionet,
  providerFailure,
  walletErrorMessage,
} from "@/lib/genlayer/wallet";
import type { WalletProvider } from "@/lib/genlayer/client";
const account = "0x" + "1".repeat(40);
function provider(request: ReturnType<typeof vi.fn>) {
  return { request } as unknown as WalletProvider;
}

describe("wallet connection regression cases", () => {
  it("connects an EIP-1193 wallet without any Snap or signing request", async () => {
    const request = vi.fn(async ({ method }: { method: string }) =>
      method === "eth_chainId" ? "0xf22f" : [account],
    );
    expect(await connectWallet(provider(request))).toEqual({
      address: account,
      chainId: studionet.id,
    });
    expect(request.mock.calls.map(([arg]) => arg.method)).toEqual([
      "eth_requestAccounts",
      "eth_chainId",
      "eth_chainId",
      "eth_accounts",
    ]);
  });
  it("switches an existing network before trying to add it", async () => {
    let current = "0x1";
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_chainId") return current;
      if (method === "wallet_switchEthereumChain") current = "0xf22f";
      return null;
    });
    await ensureStudionet(provider(request));
    expect(request.mock.calls.map(([arg]) => arg.method)).not.toContain(
      "wallet_addEthereumChain",
    );
  });
  it("adds only the official SDK preset when the wallet does not know the chain", async () => {
    let current = "0x1";
    let added = false;
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_chainId") return current;
      if (method === "wallet_addEthereumChain") {
        added = true;
        return null;
      }
      if (method === "wallet_switchEthereumChain") {
        if (!added)
          throw {
            code: -32603,
            data: { originalError: { code: 4902, message: "Unknown chain" } },
          };
        current = "0xf22f";
      }
      return null;
    });
    await ensureStudionet(provider(request));
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "wallet_addEthereumChain",
        params: [
          expect.objectContaining({
            chainId: "0xf22f",
            rpcUrls: [...studionet.rpcUrls.default.http],
            nativeCurrency: studionet.nativeCurrency,
          }),
        ],
      }),
    );
  });
  it("does not silently add a chain after a declined network switch", async () => {
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_chainId") return "0x1";
      throw { code: 4001, message: "Rejected" };
    });
    await expect(ensureStudionet(provider(request))).rejects.toThrow(
      "Switch to Studionet: Request declined",
    );
    expect(request.mock.calls.map(([arg]) => arg.method)).not.toContain(
      "wallet_addEthereumChain",
    );
  });
  it("surfaces the plain-object wallet error that was previously hidden", async () => {
    const request = vi
      .fn()
      .mockRejectedValue({ code: -32002, message: "Request already pending" });
    await expect(connectWallet(provider(request))).rejects.toThrow(
      "Select wallet account: A wallet request is already open",
    );
  });
  it("preserves an RPC message from non-Error rejection objects", () => {
    expect(
      walletErrorMessage({
        code: -32603,
        message: "Network RPC is unavailable",
      }),
    ).toContain("Network RPC is unavailable");
  });
  it("extracts nested RPC codes including MetaMask cancellation wrappers", () => {
    expect(
      providerFailure({ code: 53, rpcCode: 4001, message: "Cancelled" }).code,
    ).toBe(4001);
    expect(
      providerFailure({ code: -32603, data: { originalError: { code: 4902 } } })
        .code,
    ).toBe(4902);
  });
  it("rejects invalid accounts and does not claim a connection", async () => {
    await expect(
      connectWallet(provider(vi.fn().mockResolvedValue(["invalid"]))),
    ).rejects.toThrow("No valid wallet account");
  });
  it("rejects revoked account access after network prompts", async () => {
    const request = vi.fn(async ({ method }: { method: string }) =>
      method === "eth_requestAccounts"
        ? [account]
        : method === "eth_accounts"
          ? []
          : "0xf22f",
    );
    await expect(connectWallet(provider(request))).rejects.toThrow(
      "Wallet account access was removed",
    );
  });
});
