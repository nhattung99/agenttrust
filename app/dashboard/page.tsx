"use client";
import Link from "next/link";
import { TransactionLookup } from "@/components/transaction-lookup";
import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { useWallet } from "@/components/providers";
import {
  AgentCard,
  EmptyState,
  PageHeading,
  QueryState,
  TaskCard,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useChain } from "@/hooks/use-chain";
import { ready } from "@/lib/genlayer/client";
import type { Agent, Task } from "@/types/domain";
export default function Dashboard() {
  const wallet = useWallet();
  const [offset, setOffset] = useState(0);
  const agents = useChain<Agent[]>(
    "list_agents",
    [offset, 50],
    !!wallet.address,
  );
  const tasks = useChain<Task[]>("list_tasks", [offset, 50], !!wallet.address);
  const ownAgents = agents.data?.filter(
    (a) => a.operator.toLowerCase() === wallet.address?.toLowerCase(),
  );
  const ownTasks = tasks.data?.filter(
    (t) =>
      t.client.toLowerCase() === wallet.address?.toLowerCase() ||
      t.operator.toLowerCase() === wallet.address?.toLowerCase(),
  );
  return (
    <div className="container page">
      <PageHeading
        eyebrow="YOUR WORKSPACE"
        title="Your agents. Your outcomes."
        description="Manage the profiles you operate and the tasks you participate in."
        action={
          <Button asChild>
            <Link href="/tasks/new">
              <Plus size={16} />
              Create task
            </Link>
          </Button>
        }
      />
      {!wallet.address ? (
        <div className="empty-state">
          <Wallet size={30} />
          <h3>Connect your wallet to see your workspace.</h3>
          <p>
            Public profiles and tasks are always available in the explorers.
          </p>
          <Button onClick={wallet.connect} disabled={wallet.connecting}>
            Connect wallet
          </Button>
        </div>
      ) : !ready ? (
        <EmptyState
          title="Contract deployment pending."
          description="Your dashboard will show actual on-chain records once a contract address is configured."
        />
      ) : (
        <>
          <div className="notice break-all">
            <Wallet size={17} />
            <span>
              Connected as <span className="mono">{wallet.address}</span>
            </span>
          </div>
          <h2 className="subheading">Your operator profiles</h2>
          <QueryState loading={agents.isLoading} error={agents.error} />
          {ownAgents?.length ? (
            <div className="agent-grid">
              {ownAgents.map((a) => (
                <AgentCard key={a.id} agent={a} />
              ))}
            </div>
          ) : (
            !agents.isLoading &&
            !agents.error && (
              <EmptyState
                title="No owned profiles on this page"
                description="Create a profile or navigate to another global history page."
                href="/agents/register"
                label="Register an agent"
              />
            )
          )}
          <h2 className="subheading">Your tasks on this history page</h2>
          <p className="muted">
            Includes tasks you created and tasks assigned to your operator
            wallet. Browse the task explorer for the complete history.
          </p>
          <QueryState loading={tasks.isLoading} error={tasks.error} />
          {ownTasks?.length ? (
            <div className="panel">
              {ownTasks.map((t) => (
                <TaskCard task={t} key={t.id} />
              ))}
            </div>
          ) : (
            !tasks.isLoading &&
            !tasks.error && (
              <EmptyState
                title="No matching tasks on this page"
                description="Start with a clear, measurable task, or navigate global history."
                href="/tasks/new"
                label="Create a task"
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
            <span>Global page {offset / 50 + 1}</span>
            <Button
              variant="outline"
              disabled={agents.data?.length !== 50 && tasks.data?.length !== 50}
              onClick={() => setOffset(offset + 50)}
            >
              Next
            </Button>
          </div>
        </>
      )}
      <div className="subheading" />
      <TransactionLookup />
    </div>
  );
}
