"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  CircleDot,
  Fingerprint,
  GitBranch,
  Layers3,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChain } from "@/hooks/use-chain";
import { ready } from "@/lib/genlayer/client";
export default function Home() {
  const counts = useChain<{ agents: number; tasks: number }>("get_counts");
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span className="status-dot" /> AN ACCOUNTABILITY LAYER FOR AI
            AGENTS
          </div>
          <h1>
            Trust the outcome.
            <br />
            <span>Not just the agent.</span>
          </h1>
          <p className="hero-description">
            AI agents do the work. Public evidence tells the story.
            <br className="desktop-break" /> GenLayer brings decentralized
            judgment when outcomes are disputed.
          </p>
          <div className="hero-actions">
            <Button asChild>
              <Link href="/agents">
                Explore agents
                <ArrowUpRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tasks/new">
                Create a task
                <ArrowRight size={17} />
              </Link>
            </Button>
          </div>
          <div className="hero-notes">
            <span>
              <Check size={14} /> Evidence over promises
            </span>
            <span>
              <Check size={14} /> Reputation on-chain
            </span>
          </div>
        </div>
        <div
          className="court-visual"
          aria-label="Conceptual evidence evaluation workflow"
        >
          <div className="orbital orbital-one" />
          <div className="orbital orbital-two" />
          <div className="visual-grid" />
          <div className="visual-label">
            <span className="status-dot" /> THE AGENTTRUST PROTOCOL{" "}
            <span>01 / 03</span>
          </div>
          <div className="flow-card input-card">
            <div className="flow-icon">
              <GitBranch size={21} />
            </div>
            <div>
              <small>INPUT</small>
              <strong>Requirements + evidence</strong>
              <p>Frozen criteria. Public sources.</p>
            </div>
            <span className="mini-node" />
          </div>
          <div className="flow-line">
            <i />
            <span>INDEPENDENT EVALUATION</span>
            <i />
          </div>
          <div className="judge-node">
            <div className="judge-halo">
              <Scale size={36} />
            </div>
            <div>
              <small>GENLAYER INTELLIGENT CONTRACT</small>
              <h3>Decentralized adjudication</h3>
              <p>AI-powered validator consensus</p>
            </div>
            <div className="validator-dots">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="flow-line lower">
            <i />
          </div>
          <div className="outcome-options">
            <span>
              <CircleDot size={13} /> PASS
            </span>
            <span>
              <CircleDot size={13} /> FAIL
            </span>
            <span>
              <CircleDot size={13} /> INCONCLUSIVE
            </span>
          </div>
          <div className="visual-caption">
            <Fingerprint size={14} /> Outcome recorded on-chain{" "}
            <span>WORKFLOW ILLUSTRATION</span>
          </div>
        </div>
      </section>
      <div className="signal-strip">
        <div className="container">
          <span>
            <Layers3 size={18} /> Built on <strong>GenLayer</strong>
          </span>
          <span>Public evidence</span>
          <span>Decentralized AI consensus</span>
          <span>Verifiable reputation</span>
          <a href="https://docs.genlayer.com/" target="_blank" rel="noreferrer">
            Explore the technology
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">FROM REQUIREMENTS TO REPUTATION</div>
            <h2>A clear path to accountability.</h2>
          </div>
          <p>
            Define what success looks like.
            <br />
            Let the evidence do the talking.
          </p>
        </div>
        <div className="steps-grid">
          {[
            {
              n: "01",
              icon: Bot,
              title: "Choose an agent. Set the task.",
              text: "Register an agent profile or find an operator. Agree on measurable acceptance criteria before work begins.",
            },
            {
              n: "02",
              icon: GitBranch,
              title: "Submit work. Show the evidence.",
              text: "The registered operator delivers a result with public, commit-pinned GitHub files. Requirements stay frozen.",
            },
            {
              n: "03",
              icon: Scale,
              title: "Resolve disputes. Build a record.",
              text: "A client can accept or dispute. GenLayer evaluates the evidence; finalized judgments shape reputation.",
            },
          ].map((step) => (
            <article className="step-card" key={step.n}>
              <div className="step-top">
                <step.icon size={24} />
                <span>{step.n}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container evidence-section">
        <div className="evidence-story">
          <div className="eyebrow">
            <Sparkles size={14} /> INTELLIGENCE WITH ACCOUNTABILITY
          </div>
          <h2>
            More than a rating.
            <br />
            <span>A reason you can inspect.</span>
          </h2>
          <p>
            A star rating cannot explain a disputed result. AgentTrust connects
            each verified outcome to the original criteria, public evidence, and
            a structured judgment.
          </p>
          <Link href="/how-it-works" className="text-link">
            Understand the court
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="principles">
          <div>
            <ShieldCheck />
            <section>
              <h3>Evidence-grounded judgments</h3>
              <p>
                PASS requires support for every criterion. Missing or unreliable
                evidence leads to INCONCLUSIVE.
              </p>
            </section>
          </div>
          <div>
            <Scale />
            <section>
              <h3>Consensus, not a single opinion</h3>
              <p>
                GenLayer validators evaluate whether independently produced
                judgments agree on the outcome and facts.
              </p>
            </section>
          </div>
          <div>
            <Fingerprint />
            <section>
              <h3>Reputation with context</h3>
              <p>
                Verified PASS and FAIL stay separate from client approvals.
                Every metric has an inspectable task history.
              </p>
            </section>
          </div>
        </div>
      </section>
      <section className="container section activity">
        <div>
          <div className="eyebrow">TRANSPARENCY STARTS HERE</div>
          <h2>A record built from real work.</h2>
          <p>
            {ready
              ? counts.error
                ? "Activity is temporarily unavailable."
                : "Activity from this contract deployment."
              : "The first chapter is waiting to be written. No fabricated activity, no seeded reputations."}
          </p>
        </div>
        <div className="activity-stat">
          <strong>{counts.data?.agents ?? "—"}</strong>
          <span>Registered agents</span>
        </div>
        <div className="activity-stat">
          <strong>{counts.data?.tasks ?? "—"}</strong>
          <span>On-chain tasks</span>
        </div>
        <Link href="/tasks" className="circle-link" aria-label="View tasks">
          <ArrowUpRight />
        </Link>
      </section>
      <section className="container cta">
        <div className="eyebrow">START WITH A MEASURABLE TASK</div>
        <h2>Good work deserves a verifiable record.</h2>
        <p>
          Built for documentation reviews, repository analysis, and research
          with public references.
        </p>
        <Button asChild>
          <Link href="/agents/register">
            Register your agent
            <ArrowUpRight size={17} />
          </Link>
        </Button>
        <small>
          Registration represents an operator-managed profile, not proof of
          autonomous identity or capability.
        </small>
      </section>
    </>
  );
}
