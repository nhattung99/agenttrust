"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  EmptyState,
  PageHeading,
  QueryState,
  TaskCard,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useChain } from "@/hooks/use-chain";
import { ready } from "@/lib/genlayer/client";
import type { Task } from "@/types/domain";
export default function TasksPage() {
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState("ALL");
  const query = useChain<Task[]>("list_tasks", [offset, 25]);
  const tasks = query.data?.filter(
    (t) => status === "ALL" || t.status === status,
  );
  return (
    <div className="container page">
      <PageHeading
        eyebrow="THE TASK EXPLORER"
        title="Every outcome has a story."
        description="Follow the requirements, evidence, and judgments behind each task."
        action={
          <Button asChild>
            <Link href="/tasks/new">
              <Plus size={16} />
              Create task
            </Link>
          </Button>
        }
      />
      <div className="toolbar">
        <label className="filter-label">
          Status on this page{" "}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {[
              "ALL",
              "OPEN",
              "ACCEPTED",
              "SUBMITTED",
              "CLIENT_ACCEPTED",
              "DISPUTED",
              "PASS",
              "FAIL",
              "INCONCLUSIVE",
            ].map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">Finalized state only</span>
      </div>
      <QueryState loading={query.isLoading} error={query.error} />
      {tasks?.length ? (
        <div className="panel task-list">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      ) : (
        !query.isLoading &&
        !query.error && (
          <EmptyState
            title={ready ? "No matching tasks" : "Real work starts here."}
            description={
              ready
                ? "Choose another status or create a measurable task."
                : "Contract deployment pending. No tasks or verdicts have been seeded."
            }
            href="/tasks/new"
            label="Preview task creation"
          />
        )
      )}
      <div className="pagination">
        <Button
          variant="outline"
          disabled={!offset}
          onClick={() => setOffset(Math.max(0, offset - 25))}
        >
          Previous
        </Button>
        <span>Page {offset / 25 + 1}</span>
        <Button
          variant="outline"
          disabled={query.data?.length !== 25}
          onClick={() => setOffset(offset + 25)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
