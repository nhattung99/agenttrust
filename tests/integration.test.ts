import { beforeEach, describe, expect, it, vi } from "vitest";
const sdk = vi.hoisted(() => ({
  readContract: vi.fn(),
  writeContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  connect: vi.fn(),
}));
vi.mock("genlayer-js", () => ({ createClient: () => sdk }));
import type { WalletProvider } from "@/lib/genlayer/client";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
describe("contract integration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_GENLAYER_NETWORK", "studionet");
  });
  it("disables reads and writes without an address", async () => {
    vi.stubEnv("NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS", "");
    const c = await import("@/lib/genlayer/client");
    expect(c.ready).toBe(false);
    await expect(c.read("get_counts")).rejects.toThrow(
      "Contract deployment pending.",
    );
    expect(sdk.readContract).not.toHaveBeenCalled();
  });
  it("rejects malformed and zero contract addresses", async () => {
    vi.stubEnv("NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS", "0x" + "0".repeat(40));
    const c = await import("@/lib/genlayer/client");
    expect(c.ready).toBe(false);
    expect(c.configurationError).toContain("Invalid");
  });
  it("reads finalized state explicitly", async () => {
    vi.stubEnv("NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS", "0x" + "1".repeat(40));
    sdk.readContract.mockResolvedValue('{"agents":2,"tasks":3}');
    const c = await import("@/lib/genlayer/client");
    expect(await c.read("get_counts")).toEqual({ agents: 2, tasks: 3 });
    expect(sdk.readContract).toHaveBeenCalledWith(
      expect.objectContaining({ transactionHashVariant: "latest-final" }),
    );
  });
  it("rejects finalized execution errors", async () => {
    const c = await import("@/lib/genlayer/client");
    expect(
      c.successfulReceipt({
        statusName: TransactionStatus.FINALIZED,
        txExecutionResultName: ExecutionResult.FINISHED_WITH_ERROR,
      }),
    ).toBe(false);
    expect(
      c.successfulReceipt({
        statusName: TransactionStatus.ACCEPTED,
        txExecutionResultName: ExecutionResult.FINISHED_WITH_RETURN,
      }),
    ).toBe(false);
    expect(
      c.successfulReceipt({
        statusName: TransactionStatus.FINALIZED,
        txExecutionResultName: ExecutionResult.FINISHED_WITH_RETURN,
      }),
    ).toBe(true);
  });
  it("reports the hash before finality and requests validator consensus", async () => {
    vi.stubEnv("NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS", "0x" + "1".repeat(40));
    const hash = "0x" + "2".repeat(64);
    sdk.writeContract.mockResolvedValue(hash);
    sdk.waitForTransactionReceipt.mockResolvedValue({
      statusName: TransactionStatus.FINALIZED,
      txExecutionResultName: ExecutionResult.FINISHED_WITH_RETURN,
    });
    const c = await import("@/lib/genlayer/client");
    const onHash = vi.fn();
    await c.submit(
      ("0x" + "3".repeat(40)) as `0x${string}`,
      {} as WalletProvider,
      "accept_task",
      ["1"],
      onHash,
    );
    expect(onHash).toHaveBeenCalledWith(hash);
    expect(sdk.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ leaderOnly: false, value: 0n }),
    );
    expect(sdk.waitForTransactionReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ status: TransactionStatus.FINALIZED }),
    );
  });
});
