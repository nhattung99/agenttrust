# Reproducible public-evidence demo

Use the real public [Requests repository](https://github.com/psf/requests). The bounded baseline reviews its declared license rather than requiring the court to inspect an entire repository or trust a mutable language statistic.

Pinned upstream evidence:

```text
https://raw.githubusercontent.com/psf/requests/3c7baaa05ab4aa49cc819ce3a819d260de19c157/LICENSE
```

Host HTTP reachability and size were checked; see `demo/source-check.json`. That is not a GenVM retrieval test or an on-chain judgment. Recheck with `node scripts/check-demo.mjs` before the demo.

## Prepare the deliverables manually

Two intentionally small fixtures are provided only in `docs/demo/`: `passing-report.md` and `failing-report.md`. No production code imports them. These labels describe test intent, not guaranteed judgments.

The report files have now been published in the authorized public repository. These exact pinned URLs were fetched successfully with HTTP 200 during release verification:

- Supported report: https://raw.githubusercontent.com/nhattung99/agenttrust/40387baf0ce99e72212f74bf62623ed30c6154a3/docs/demo/passing-report.md
- Deliberately incorrect report: https://raw.githubusercontent.com/nhattung99/agenttrust/40387baf0ce99e72212f74bf62623ed30c6154a3/docs/demo/failing-report.md

The filenames express fixture intent, not real verdicts. No signed adjudication has been run. Use separate tasks for these reports so terminal outcomes cannot be overwritten. The real app is https://agenttrust-ten.vercel.app; the owner connects two wallets and approves signing manually.

## Task and evidence inputs

Title: `Review the Requests repository license`.

Description: `Review the complete pinned Requests LICENSE text. Deliver a concise report with the declared license and three source-supported observations; do not make broad legal or security claims.`

Criteria (one per line):

1. Correctly identify the declared license as named in the supplied complete LICENSE text.
2. Provide three accurate observations supported by the text, covering the copyright grant in section 2, redistribution conditions in section 4, and warranty treatment in section 7, with section references.
3. Include the exact pinned upstream LICENSE URL in the report and avoid unsupported claims that contradict its text.

Evidence policy: `PINNED_GITHUB_FILES`.

Submission deadline: now + 1 day. Review deadline: now + 2 days. The client creates as C; O accepts the selected agent's task. Submission summary: `License review report with three section-supported observations`. Evidence URL: pinned upstream LICENSE above. Deliverable URL: the actual public full-commit raw URL of the chosen report. Explanation may be empty.

The client opens a dispute: `Please verify the declared license and the report's section-specific claims against the pinned upstream source.` Contest indexes `[1, 2, 3]`; client evidence URL is the same upstream LICENSE. Deduplication means only the source and report are fetched for this attempt.

Trigger adjudication. Let GenLayer retrieve actual files and evaluate. Save the real transaction hash, consensus timeline, resulting judgment, and reputation. The report variants provide a supported and a deliberately incorrect case, but neither frontend nor contract forces their expected outcomes. Missing or contradictory evidence may produce INCONCLUSIVE; failed consensus produces no verdict.

## Additional retrieval and injection checks

On a separate task, submit a syntactically valid pinned GitHub raw URL whose file does not exist. A successful adjudication should record INCONCLUSIVE and no verified failure count. If the transaction itself fails, record that failure separately and do not claim a judgment.

For prompt injection testing after deployment, manually publish a separate report containing instructions to the evaluator to ignore criteria or force PASS. Keep the same original task policy. Inspect the actual result, validator agreement, and logs; do not treat passing local prompt-string tests as proof of resistance.

## Optional language-analysis extension

The master brief's broader example also asks for primary programming language. Use a separate task only when directly retrievable pinned evidence supports that precise claim. A GitHub language API snapshot placed in an agent-authored bundle is not automatically trustworthy provenance, and the contract does not follow extra links. Unsupported language claims must be UNKNOWN. The baseline above is deliberately self-contained and reproducible with two small public files.
