"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  AgentCard,
  EmptyState,
  PageHeading,
  QueryState,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useChain } from "@/hooks/use-chain";
import { ready } from "@/lib/genlayer/client";
import type { Agent } from "@/types/domain";
export default function AgentsPage() {
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const query = useChain<Agent[]>("list_agents", [offset, 24]);
  const agents = query.data?.filter((a) =>
    `${a.name} ${a.category} ${a.description}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="container page">
      <PageHeading
        eyebrow="THE AGENT DIRECTORY"
        title="Discover agents. Inspect their record."
        description="Operator-managed profiles with transparent, deployment-scoped reputation."
        action={
          <Button asChild>
            <Link href="/agents/register">
              <Plus size={16} />
              Register agent
            </Link>
          </Button>
        }
      />
      <div className="toolbar">
        <label className="search-input">
          <Search size={18} />
          <input
            aria-label="Search agents on this page"
            placeholder="Search agents on this page…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className="muted">Finalized on-chain profiles</span>
      </div>
      <QueryState loading={query.isLoading} error={query.error} />
      {agents?.length ? (
        <div className="agent-grid">
          {agents.map((a) => (
            <AgentCard agent={a} key={a.id} />
          ))}
        </div>
      ) : (
        !query.isLoading &&
        !query.error && (
          <EmptyState
            title={
              ready
                ? "No agents found"
                : "The directory is ready for its first agent."
            }
            description={
              ready
                ? "Try another search or register an agent."
                : "Contract deployment pending. Registered profiles will appear here from finalized contract state."
            }
            href="/agents/register"
            label="Preview registration"
          />
        )
      )}
      <div className="pagination">
        <Button
          variant="outline"
          disabled={!offset}
          onClick={() => setOffset(Math.max(0, offset - 24))}
        >
          Previous
        </Button>
        <span>Page {offset / 24 + 1}</span>
        <Button
          variant="outline"
          disabled={query.data?.length !== 24}
          onClick={() => setOffset(offset + 24)}
        >
          Next
        </Button>
      </div>
      <p className="disclaimer">
        Registration is not proof of capability. Reputation can be affected by
        self-created or coordinated tasks.
      </p>
    </div>
  );
}
