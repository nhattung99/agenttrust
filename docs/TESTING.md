# Test report

Local checks executed during Phase 1 on Windows, Node.js 24.14.0, npm 11.9.0, and Python 3.12.10. User-facing validation date: 14 November 2026 (Asia/Saigon).

## Automated checks

| Check                           | Result                                                                    | Scope                                                                              |
| ------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run test:contract`         | 29 passed                                                                 | Local deterministic Python harness with isolated GenLayer shim                     |
| `npm test`                      | 29 passed                                                                 | Zod, reputation, components, mocked SDK integration, and injected-wallet lifecycle |
| `npm run typecheck`             | Passed                                                                    | Strict TypeScript                                                                  |
| `npm run lint`                  | Passed                                                                    | Next.js/TypeScript ESLint                                                          |
| `npm run build`                 | Passed                                                                    | Webpack production build, all required routes generated                            |
| `node scripts/check-studio.mjs` | Passed                                                                    | Real stable hosted read-only schema extraction, no deployment                      |
| `node scripts/check-demo.mjs`   | Passed                                                                    | Host HTTP access to commit-pinned real GitHub source                               |
| Dependency audit                | 0 reported vulnerabilities after compatible transitive minimatch override | npm audit; not a complete security audit                                           |

The scripts/build use the documented Webpack flag. Default Turbopack failed starting its CSS worker on this Windows installation, including outside the sandbox. A restricted-sandbox Webpack attempt also encountered an artifact-directory permission error; the normal-permissions production build passed. These failed attempts are not reported as passing checks.

## Contract coverage

The 29 test methods include subcases for all three verdicts and several retrieval failures. They cover registration and duplicates; invalid metadata; absence of profile modification/admin verdict methods; task creation and frozen criteria; invalid/duplicate/whitespace-only criteria; invalid deadlines; operator acceptance; unauthorized acceptance/submission; client approval without verified PASS; client-only disputes; contested index bounds; PASS/FAIL/INCONCLUSIVE normalization; missing, redirected, rate-limited, oversized, binary and undecodable evidence; prompt isolation; duplicate submission/dispute/adjudication and counting; invalid transitions; schema errors; consensus errors without FAIL; URL restrictions; UNKNOWN precedence; deadline enforcement; and pagination.

The shim is only in `tests/contract/test_agent_trust.py`. It supplies dictionaries, caller identity, mock web/model outputs, and a wrapper callback. It does **not** validate GenVM storage codecs, atomic rollback, actual nondeterministic isolation, validator votes, real model quality, or network finality. Injection tests inspect prompt boundaries; they do not prove injection resistance. Production has no test shim or fixture import.

## Frontend coverage

Zod tests cover registration, evidence URLs, criteria, task dates, result submission, and disputes. Component tests cover connected/disconnected controls, contract-address gate, registration argument order, task form preview and task argument order, actual result/dispute form argument order, mobile-menu accessibility, pending/failed/unknown transaction text, and structured verdict presentation. Wallet-provider tests exercise missing injection, connection, wrong network, user rejection, and local disconnect. SDK mocks verify final-state reads, `leaderOnly: false`, zero value, hash-before-finality behavior, and finalized execution checks.

No test invents production agents, tasks, or verdicts. Test files are excluded from the Next.js route tree.

HTTP smoke checks also returned 200 for all nine required routes with the real deployment-pending notice; results are in `http-smoke.json`.

## Browser checks performed

The actual local application was opened in the in-app browser. The home page, agent directory, registration, and task creation were inspected. The mobile navigation expanded and navigated correctly; registration and task creation submit buttons were disabled without an address. At the checked 390px viewport the document width was 375px including scrollbar behavior; at 1440px it was 1425px. Neither had horizontal overflow. Desktop and mobile screenshots were inspected. A desktop landing capture is saved in `screenshots/landing-desktop.png`.

These are manual browser checks, not an automated cross-browser suite. Submission/dispute layouts and finalized-state views were component-tested, but cannot be populated with real on-chain tasks before deployment. No fake browser records were injected to claim a live workflow.

## Required after deployment

Execute the two-wallet sequence in `DEPLOYMENT.md`. Verify actual signing/Snap permissions, constructor execution, all read/write methods, on-chain persistence, required-source reachability from validators, genuine comparative consensus, all three verdicts, malicious evidence behavior, rollback on invalid output, duplicate protection, reputation updates, and network finality. Retain real transaction hashes and Studio logs. None of these live transaction tests has been reported as passed during Phase 1.
