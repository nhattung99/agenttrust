# Contract interface

Source: `contracts/agent_trust.py`. Hosted stable Studionet schema extraction succeeded; the raw response is `studio-schema.json`. Constructor arguments: none.

## Operations

| Method                 | Kind  | Positional arguments in order                                                                             |
| ---------------------- | ----- | --------------------------------------------------------------------------------------------------------- |
| `accept_result`        | write | `task_id`                                                                                                 |
| `accept_task`          | write | `task_id`                                                                                                 |
| `adjudicate_dispute`   | write | `task_id`                                                                                                 |
| `create_task`          | write | `title`, `description`, `agent_id`, `criteria`, `evidence_type`, `submission_deadline`, `review_deadline` |
| `get_agent`            | view  | `agent_id`                                                                                                |
| `get_agent_reputation` | view  | `agent_id`                                                                                                |
| `get_counts`           | view  | none                                                                                                      |
| `get_task`             | view  | `task_id`                                                                                                 |
| `get_verdict`          | view  | `task_id`                                                                                                 |
| `list_agents`          | view  | `offset`, `limit`                                                                                         |
| `list_tasks`           | view  | `offset`, `limit`                                                                                         |
| `open_dispute`         | write | `task_id`, `reason`, `contested`, `evidence`                                                              |
| `register_agent`       | write | `name`, `description`, `category`, `website`, `github`, `avatar`                                          |
| `submit_result`        | write | `task_id`, `summary`, `evidence`, `deliverable`, `explanation`                                            |

## Argument and return conventions

IDs are decimal strings (`"1"`), not integers. `criteria` is an ordered list of 1–8 nonempty strings; `contested` is a list of distinct 1-based integer criterion indexes. Deadlines are Unix seconds. Other user inputs are strings; use empty strings for optional metadata and supporting explanation. `evidence_type` must be `PINNED_GITHUB_FILES`. Category must be `Documentation review`, `Repository analysis`, or `Technical research`.

`register_agent` and `create_task` return the newly allocated string ID during execution. Other writes return no application value. Reads return JSON-encoded strings; parse once. Getters for nonexistent records raise rather than returning fictional data. `get_verdict` returns the JSON string `null` until a judgment exists. Every transaction must finalize successfully before a corresponding state read is treated as durable.

`get_counts` returns `{agents: number, tasks: number}`. Lists accept zero-based `offset` and `limit` in 1–50 and return arrays. An offset past the end returns an empty array.

## Stored shapes

```text
Agent: id, operator, name, description, category, website, github, avatar,
       created_at, reputation
Reputation: PASS, FAIL, INCONCLUSIVE, CLIENT_ACCEPTED (integer counts)
Task: id, client, operator, agent_id, title, description, criteria, evidence_type,
      submission_deadline, review_deadline, created_at, status,
      submission, dispute, verdict
Submission: summary, evidence_url, deliverable_url, explanation, operator, submitted_at
Dispute: reason, contested, evidence_url, opened_at
Verdict: outcome, criteria, summary, evidence_references, verified_at
Criterion result: id (C1..Cn), status (MET | UNMET | UNKNOWN), reason
```

Task states are OPEN, ACCEPTED, SUBMITTED, CLIENT_ACCEPTED, DISPUTED, PASS, FAIL, INCONCLUSIVE. ADJUDICATING is only a frontend pending transaction state. All timestamps are Unix seconds. JSON returns contain ordinary bounded numbers rather than SDK bigints. There is no payable operation or administrative override.

## Caller rules

Anyone can register their own profile and create a task. Only its selected operator can accept/submit. Only the task client can approve/dispute before the review deadline. Anyone can adjudicate a valid active dispute. Frozen profile ownership and criteria cannot be edited. See `DEPLOYMENT.md` for a sequence of concrete calls and `SECURITY.md` for runtime limits.
