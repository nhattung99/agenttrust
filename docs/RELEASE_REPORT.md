# AgentTrust production release - 15 November 2026

## Published artifacts

| Item | Actual result |
| --- | --- |
| Public GitHub | https://github.com/nhattung99/agenttrust - source pushed to main |
| Production app | https://agenttrust-ten.vercel.app |
| Immutable deployment | https://agenttrust-q8bimnj8q-nguyen-nhat-tungs-projects.vercel.app |
| Vercel project | `nguyen-nhat-tungs-projects/agenttrust` |
| Deployment ID / status | `dpl_TfpJqNEy7JitivSNrL9wED6uTVVk` / READY / production |
| Runtime source revision | `40387baf0ce99e72212f74bf62623ed30c6154a3`; later release-documentation updates do not change runtime code |
| Successful runtime CI | https://github.com/nhattung99/agenttrust/actions/runs/43676485404 |
| Studionet contract | `0x2cDb3653Efc05a3F3825673e9C7827B446936BD5` |

The owner explicitly authorized publication. No additional contract deployment or wallet-signed write was performed.

## Verified

- Deployed Python source and all 14 public method signatures match the local implementation. Finalized reads succeeded. The last verified state contained zero agents and zero tasks; this is not evidence of a completed adjudication.
- Production uses the real contract address and official studionet preset. JS bundles served by Vercel contain the actual address; see `production-verification.json`.
- Vercel production build completed successfully with Next.js 16.4.6 and Node.js 24.x, using `npm ci`, `npm run build`, and Webpack.
- GitHub Actions passed installation, 29 Python harness tests, 29 frontend/unit/mocked SDK/wallet tests, route type generation, TypeScript, ESLint, and production build on Ubuntu for the runtime revision. These tests do not claim real AI consensus.
- All nine required production routes returned HTTP 200 without a deployment-pending notice. See `http-smoke.json`.
- Both public commit-pinned report fixtures return HTTP 200 and fit the evidence limit. Actual URLs are in `DEMO.md` and `production-verification.json`.
- Prior local production-build browser checks verified real empty-state reads, refresh behavior, navigation, and desktop/mobile layouts. Those screenshots are not live Vercel browser evidence.
- The indexed-file heuristic found no known credential patterns or prohibited artifacts before publication. Env files, Vercel links, dependencies, downloaded research, caches, and generated declarations are excluded. This is not a complete security audit.

## Not yet verified

Chrome automation permission was unavailable during release. Interactive live browser behavior, responsive rendering on the live domain, and browser-side RPC behavior were not retested. Opening the live URL in Codex was requested; opening a page is not a test. HTTP success and a configured bundle do not prove client-side execution.

Real wallet connection and the signed workflow remain pending: register, create task, accept, submit public evidence, open dispute, invoke genuine GenLayer adjudication, wait for finalized successful execution, retrieve the actual verdict, and verify reputation after refresh. No successful write or verdict has been fabricated.

The owner provides two public wallet addresses and manually approves connection/signing. Never provide private keys or seed phrases. Retain actual transaction hashes and Studio validator evidence before claiming a complete live AI-consensus demo in Builder Portal materials.

## Release scope

GitHub publication and production Vercel deployment are complete. Submission materials contain actual public URLs. Remaining work concerns real signed adjudication and interactive live-browser validation. See `SECURITY.md` for runtime limits and reputation assumptions.
