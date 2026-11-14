"use client";
import { use, useState } from "react";
import { Bot } from "lucide-react";
import {
  EmptyState,
  EvidenceLink,
  PageHeading,
  QueryState,
  TaskCard,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useChain } from "@/hooks/use-chain";
import { ready } from "@/lib/genlayer/client";
import { successRate } from "@/lib/utils";
import type { Agent, Task } from "@/types/domain";
export default function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [offset, setOffset] = useState(0);
  const valid = /^[1-9]\d*$/.test(id);
  const query = useChain<Agent>("get_agent", [id], valid);
  const tasks = useChain<Task[]>("list_tasks", [offset, 50], valid);
  const agent = query.data;
  if (!valid)
    return (
      <div className="container page">
        <EmptyState
          title="Invalid agent ID"
          description="Choose a registered profile from the directory."
          href="/agents"
          label="Browse agents"
        />
      </div>
    );
  return (
    <div className="container page">
      <QueryState loading={query.isLoading} error={query.error} />
      {agent ? (
        <>
          <PageHeading
            eyebrow={`REGISTERED AGENT / ${agent.id}`}
            title={agent.name}
            description={agent.category}
          />
          <div className="profile-header panel">
            <div className="agent-avatar large">
              <Bot size={32} />
            </div>
            <div>
              <h2>Operator-managed agent</h2>
              <p>{agent.description}</p>
              <div className="operator">
                Operator wallet{" "}
                <span className="mono break-all">{agent.operator}</span>
              </div>
              <div className="evidence-links">
                {agent.website && (
                  <EvidenceLink href={agent.website} label="Website" />
                )}
                {agent.github && (
                  <EvidenceLink href={agent.github} label="GitHub" />
                )}
              </div>
            </div>
          </div>
          <section className="reputation-grid">
            <div className="panel metric">
              <span>Verified success rate</span>
              <strong>{successRate(agent.reputation).rate}</strong>
              <small>
                {successRate(agent.reputation).total} verified PASS / FAIL
                judgments
              </small>
            </div>
            {(["PASS", "FAIL", "INCONCLUSIVE", "CLIENT_ACCEPTED"] as const).map(
              (s) => (
                <div className="panel metric" key={s}>
                  <span>{s.replaceAll("_", " ")}</span>
                  <strong>{agent.reputation[s]}</strong>
                  <small>
                    {s === "CLIENT_ACCEPTED"
                      ? "Client approval · not AI verified"
                      : "GenLayer judgments"}
                  </small>
                </div>
              ),
            )}
          </section>
          <p className="disclaimer">
            Success rate = PASS / (PASS + FAIL). This metric is scoped to this
            deployment and is not a guarantee of trustworthiness.
          </p>
          <div className="section-title">
            <h2>Task and verdict history</h2>
            <span className="muted">
              Matching tasks in this page of global history
            </span>
          </div>
          <QueryState loading={tasks.isLoading} error={tasks.error} />
          {tasks.data?.some((t) => t.agent_id === id) ? (
            <div className="panel">
              {tasks.data
                .filter((t) => t.agent_id === id)
                .map((t) => (
                  <TaskCard task={t} key={t.id} />
                ))}
            </div>
          ) : (
            !tasks.isLoading &&
            !tasks.error && (
              <EmptyState
                title="No tasks in this history page"
                description="Navigate the global history pages to find tasks for this agent."
              />
            )
          )}
          <div className="pagination">
            <Button
              variant="outline"
              disabled={!offset}
              onClick={() => setOffset(Math.max(0, offset - 50))}
            >
              Previous
            </Button>
            <span>History page {offset / 50 + 1}</span>
            <Button
              variant="outline"
              disabled={tasks.data?.length !== 50}
              onClick={() => setOffset(offset + 50)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        !query.isLoading &&
        !query.error && (
          <EmptyState
            title={ready ? "Agent not found" : "Contract deployment pending."}
            description="Profiles will be read from finalized contract state after deployment."
            href="/agents"
            label="Agent directory"
          />
        )
      )}
    </div>
  );
}
