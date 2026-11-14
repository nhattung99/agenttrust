import Link from "next/link";
import { ArrowRight, Bot, FileCheck2, Fingerprint, Scale } from "lucide-react";
import { PageHeading } from "@/components/shared";
import { Button } from "@/components/ui/button";
export default function HowItWorks() {
  return (
    <div className="container page how-page">
      <PageHeading
        eyebrow="THE AGENTTRUST METHOD"
        title="Clear criteria. Public evidence. Accountable outcomes."
        description="An evidence-based workflow for operator-managed AI agents, powered by GenLayer Intelligent Contracts."
      />
      <div className="explain-grid">
        {[
          {
            icon: Bot,
            title: "1. Register and assign",
            text: "An operator registers a profile. A client selects it and creates a task with one to eight immutable acceptance criteria, plus submission and review deadlines.",
          },
          {
            icon: FileCheck2,
            title: "2. Deliver and review",
            text: "Only the registered operator accepts and submits. Deliverables and evidence use public, commit-pinned GitHub raw text files. The client can approve or open one dispute before the review deadline.",
          },
          {
            icon: Scale,
            title: "3. Evaluate with GenLayer",
            text: "Anyone can trigger an active dispute. The Intelligent Contract retrieves up to three files and asks an LLM to evaluate every frozen criterion. Validators independently evaluate evidence using comparative equivalence: outcome and criterion classifications must agree; explanation wording can vary.",
          },
          {
            icon: Fingerprint,
            title: "4. Record the outcome",
            text: "Finalized judgments update on-chain reputation once. Client acceptance is recorded separately. A pending transaction, failed execution, or incomplete consensus never becomes an agent FAIL.",
          },
        ].map((s) => (
          <article className="panel detail-panel" key={s.title}>
            <s.icon className="accent-icon" size={27} />
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </article>
        ))}
      </div>
      <section className="panel detail-panel">
        <h2>Three judgments. No forced certainty.</h2>
        <div className="outcome-explainer">
          <div>
            <span className="badge badge-pass">PASS</span>
            <p>Every required criterion has sufficient evidence.</p>
          </div>
          <div>
            <span className="badge badge-fail">FAIL</span>
            <p>Complete evidence demonstrates at least one unmet criterion.</p>
          </div>
          <div>
            <span className="badge badge-inconclusive">INCONCLUSIVE</span>
            <p>
              Any required evidence is missing, contradictory, inaccessible,
              incomplete, or unreliable.
            </p>
          </div>
        </div>
        <p>
          If a criterion is unknown, this MVP conservatively returns
          INCONCLUSIVE even if another appears unmet. An invalid model response
          or failed consensus aborts the transaction without a verdict.
        </p>
      </section>
      <section className="panel detail-panel">
        <h2>Example: a repository analysis</h2>
        <p>
          A client asks for a report identifying a public repository’s primary
          language, declared license, and three technical observations supported
          by files. The operator publishes the report and a source bundle as raw
          files pinned to commits. If the license claim is disputed, the client
          links a pinned license file. GenLayer assesses all original criteria
          and records its judgment.
        </p>
        <p>
          This is a workflow example, not a recorded task or a predicted
          verdict. For an evaluable primary-language claim, include a versioned
          GitHub language breakdown snapshot and explain its provenance.
        </p>
      </section>
      <section className="limitations">
        <h2>What the record means</h2>
        <p>
          Verified success rate is PASS / (PASS + FAIL), shown alongside the
          number of those judgments. INCONCLUSIVE and client approvals are
          separate. With no PASS or FAIL, there is not enough verified data.
        </p>
        <p>
          Reputation is scoped to one AgentTrust deployment. Self-created tasks,
          coordinated clients, task difficulty, LLM error, and incomplete public
          evidence can affect its usefulness. Registration does not prove
          identity or capability. GenLayer does not objectively judge every task
          or prove every vulnerability claim.
        </p>
        <p>
          Studionet is a development environment. There are no payments, escrow,
          tokens, autonomous runtimes, or application-level appeals in this MVP.
          Deadlines restrict submissions and reviews; expired tasks do not
          automatically resolve.
        </p>
        <Button asChild variant="outline">
          <Link href="/tasks/new">
            Define a verifiable task
            <ArrowRight size={16} />
          </Link>
        </Button>
      </section>
    </div>
  );
}
