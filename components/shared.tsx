import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  FileCheck2,
  SearchX,
} from "lucide-react";
import { Button } from "./ui/button";
import { shortAddress, successRate } from "@/lib/utils";
import type { Agent, Task, Verdict } from "@/types/domain";
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <SearchX size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Button asChild variant="outline">
          <Link href={href}>
            {label}
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      )}
    </div>
  );
}
export function StateBadge({ state }: { state: string }) {
  return (
    <span className={`badge badge-${state.toLowerCase()}`}>
      {state.replaceAll("_", " ")}
    </span>
  );
}
export function AgentCard({ agent }: { agent: Agent }) {
  const rep = successRate(agent.reputation);
  return (
    <Link className="agent-card panel" href={`/agents/${agent.id}`}>
      <div className="card-top">
        <div className="agent-avatar">
          <Bot />
        </div>
        <span className="pill">{agent.category}</span>
        <ArrowUpRight size={18} />
      </div>
      <h3>{agent.name}</h3>
      <p>{agent.description}</p>
      <div className="operator">
        Operator <span className="mono">{shortAddress(agent.operator)}</span>
      </div>
      <div className="card-bottom">
        <strong>{rep.total ? rep.rate : "No verified data"}</strong>
        <span>{rep.total} verified tasks</span>
      </div>
    </Link>
  );
}
export function TaskCard({ task }: { task: Task }) {
  return (
    <Link className="task-row" href={`/tasks/${task.id}`}>
      <div className="task-symbol">
        <FileCheck2 size={22} />
      </div>
      <div>
        <span className="overline">
          TASK #{task.id} · AGENT #{task.agent_id}
        </span>
        <h3>{task.title}</h3>
        <p>
          {task.criteria.length} frozen criteria · Due{" "}
          {new Date(task.submission_deadline * 1000).toLocaleDateString(
            "en-GB",
            { timeZone: "UTC" },
          )}{" "}
          UTC
        </p>
      </div>
      <StateBadge state={task.status} />
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function VerdictPanel({ verdict }: { verdict: Verdict }) {
  return (
    <section className="panel verdict-panel">
      <div className="section-title">
        <h2>
          <FileCheck2 size={23} />
          GenLayer judgment
        </h2>
        <StateBadge state={verdict.outcome} />
      </div>
      <p>{verdict.summary}</p>
      <div className="criterion-results">
        {verdict.criteria.map((row) => (
          <div key={row.id}>
            <span
              className={`badge badge-${row.status === "MET" ? "pass" : row.status === "UNMET" ? "fail" : "inconclusive"}`}
            >
              {row.id} · {row.status}
            </span>
            <p>{row.reason}</p>
          </div>
        ))}
      </div>
      <small>
        Verification timestamp:{" "}
        {new Date(verdict.verified_at * 1000).toISOString()} · Read from
        finalized contract state.
      </small>
      <div className="evidence-links">
        {verdict.evidence_references.map((url, i) => (
          <EvidenceLink
            key={url}
            href={url}
            label={`Evidence source ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
export function EvidenceLink({ href, label }: { href: string; label: string }) {
  let safe = false;
  try {
    const url = new URL(href);
    safe = url.protocol === "https:" && !url.username && !url.password;
  } catch {}
  return safe ? (
    <a
      className="evidence-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
      <ArrowUpRight size={15} />
    </a>
  ) : (
    <span>Invalid evidence URL</span>
  );
}
export function QueryState({
  loading,
  error,
}: {
  loading: boolean;
  error: Error | null;
}) {
  return error ? (
    <div role="alert" className="notice error">
      Unable to read contract state: {error.message}
    </div>
  ) : loading ? (
    <div className="loading">
      <ArrowDownLeft size={18} />
      Reading finalized on-chain state…
    </div>
  ) : null;
}
