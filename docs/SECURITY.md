# Security model and remaining risks

## Implemented controls

- The caller becomes the registering operator. There is no operator parameter that can spoof a different wallet.
- Only a selected profile's operator can accept and submit; only the original client can approve and open a dispute.
- Frozen ordered criteria, single submission, single active dispute, and terminal-state checks prevent repeated adjudication and reputation counting.
- Task existence, categories, nonempty bounded text, criterion uniqueness, valid indexes, and ordered deadlines within 90 days are checked in the contract, independently of frontend Zod.
- Evidence allows only HTTPS `raw.githubusercontent.com/owner/repo/FULL_40_CHAR_COMMIT/path` with ASCII-safe nonempty path segments. Credentials, ports, query strings, fragments, traversal, encodings, branch names, and arbitrary hosts are rejected.
- At most three distinct sources, each accepted body at most 24,000 bytes. Redirect response statuses, errors, oversize bodies, decoding failures, and NUL-containing bodies produce INCONCLUSIVE. No extra links are followed by the contract prompt.
- Untrusted task text, summaries, explanations, dispute reasons, and evidence are data, never evaluation-policy instructions. React renders them as text, without HTML injection.
- Invalid model schemas and incomplete consensus abort rather than recording FAIL. On-chain terminal transitions and counters are one transaction.
- Frontend writes require a valid configured address, selected account, and correct network. `leaderOnly: false` is explicit. Success requires FINALIZED and FINISHED_WITH_RETURN; reads use latest-final.
- No private keys, API keys, user-uploaded secrets, payment assets, admin verdict setter, or arbitrary contract-call interface.

## What remains trusted or unproven

LLMs can be wrong or persuaded by prompt injection despite explicit isolation. Local malicious-evidence tests inspect prompt construction and schema behavior with a stubbed LLM; they do not demonstrate real-model robustness. Multi-validator live injection testing remains required after manual deployment.

The GenVM web API is responsible for outbound request policy, DNS, TLS, timeouts, and transport size limits. The documented `web.get` signature exposes no per-call response-byte cap or redirect-disable flag. AgentTrust limits accepted evidence after retrieval and rejects a returned non-200 status, but cannot prove that the underlying runtime did not follow a redirect before returning a 200. Commit-pinned raw GitHub file URLs reduce this surface. A live runtime check of redirects, errors, rate limits, and reachable content remains part of the deployment gate. Do not describe the application limit as a streaming download cap.

Public file access may be rate limited, unavailable in a validator's environment, or removed even when commit-pinned. Referenced linked sources are not recursively fetched. Bundles and snapshots can contain fabricated provenance. Require direct trusted-source files and tasks whose claims fit available evidence. A report's assertions alone are insufficient proof.

The comparison rule is NLP-based, not a mathematical proof that classifications match. The protocol chooses actual validators and consensus parameters. This application does not configure hosted validator models or claim a specific validator count. No validator consensus run was performed during Phase 1 because deployment is reserved for the owner.

Studionet and wallet infrastructure are development dependencies; chain resets can erase deployment-scoped history. The app uses EIP-1193 account/network requests with the official SDK chain preset and SDK-signed write transport, without calling the legacy helper that forces Snap setup. The owner approves wallet/network/signing prompts. Disconnect is local and does not revoke wallet permissions. Writes recheck that the account still matches the selected signer.

Self-created tasks, coordinated clients, multiple profiles, uneven task difficulty, and selective dispute creation can bias reputation. Counts are transparent but not Sybil-resistant. A client can simply approve a bad result; that never creates verified PASS. Only disputed tasks receive AI adjudication. No task has escrow or an economic anti-spam requirement.

Expired OPEN/ACCEPTED/SUBMITTED tasks can remain unresolved. There is no automatic timeout verdict or administrative cleanup. Anyone may trigger a dispute after the review deadline if it was validly opened earlier. There is no application-level appeal.

The read-only schema check validates the public interface, not the full execution path. Local Python tests do not emulate GenVM storage serialization or rollback. Live signing, constructor execution, read/write consistency, web runtime behavior, prompt cost, consensus latency, and finality must be verified on the owner's deployment before publishing a real-network demo.
