# Verified SDK and Studio notes

Research and validation: 14 November 2026, Asia/Saigon. The project uses stable hosted Studionet, not the next-release preview.

## Official sources consulted

- [GenLayer documentation](https://docs.genlayer.com/)
- [Full official documentation text](https://docs.genlayer.com/full-documentation.txt)
- [Python SDK API and available runners](https://sdk.genlayer.com/main/_static/ai/api.txt)
- [Stable hosted Studio](https://studio.genlayer.com/)
- [GenLayer Labs repositories](https://github.com/genlayerlabs)
- [Official JavaScript SDK repository](https://github.com/genlayerlabs/genlayer-js)

The two documentation text files were downloaded locally for targeted API searches (ignored `research/`). Installed official SDK declaration files and implementation were inspected to resolve differences between documentation for newer releases and stable npm v1.

## Exact integration choices

| Area                 | Verified choice                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| JavaScript package   | `genlayer-js@1.1.8`, exact version pinned; complete transitive versions in `package-lock.json`                                                               |
| Client factory       | `createClient` from `genlayer-js`                                                                                                                            |
| Chain                | `studionet` from `genlayer-js/chains`; `createClient({ chain: studionet })`                                                                                  |
| Reads                | `readContract({address, functionName, args, transactionHashVariant: TransactionHashVariant.LATEST_FINAL})`                                                   |
| Writes               | `writeContract({address, functionName, args, value: 0n, leaderOnly: false})` on client configured with selected address and provider                         |
| Wallet               | `client.connect('studionet')`; this installed version uses `window.ethereum`, SDK-defined chain parameters, and official GenLayer MetaMask Snap prompts      |
| Finality             | `waitForTransactionReceipt({hash, status: TransactionStatus.FINALIZED, interval: 3000, retries: 200})`                                                       |
| Execution success    | Both `statusName === FINALIZED` and `txExecutionResultName === FINISHED_WITH_RETURN`                                                                         |
| Types                | Enums, `CalldataEncodable`, and transaction types from `genlayer-js/types`; wallet provider type derived from the factory parameter                          |
| Python format        | Single-file `AgentTrust(gl.Contract)` with `from genlayer import *`, public write/view decorators, TreeMap storage, first-line runner dependency             |
| Python stable runner | `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`, used by official docs' contract examples and accepted by stable hosted schema extraction |
| Nondeterminism       | `gl.nondet.web.get(url)` and `gl.nondet.exec_prompt(prompt, response_format='json')` inside `gl.eq_principle.prompt_comparative(fn, principle)`              |
| Time                 | GenVM-pinned `datetime.now(timezone.utc)` converted to Unix seconds, as documented for deterministic transaction context                                     |

The current API text labels its newest Python runner v0.3.0-rc10 and lists `py-genlayer:babwp9t37jw9g4j2bccgn14g6x7x9s1f7dsmh7emvz735pz4zxa0`. That preview hash was not substituted for the stable docs' runner. The pinned runner hash, rather than a host `pip genlayer` package version, identifies the production contract's Python runtime. This project does not install the unrelated host Python client as the contract library.

Some newest documentation examples use v2-era helpers (`isSuccessful`, `waitForFinalization`, fee estimates, `waitUntil`). They are absent from the installed stable v1.1.8 declarations and are intentionally not used. No RPC URL or consensus address is invented or overridden. Stable chain ID 61999 and preview chain ID 61997 are distinct; preview configuration is excluded.

## Primitives considered

`web.render` is useful for rendered pages but unnecessary for immutable raw text. `web.get` offers a response status and body and is appropriate here. `prompt_non_comparative` evaluates leader output against supplied input; comparative evaluation was selected so validators independently retrieve and classify evidence and compare materially equivalent judgments. `strict_eq` is not used for prose. `gl.vm.run_nondet` low-level helpers are unnecessary because the supported equivalence wrapper establishes the nondeterministic execution boundary.

## Validation evidence and limits

`node scripts/check-studio.mjs` returned a real public-method schema from hosted stable Studio after explicit owner approval to transmit the source. `studio-schema.json` contains that response. `studio-validation.json` records the checked source hash and SDK/network. The constructor has no parameters. This is a read-only code/schema request, not a deployment or transaction.

Host HTTP retrieval of the exact pinned demo source returned HTTP 200 and 10,142 bytes. See `demo/source-check.json`. Access from GenVM validators, prompt behavior, committee configuration, signing, and live finality have not been exercised without the owner's manual deployment. Those checks are in `DEPLOYMENT.md`; no unsupported feature is silently replaced with an off-chain judge.

## Wallet connection patch (15 November 2026)

The installed SDK's `connect` helper queries `wallet_getSnaps` and may request installation even though `_sendTransaction` uses the provided wallet's `eth_sendTransaction` method. The app now handles account/network setup via EIP-1193, EIP-3326, and EIP-3085 with parameters taken only from the SDK studionet preset. It still uses the official `createClient`, contract methods, signing transport, and finality handling. The old wallet table above records the initial implementation, not the patched flow.

Plain-object provider failures previously became a generic Wallet connection failed message because they were not Error instances. The patch preserves actionable RPC codes and stage-specific errors and does not claim a real connection was tested.

Primary standards: https://eips.ethereum.org/EIPS/eip-1193, https://eips.ethereum.org/EIPS/eip-3326, https://eips.ethereum.org/EIPS/eip-3085. Installed source: `node_modules/genlayer-js/dist/index.js`, connect helper, `_sendTransaction`, and `getCustomTransportConfig`.
