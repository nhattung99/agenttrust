"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CalldataEncodable, TransactionHash } from "genlayer-js/types";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import {
  FinalizedExecutionError,
  monitor,
  network,
  ready,
  submit,
} from "@/lib/genlayer/client";
import { useWallet } from "./providers";
import { Button } from "./ui/button";
export type TxPhase =
  "idle" | "signing" | "submitted" | "finalized" | "failed" | "unknown";
export function TxStatus({
  phase,
  hash,
  error,
}: {
  phase: TxPhase;
  hash?: string;
  error?: string;
}) {
  if (phase === "idle") return null;
  return (
    <div className={`tx-status ${phase}`} role="status" aria-live="polite">
      {phase === "finalized" ? (
        <CheckCircle2 size={18} />
      ) : phase === "failed" || phase === "unknown" ? (
        <CircleAlert size={18} />
      ) : (
        <LoaderCircle size={18} className="spin" />
      )}
      <div>
        <strong>
          {phase === "signing"
            ? "Confirm in your wallet"
            : phase === "submitted"
              ? "Submitted · waiting for finality"
              : phase === "finalized"
                ? "Finalized · execution succeeded"
                : phase === "unknown"
                  ? "Confirmation unavailable · outcome unknown"
                  : "Transaction failed"}
        </strong>
        {error && <p>{error}</p>}
        {hash && <p className="mono break-all">Transaction: {hash}</p>}
        <small>
          {phase === "submitted" || phase === "unknown"
            ? "A transaction reference is not a verdict. Do not resubmit while its outcome is unknown."
            : ""}
        </small>
      </div>
    </div>
  );
}
export function useTransaction() {
  const wallet = useWallet();
  const query = useQueryClient();
  const [phase, setPhase] = useState<TxPhase>("idle");
  const [hash, setHash] = useState<TransactionHash>();
  const [error, setError] = useState<string>();
  const enabled =
    ready &&
    !!wallet.address &&
    !!wallet.provider &&
    wallet.chainId === network.id;
  async function run(method: string, args: CalldataEncodable[]) {
    if (!enabled || !wallet.address || !wallet.provider) return;
    let submittedHash: TransactionHash | undefined;
    setError(undefined);
    setHash(undefined);
    setPhase("signing");
    try {
      await submit(wallet.address, wallet.provider, method, args, (h) => {
        submittedHash = h;
        setHash(h);
        setPhase("submitted");
      });
      setPhase("finalized");
      await query.invalidateQueries({ queryKey: ["chain"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction error");
      setPhase(
        e instanceof FinalizedExecutionError
          ? "failed"
          : submittedHash
            ? "unknown"
            : "failed",
      );
    }
  }
  async function resume() {
    if (!hash) return;
    setPhase("submitted");
    setError(undefined);
    try {
      await monitor(hash);
      setPhase("finalized");
      await query.invalidateQueries({ queryKey: ["chain"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confirmation unavailable");
      setPhase(e instanceof FinalizedExecutionError ? "failed" : "unknown");
    }
  }
  const busy =
    phase === "signing" || phase === "submitted" || phase === "unknown";
  return {
    run,
    phase,
    hash,
    enabled: enabled && !busy,
    status: (
      <>
        <TxStatus phase={phase} hash={hash} error={error} />
        {phase === "unknown" && (
          <Button variant="outline" onClick={resume} type="button">
            Check existing transaction
          </Button>
        )}
      </>
    ),
    hint: !ready
      ? "Contract deployment pending."
      : !wallet.address
        ? "Connect your wallet to continue."
        : wallet.chainId !== network.id
          ? "Reconnect to studionet."
          : undefined,
  };
}
