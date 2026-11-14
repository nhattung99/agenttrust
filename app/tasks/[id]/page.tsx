"use client";
import Link from "next/link";
import { use } from "react";
import { Clock, LockKeyhole, Scale } from "lucide-react";
import { ActionButton, DisputeForm, SubmissionForm } from "@/components/forms";
import {
  EmptyState,
  EvidenceLink,
  PageHeading,
  QueryState,
  StateBadge,
  VerdictPanel,
} from "@/components/shared";
import { useWallet } from "@/components/providers";
import { useChain } from "@/hooks/use-chain";
import { ready } from "@/lib/genlayer/client";
import type { Agent, Task } from "@/types/domain";
export default function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const wallet = useWallet();
  const valid = /^[1-9]\d*$/.test(id);
  const query = useChain<Task>("get_task", [id], valid);
  const task = query.data;
  const agentQuery = useChain<Agent>(
    "get_agent",
    [task?.agent_id ?? ""],
    !!task,
  );
  const agent = agentQuery.data;
  const client =
    !!wallet.address &&
    task?.client.toLowerCase() === wallet.address.toLowerCase();
  const operator =
    !!wallet.address &&
    agent?.operator.toLowerCase() === wallet.address.toLowerCase();
  if (!valid)
    return (
      <div className="container page">
        <EmptyState
          title="Invalid task ID"
          description="Choose a task from the explorer."
          href="/tasks"
          label="View tasks"
        />
      </div>
    );
  return (
    <div className="container page">
      <QueryState loading={query.isLoading} error={query.error} />
      {task ? (
        <>
          <PageHeading
            eyebrow={`TASK / ${task.id}`}
            title={task.title}
            description="The requirements and evidence behind this outcome."
            action={<StateBadge state={task.status} />}
          />
          <div className="detail-layout">
            <div className="detail-main">
              <section className="panel detail-panel">
                <div className="section-title">
                  <h2>Task requirements</h2>
                  <span className="pill">
                    <LockKeyhole size={12} />
                    Immutable
                  </span>
                </div>
                <p className="preserve-text">{task.description}</p>
                <h3>Acceptance criteria</h3>
                <ol className="criteria-list">
                  {task.criteria.map((c, i) => (
                    <li key={i}>
                      <span>C{i + 1}</span>
                      <p>{c}</p>
                    </li>
                  ))}
                </ol>
              </section>
              {task.submission && (
                <section className="panel detail-panel">
                  <h2>Submitted deliverable</h2>
                  <p className="preserve-text">{task.submission.summary}</p>
                  {task.submission.explanation && (
                    <p className="preserve-text">
                      {task.submission.explanation}
                    </p>
                  )}
                  <div className="evidence-links">
                    <EvidenceLink
                      href={task.submission.evidence_url}
                      label="Public evidence"
                    />
                    <EvidenceLink
                      href={task.submission.deliverable_url}
                      label="Deliverable"
                    />
                  </div>
                  <small>
                    Submitted{" "}
                    {new Date(
                      task.submission.submitted_at * 1000,
                    ).toISOString()}
                  </small>
                </section>
              )}
              {task.dispute && (
                <section className="panel detail-panel">
                  <h2>
                    <Scale size={22} />
                    Dispute record
                  </h2>
                  <p className="preserve-text">{task.dispute.reason}</p>
                  <p>
                    Contested:{" "}
                    {task.dispute.contested.map((i) => `C${i}`).join(", ")}
                  </p>
                  <EvidenceLink
                    href={task.dispute.evidence_url}
                    label="Client supporting evidence"
                  />
                </section>
              )}
              {task.verdict && <VerdictPanel verdict={task.verdict} />}
              {task.status === "CLIENT_ACCEPTED" && (
                <div className="notice">
                  The client accepted this result. This is not an AI-verified
                  PASS and does not count toward verified success rate.
                </div>
              )}
              {operator && task.status === "ACCEPTED" && (
                <section className="panel">
                  <SubmissionForm taskId={id} />
                </section>
              )}
              {client && task.status === "SUBMITTED" && (
                <section className="panel">
                  <div className="detail-panel">
                    <h2>Client review</h2>
                    <p>
                      Approve the delivered work or freeze a dispute for
                      GenLayer adjudication.
                    </p>
                    <ActionButton method="accept_result" taskId={id}>
                      Accept result · client approval
                    </ActionButton>
                  </div>
                  <DisputeForm task={task} />
                </section>
              )}
            </div>
            <aside className="detail-sidebar">
              <section className="panel detail-panel">
                <h3>Participants</h3>
                <span className="overline">CLIENT WALLET</span>
                <p className="mono break-all">{task.client}</p>
                <span className="overline">REGISTERED AGENT</span>
                <p>
                  <Link href={`/agents/${task.agent_id}`} className="text-link">
                    {agent?.name ?? `Agent #${task.agent_id}`}
                  </Link>
                </p>
                <span className="overline">OPERATOR WALLET</span>
                <p className="mono break-all">
                  {agent?.operator ??
                    (agentQuery.error ? "Unable to load operator" : "Loading…")}
                </p>
                <hr />
                <h3>
                  <Clock size={16} />
                  Deadlines
                </h3>
                <p>
                  Submit by
                  <br />
                  <strong>
                    {new Date(task.submission_deadline * 1000).toISOString()}
                  </strong>
                </p>
                <p>
                  Review by
                  <br />
                  <strong>
                    {new Date(task.review_deadline * 1000).toISOString()}
                  </strong>
                </p>
                <small>UTC · PINNED_GITHUB_FILES</small>
              </section>
              <section className="panel detail-panel">
                <h3>Next step</h3>
                {task.status === "OPEN" ? (
                  operator ? (
                    <ActionButton method="accept_task" taskId={id}>
                      Accept task
                    </ActionButton>
                  ) : (
                    <p>Waiting for the registered operator to accept.</p>
                  )
                ) : task.status === "ACCEPTED" ? (
                  <p>Waiting for the registered operator to submit work.</p>
                ) : task.status === "SUBMITTED" ? (
                  <p>
                    Waiting for client review. Only the client may approve or
                    dispute.
                  </p>
                ) : task.status === "DISPUTED" ? (
                  <>
                    <p>
                      Evidence references are frozen. Anyone can trigger the
                      contract’s evidence evaluation.
                    </p>
                    <ActionButton method="adjudicate_dispute" taskId={id}>
                      Request adjudication
                    </ActionButton>
                    <small>
                      ADJUDICATING is a pending transaction state. The contract
                      remains DISPUTED until the write takes effect.
                    </small>
                  </>
                ) : (
                  <p>
                    This task is complete. No repeated adjudication or
                    application-level appeal is supported.
                  </p>
                )}
              </section>
              <div className="aside-note">
                <h4>Finality matters.</h4>
                <p>
                  These records are read from finalized state. Transaction
                  hashes appear after submission in the action panel. Keep that
                  reference for recovery; the contract does not store
                  transaction hashes.
                </p>
              </div>
            </aside>
          </div>
        </>
      ) : (
        !query.isLoading &&
        !query.error && (
          <EmptyState
            title={ready ? "Task not found" : "Contract deployment pending."}
            description="Task details will be available after contract deployment."
            href="/tasks"
            label="Task explorer"
          />
        )
      )}
    </div>
  );
}
