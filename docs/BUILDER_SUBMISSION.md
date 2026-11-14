# AgentTrust — Builder Portal submission draft

**Tagline:** Trust the outcome, not just the agent.

**Stage:** Deployed on stable Studionet. The deployed source and 14 public-method signatures match the local implementation, and finalized reads succeed. The deployment is empty: zero agents and zero tasks at verification. Wallet-signed end-to-end adjudication and publication remain pending approval.

| Submission artifact            | Actual status                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------- |
| Project title                  | AgentTrust - AI Agent Reputation & Dispute Court                                 |
| Studionet address              | `0x2cDb3653Efc05a3F3825673e9C7827B446936BD5`                                     |
| GitHub URL                     | https://github.com/nhattung99/agenttrust (created; source push pending approval) |
| Live Vercel URL                | Vercel project agenttrust prepared; deployment pending approval; no live URL yet |
| Deployed source / interface    | Verified against the supplied address with official SDK                          |
| End-to-end verdict transaction | Not run; awaiting operator/client wallets and signing approval                   |
| Evidence                       | `deployment-verification.json`, `RELEASE_REPORT.md`, `TESTING.md`                |

Do not describe local tests or host HTTP checks as a live adjudication demo.

## Original use case

AI agent marketplaces often describe an agent's identity or aggregate ratings without explaining whether a particular deliverable met its requirements. AgentTrust connects operator-managed agent profiles to frozen tasks, public source evidence, disputes, structured judgments, and deployment-scoped reputation. It helps a prospective client inspect why an outcome was accepted, failed verification, or remained uncertain.

## Meaningful Intelligent Contract functionality

The Python contract manages ownership and the entire task lifecycle. During an active dispute it retrieves permitted public evidence inside GenLayer nondeterministic execution, asks an LLM to evaluate every original criterion, validates a small structured schema, and applies comparative equivalence. Validators independently retrieve and classify evidence and must agree on outcome, criterion statuses, and material facts while allowing different explanation wording.

This is not a frontend chatbot, off-chain OpenAI judge, preselected verdict, or deterministic placeholder. The frontend only sends SDK transactions and reads finalized state. Invalid model output or incomplete consensus cannot create FAIL. Missing required evidence can create INCONCLUSIVE only through a successful adjudication transaction.

## On-chain record

The contract stores agent profiles and operator wallets; clients and selected agents; immutable acceptance criteria and deadlines; submission and dispute references; ordered per-criterion judgments, summary, source references, and timestamp; and separate PASS, FAIL, INCONCLUSIVE, and CLIENT_ACCEPTED counts. Reputation increments once during a terminal transition. Client approvals are not AI-verified PASS.

## Real user workflow

An operator registers a profile. A client creates a measurable task. The registered operator accepts, publishes a report to a public repository, and submits its commit-pinned raw URL. The client accepts or opens a dispute. Anyone may trigger adjudication of a valid dispute. After finalized successful execution, users inspect the verdict and its supporting criteria and see the corresponding reputation update.

MetaMask and the official GenLayer SDK/Snap provide signing. Stable Studionet settings come from the official chain preset. No private keys are requested by the app. There are no payments, escrow, tokenomics, NFTs, DAO governance, or external agent runtime requirements.

## Reproducible demo

`DEMO.md` specifies a real Requests repository license source pinned to commit `3c7baaa05ab4aa49cc819ce3a819d260de19c157`, measurable documentation criteria, and supported/incorrect report fixtures. The owner manually publishes the report files, deploys the contract, and performs the two-wallet workflow. Neither fixture's label forces its verdict. An inaccessible-source scenario checks INCONCLUSIVE without mistaking transaction failure for judgment.

Before portal submission, attach the actual contract address, deployment transaction, at least one completed adjudication transaction with Studio logs and actual validator evidence, reputation readback, repository URL, and deployed UI URL. The address and deployed source/interface are verified; the remaining live-demo and publication artifacts are pending approval.

## Limitations and roadmap

Current evidence is limited to three small, commit-pinned GitHub raw text files. Registration is not proof of autonomous identity or capability. AI consensus can err and is vulnerable to incomplete evidence or adversarial text. Reputation can be biased by self-created or coordinated tasks. There is no application appeal or automatic timeout resolution. Studionet can reset.

Next steps after real deployment validation: measure consensus latency and cost across supported task types, evaluate prompt injection with actual validators, improve indexed pagination, add auditable evidence policies for further domains, investigate better task-difficulty context and anti-coordination signals, and consider appeals only with adequate testing. Payments and incentives are outside this MVP.
