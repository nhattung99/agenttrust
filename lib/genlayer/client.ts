import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import {
  ExecutionResult,
  TransactionHashVariant,
  TransactionStatus,
  type CalldataEncodable,
  type GenLayerTransaction,
  type TransactionHash,
} from "genlayer-js/types";
import { isAddress, type Address } from "viem";
import { ensureStudionet } from "./wallet";

export const network = studionet;
const configuredAddress =
  process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS?.trim() || "";
export const contractAddress: Address | undefined =
  isAddress(configuredAddress) && !/^0x0{40}$/i.test(configuredAddress)
    ? (configuredAddress as Address)
    : undefined;
export const configurationError =
  process.env.NEXT_PUBLIC_GENLAYER_NETWORK &&
  process.env.NEXT_PUBLIC_GENLAYER_NETWORK !== "studionet"
    ? "Only studionet is supported."
    : configuredAddress && !contractAddress
      ? "Invalid contract address configuration."
      : undefined;
export const ready = !!contractAddress && !configurationError;
export type WalletProvider = NonNullable<
  NonNullable<Parameters<typeof createClient>[0]>["provider"]
>;
export const readClient = createClient({ chain: studionet });
export function walletClient(account: Address, provider: WalletProvider) {
  return createClient({ chain: studionet, account, provider });
}
export async function read<T>(
  functionName: string,
  args: CalldataEncodable[] = [],
): Promise<T> {
  if (!ready || !contractAddress)
    throw new Error(configurationError || "Contract deployment pending.");
  const result = await readClient.readContract({
    address: contractAddress,
    functionName,
    args,
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
  if (typeof result !== "string")
    throw new Error(
      "Unexpected contract response; verify the deployed interface.",
    );
  return JSON.parse(result) as T;
}
export function successfulReceipt(receipt: GenLayerTransaction) {
  return (
    receipt.statusName === TransactionStatus.FINALIZED &&
    receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN
  );
}
export class FinalizedExecutionError extends Error {}
export async function submit(
  account: Address,
  provider: WalletProvider,
  functionName: string,
  args: CalldataEncodable[],
  onHash: (hash: TransactionHash) => void,
) {
  if (!ready || !contractAddress)
    throw new Error(configurationError || "Contract deployment pending.");
  const client = walletClient(account, provider);
  await ensureStudionet(provider);
  const accounts: unknown = await provider.request({ method: "eth_accounts" });
  if (
    !Array.isArray(accounts) ||
    typeof accounts[0] !== "string" ||
    accounts[0].toLowerCase() !== account.toLowerCase()
  ) {
    throw new Error(
      "The selected wallet account changed. Reconnect before submitting.",
    );
  }
  const hash: unknown = await client.writeContract({
    address: contractAddress,
    functionName,
    args,
    value: 0n,
    leaderOnly: false,
  });
  if (typeof hash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(hash))
    throw new Error("SDK returned an invalid transaction reference.");
  onHash(hash as TransactionHash);
  return await monitor(hash as TransactionHash);
}
export async function monitor(hash: TransactionHash) {
  const receipt = await readClient.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 3000,
    retries: 200,
  });
  if (!successfulReceipt(receipt))
    throw new FinalizedExecutionError(
      `Transaction did not execute successfully: ${receipt.statusName ?? receipt.status} / ${receipt.txExecutionResultName ?? "unknown execution result"}. No verdict is implied.`,
    );
  return receipt;
}
