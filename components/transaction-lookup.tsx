"use client";
import { useState, type FormEvent } from "react";
import type { TransactionHash } from "genlayer-js/types";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
import { readClient } from "@/lib/genlayer/client";
import { Button } from "./ui/button";
import { TxStatus, type TxPhase } from "./transaction";
export function TransactionLookup() {
  const [phase, setPhase] = useState<TxPhase>("idle");
  const [hash, setHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(
      new FormData(event.currentTarget).get("hash") ?? "",
    ).trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
      setError(
        "Enter a complete transaction hash (0x followed by 64 hexadecimal characters).",
      );
      setPhase("failed");
      return;
    }
    setHash(value);
    setError(undefined);
    setLoading(true);
    try {
      const receipt = await readClient.getTransaction({
        hash: value as TransactionHash,
      });
      if (receipt.statusName === TransactionStatus.FINALIZED) {
        const succeeded =
          receipt.txExecutionResultName ===
          ExecutionResult.FINISHED_WITH_RETURN;
        setPhase(succeeded ? "finalized" : "failed");
        if (!succeeded)
          setError(
            `Finalized execution result: ${receipt.txExecutionResultName ?? "unavailable"}.`,
          );
      } else if (
        [TransactionStatus.CANCELED, TransactionStatus.UNDETERMINED].includes(
          receipt.statusName as TransactionStatus,
        )
      ) {
        setPhase("failed");
        setError(
          `Transaction state: ${receipt.statusName}. No verdict is implied.`,
        );
      } else {
        setPhase("submitted");
        setError(
          `Current network status: ${receipt.statusName ?? receipt.status ?? "unknown"}. Check again later.`,
        );
      }
    } catch (e) {
      setPhase("unknown");
      setError(e instanceof Error ? e.message : "Unable to read transaction");
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="panel detail-panel">
      <h2>Check a transaction reference</h2>
      <p>
        Recover a transaction’s network status after leaving an action page. A
        successful execution does not identify a task’s verdict; inspect the
        task’s finalized contract record.
      </p>
      <form onSubmit={lookup}>
        <label className="field">
          <span>Transaction hash</span>
          <input
            aria-label="Transaction hash"
            name="hash"
            required
            placeholder="0x…"
            maxLength={66}
          />
        </label>
        <Button type="submit" variant="outline" disabled={loading}>
          {loading ? "Checking…" : "Check on studionet"}
        </Button>
      </form>
      <TxStatus phase={phase} hash={hash} error={error} />
      <small>
        References are not stored in this browser. Keep the hash shown after
        submission. This lookup can read any studionet transaction; verify its
        contract and method in Studio.
      </small>
    </section>
  );
}
