# Manual GenLayer Studio deployment

## Phase 1 boundary

The agent prepared source and ran a user-approved **read-only schema extraction** against hosted stable Studionet. It did not deploy a contract, submit a write transaction, push GitHub, or deploy Vercel. The contract address remains empty.

Contract: `contracts/agent_trust.py`

Class: `AgentTrust`

Constructor: `__init__(self)` — **no arguments**

Runner dependency: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`

Frontend SDK: `genlayer-js@1.1.8`

Network: official SDK `studionet` preset, stable Studio, chain ID 61999.

The runner hash matches official documentation examples and was accepted by hosted Studio's schema endpoint for this file. The current Python API reference also lists a newer rc10 runner; it was not silently substituted. Schema compatibility is verified; execution and adjudication compatibility require the steps below.

## Deploy in the browser

1. Open [stable GenLayer Studio](https://studio.genlayer.com/). Do not choose `studio-dev` or the preview network.
2. Connect your own wallet or select your Studio development account using Studio's supported UI. Never paste a wallet secret into this project or send it in chat.
3. In the contracts workspace, create/load a single-file Python contract. Paste the entire contents of `contracts/agent_trust.py`, including the first dependency comment. Select the `AgentTrust` class if Studio asks.
4. Inspect the generated schema. Compare with `docs/studio-schema.json`. It should expose the operations in `CONTRACT_INTERFACE.md` and a constructor with an empty parameter list. Any error here is a compatibility stop; retain the exact error rather than changing SDK APIs by guesswork.
5. Leave constructor inputs empty. Use Studio's Deploy action yourself. This is the first deployment transaction and is deliberately outside the agent's Phase 1 actions.
6. Monitor the deployment timeline and logs. Wait for finalized successful execution, not merely a transaction ID or an accepted proposal. Copy the deployed contract address and deployment transaction hash.
7. Read `get_counts()` in Studio. Expect the JSON string `{"agents": 0, "tasks": 0}` on a fresh deployment. The exact whitespace is not significant.
8. Inspect Studio's validator/provider information where available. Retain the observed configuration with your demo; do not claim a count or model diversity that Studio does not show. The app uses normal consensus (`leaderOnly: false`), not leader-only execution.

## Initial method test: two real caller identities

Use an operator wallet/account O and a client wallet/account C. Studio must use the intended sender for each write; if its UI cannot use both external wallets, use two browser wallet profiles in the local dApp after configuring the address. Do not share keys.

1. O: `register_agent("Repo Reviewer", "Bounded public documentation reviewer", "Documentation review", "", "", "")`. Wait for finalized successful execution. Read `get_agent("1")`; operator must equal O. Repeating this registration as O must revert.
2. C: create a task for agent `"1"` with the criteria in `DEMO.md`. Set submission and review Unix seconds from the current time (for example +1 day and +2 days), ordered and within 90 days. Use `"PINNED_GITHUB_FILES"`. Read `get_task("1")`; criteria must match exactly.
3. C or a third wallet must fail to `accept_task("1")`. O then accepts successfully. O publishes the prepared report fixture to a public repository manually; obtain its full-commit raw URL as described in `DEMO.md`.
4. O calls `submit_result` with the real raw source and deliverable URLs. Read the task after finalization. An unauthorized sender or duplicate submission must fail.
5. On one task, C calls `accept_result`; verify CLIENT_ACCEPTED increments while PASS stays unchanged and verdict remains null.
6. On a separate submitted task, C calls `open_dispute` with reason, 1-based contested indexes, and the pinned source URL. A third wallet or second active dispute must fail.
7. Any caller invokes `adjudicate_dispute`. Inspect the real web fetch, prompt, validator votes, and transaction logs in Studio. Wait for full finality and successful execution. Read `get_verdict`, `get_task`, and `get_agent_reputation`.
8. Repeat adjudication: it must fail without incrementing a counter. Retain evidence URLs, transaction hashes, the structured judgment, and logs. Never preselect the verdict.
9. Repeat using the deliberately incorrect report. Test a valid-format but nonexistent file URL and verify a finalized INCONCLUSIVE only if adjudication itself successfully finalizes. Test real injection evidence separately. A failed transaction is not an INCONCLUSIVE or FAIL verdict.

## Connect the frontend

Set `.env.local`:

```dotenv
NEXT_PUBLIC_GENLAYER_NETWORK=studionet
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=YOUR_REAL_DEPLOYED_ADDRESS
```

Replace the placeholder with the actual address; it is not a sample address. Restart `npm run dev`. For a production build, rerun `npm run build` after changing these variables because Next.js embeds public configuration at build time.

Open the directory, task explorer, and profile and confirm that finalized records match Studio. Connect MetaMask, approve account access and the official SDK-defined network prompts, and test writes from O and C. Check wallet rejection, account changes, network changes, and transaction failures. An SDK timeout after submission leaves the outcome unknown: recheck the same hash in the action panel or dashboard, rather than resubmitting.

## Required handoff

Provide the **deployed contract address**, **deployment transaction hash**, and confirmation that it is **stable Studionet**. Include any Studio execution errors or validator/evidence-access limits. Live integration verification comes next. GitHub push and Vercel deployment wait for the owner's explicit confirmation after that verification.
