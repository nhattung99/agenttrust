# Post-deployment integration and release status

Prepared 15 November 2026, Asia/Saigon. Publication and live transaction testing require the owner approvals below.

## Actual targets

| Item                             | Verified result                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Contract network                 | Stable GenLayer studionet, official SDK preset                                                                      |
| Contract address                 | `0x2cDb3653Efc05a3F3825673e9C7827B446936BD5`                                                                        |
| GitHub                           | https://github.com/nhattung99/agenttrust — public repository created with owner authorization; still empty remotely |
| Vercel                           | `nguyen-nhat-tungs-projects/agenttrust` — project created and configured with owner authorization                   |
| Live app URL                     | None yet; no Vercel deployment submitted                                                                            |
| End-to-end transaction / verdict | None yet; no write transaction signed or sent                                                                       |

## Completed integration

`scripts/verify-deployment.mjs` queried the supplied address using `genlayer-js@1.1.8` and the official studionet chain definition. Deployed code matches local source (after newline normalization), and all 14 public method signatures and the no-argument constructor match the previously extracted local interface. `get_counts`, `list_agents`, and `list_tasks` succeeded with `LATEST_FINAL`. Counts were zero agents and zero tasks. The machine-readable evidence is `deployment-verification.json`.

Both ignored local configuration files, `.env.local` and `.env.production.local`, use studionet and the real public address. Vercel has the same two non-sensitive variables in Production, Preview, and Development. The project framework is Next.js, runtime is Node.js 24.x, install command is `npm ci`, and build command is `npm run build`. No secret environment values are required. A temporary OIDC token generated automatically by `vercel link` was removed from the local env file without displaying or using it.

All production writes continue through the official wallet-backed SDK. There is no production mock judge. The contract was not redeployed or altered. Registration, task creation/acceptance, submission, disputes, adjudication, verdict reads, and reputation reads have matching deployed operations; their full signed workflow has not yet run.

## Executed validation

| Check                                                 | Actual result                                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Local Python contract harness                         | 29 passed; mocked web/model/equivalence callbacks, not real consensus                        |
| Frontend/unit/mocked integration/wallet tests         | 29 passed                                                                                    |
| Strict TypeScript                                     | Passed; typecheck now runs documented `next typegen` before `tsc` for clean checkouts        |
| ESLint                                                | Passed                                                                                       |
| Production build                                      | Passed with `.env.production.local` and the real contract address, using Webpack             |
| Deployed source/interface/final-state reads           | Passed, actual hosted studionet calls                                                        |
| Local production HTTP smoke                           | Nine required routes returned 200; deployment-pending notice absent with address configured  |
| Production-build browser reads                        | Real zero counts, empty directory/task records, and repeated reads after refresh observed    |
| Production-build navigation/mobile                    | Mobile navigation and task-creation route worked; no horizontal overflow at 390px and 1440px |
| Browser console                                       | No captured errors in inspected production-build views                                       |
| Real wallet connection / signing                      | Not executed; owner wallet selection and interactive connection required                     |
| Real state-changing end-to-end test                   | Not executed; awaiting owner wallets/signatures and public deliverable publication           |
| AI consensus, finalized verdict, reputation increment | Not executed on this deployment; no outcomes invented                                        |
| GitHub Actions                                        | Workflow prepared; no remote run yet because no source push                                  |
| Vercel build/live browser tests                       | Not executed because deployment approval is pending                                          |

`http-smoke.json` records current HTTP results. Browser evidence is in `screenshots/deployed-contract-desktop.png` and `screenshots/deployed-contract-mobile.png`. These show the local production build connected to the deployed contract; they are not evidence of a Vercel deployment or completed transaction.

The smoke script initially failed because Node's ESM loader could not use a named export from CommonJS `@next/env`. It now uses the default import and all nine requests pass. The first Vercel environment-variable attempt failed because PowerShell expanded the comma-separated environments as an array; quoted retries successfully added both variables to all three targets. Neither failed attempt is counted as success.

## Repository preparation

Local Git repository initialized on `main` with origin set to the authorized GitHub URL. Ignore rules exclude env values, Vercel links, dependencies, build output, downloaded research, generated declarations, logs, and test caches. The public address is not a secret. `.env.example` remains a safe, configurable example. `.gitattributes` uses LF text files. An automated heuristic scans the staged release for prohibited artifacts and known credential patterns without printing matching values.

The GitHub Actions workflow will run Python tests, frontend tests, type generation/typecheck, lint, and build with the public deployment address after a push. It is prepared, not reported as an executed CI result.

## Required approval and owner input

1. Approve pushing the prepared `main` source to the public `nhattung99/agenttrust` repository. This publishes the source, docs, and demo report fixtures. It also enables the prepared CI workflow to run.
2. Approve a production deployment of that prepared app to personal-team Vercel project `agenttrust`. This uploads source and creates a live application. No live URL is assumed in advance.
3. Provide the operator and a different client **public wallet address**. The owner connects each wallet and manually approves every signing request. Never provide keys or seed phrases.

After publication, use the actual pushed commit SHA for public raw report URLs in `DEMO.md`. Run the real two-wallet workflow: register, create, accept, submit, dispute, adjudicate; wait for finalized successful execution; read the real verdict and reputation; refresh and verify persistence. Record transaction hashes and live logs. Then test the deployed Vercel app and update Builder Portal materials with its actual URL, CI results, and real demo outcomes. If a write or consensus fails, retain its real status and diagnose it without assigning a fake verdict.

## Remaining limitations

The deployment currently has no registered profiles or tasks. Therefore existing verdict/reputation records cannot be inspected, and no signed write can be claimed successful. Public evidence remains restricted to small commit-pinned GitHub raw text files; runtime retrieval and prompt-injection behavior require actual validator execution. Reputation remains scoped to this deployment and can be biased by coordinated or self-created tasks. See `SECURITY.md` for the complete assumptions.
