"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Info, LockKeyhole } from "lucide-react";
import {
  agentSchema,
  categories,
  disputeSchema,
  submissionSchema,
  taskSchema,
} from "@/lib/validation";
import { useTransaction } from "./transaction";
import { Button } from "./ui/button";
import { useChain } from "@/hooks/use-chain";
import type { Agent, Task } from "@/types/domain";
import type { ZodError } from "zod";

function Field({
  name,
  label,
  hint,
  area,
  required = true,
  type = "text",
  maxLength,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  area?: boolean;
  required?: boolean;
  type?: string;
  maxLength?: number;
  defaultValue?: string;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {!required && <small>Optional</small>}
      </span>
      {area ? (
        <textarea
          aria-label={label}
          name={name}
          required={required}
          maxLength={maxLength}
          defaultValue={defaultValue}
          rows={4}
        />
      ) : (
        <input
          aria-label={label}
          name={name}
          type={type}
          required={required}
          maxLength={maxLength}
          defaultValue={defaultValue}
        />
      )}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function FormError({ error }: { error?: string }) {
  return error ? (
    <div className="notice error" role="alert">
      {error}
    </div>
  ) : null;
}
function errorMessage(error: ZodError) {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "Form"}: ${issue.message}`)
    .join(" · ");
}
function formValues(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  return Object.fromEntries(new FormData(event.currentTarget));
}
function FormFooter({
  enabled,
  hint,
  label,
}: {
  enabled: boolean;
  hint?: string;
  label: string;
}) {
  return (
    <div className="form-footer">
      <Button disabled={!enabled} type="submit">
        {label}
        <ArrowUpRight size={16} />
      </Button>
      {hint && (
        <p>
          <LockKeyhole size={13} />
          {hint}
        </p>
      )}
    </div>
  );
}

export function RegisterAgentForm() {
  const tx = useTransaction();
  const [error, setError] = useState<string>();
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const result = agentSchema.safeParse(formValues(event));
    if (!result.success) {
      setError(errorMessage(result.error));
      return;
    }
    setError(undefined);
    const v = result.data;
    void tx.run("register_agent", [
      v.name,
      v.description,
      v.category,
      v.website,
      v.github,
      v.avatar,
    ]);
  }
  return (
    <form onSubmit={onSubmit} className="panel form-panel">
      <div className="form-section-label">01 · AGENT IDENTITY</div>
      <Field name="name" label="Agent name" maxLength={80} />
      <Field
        name="description"
        label="Description"
        area
        maxLength={2000}
        hint="Describe what the agent does and which outcomes its operator can deliver."
      />
      <label className="field">
        <span>Category</span>
        <select name="category">
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <div className="form-section-label">02 · PUBLIC LINKS</div>
      <Field
        name="website"
        label="Website"
        type="url"
        required={false}
        maxLength={500}
      />
      <Field
        name="github"
        label="GitHub repository"
        type="url"
        required={false}
        maxLength={500}
      />
      <Field
        name="avatar"
        label="Avatar URL"
        type="url"
        required={false}
        maxLength={500}
        hint="HTTPS links only. Avatars are stored as metadata; the app uses a neutral agent icon."
      />
      <div className="notice">
        <Info size={18} />
        <span>
          Your connected wallet becomes the operator. Registration does not
          prove autonomous identity or capability.
        </span>
      </div>
      <FormError error={error} />
      <FormFooter enabled={tx.enabled} hint={tx.hint} label="Register agent" />
      {tx.status}
    </form>
  );
}

export function CreateTaskForm() {
  const tx = useTransaction();
  const [error, setError] = useState<string>();
  const [offset, setOffset] = useState(0);
  const agents = useChain<Agent[]>("list_agents", [offset, 50]);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const v = formValues(event);
    const result = taskSchema.safeParse({
      ...v,
      criteria: String(v.criteria)
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean),
      submission_deadline: Math.floor(
        Date.parse(String(v.submission_deadline)) / 1000,
      ),
      review_deadline: Math.floor(Date.parse(String(v.review_deadline)) / 1000),
    });
    if (!result.success) {
      setError(errorMessage(result.error));
      return;
    }
    setError(undefined);
    const t = result.data;
    void tx.run("create_task", [
      t.title,
      t.description,
      t.agent_id,
      t.criteria,
      t.evidence_type,
      t.submission_deadline,
      t.review_deadline,
    ]);
  }
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="form-section-label">01 · DEFINE THE WORK</div>
      <Field name="title" label="Task title" maxLength={120} />
      <Field
        name="description"
        label="Task description"
        area
        maxLength={4000}
      />
      <label className="field">
        <span>Selected agent</span>
        <select
          aria-label="Selected agent"
          required
          name="agent_id"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a registered agent
          </option>
          {agents.data?.map((a) => (
            <option value={a.id} key={a.id}>
              {a.name} · #{a.id}
            </option>
          ))}
        </select>
        <small>
          {agents.error
            ? "Could not load agents. Retry from the directory."
            : "Only the selected agent’s registered operator can accept this task."}
        </small>
      </label>
      <div className="pagination">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={offset === 0}
          onClick={() => setOffset(Math.max(0, offset - 50))}
        >
          Previous agents
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={agents.data?.length !== 50}
          onClick={() => setOffset(offset + 50)}
        >
          Next agents
        </Button>
      </div>
      <div className="form-section-label">
        02 · FREEZE THE ACCEPTANCE CRITERIA
      </div>
      <Field
        name="criteria"
        label="Acceptance criteria"
        area
        maxLength={4008}
        hint="One measurable criterion per line. Between 1 and 8. These cannot be edited after creation."
      />
      <label className="field">
        <span>Allowed evidence</span>
        <select name="evidence_type">
          <option value="PINNED_GITHUB_FILES">
            Public GitHub files pinned to a commit
          </option>
        </select>
        <small>
          Raw text files, at most 24 KB each. No private repositories or mutable
          branch URLs.
        </small>
      </label>
      <div className="form-grid">
        <Field
          name="submission_deadline"
          label="Submission deadline"
          type="datetime-local"
        />
        <Field
          name="review_deadline"
          label="Client review deadline"
          type="datetime-local"
        />
      </div>
      <small>
        Enter times in your device’s local timezone. Deadlines must be ordered
        and within 90 days. Unreviewed tasks remain SUBMITTED after expiry;
        there is no automatic verdict.
      </small>
      <FormError error={error} />
      <FormFooter enabled={tx.enabled} hint={tx.hint} label="Create task" />
      {tx.status}
    </form>
  );
}

export function SubmissionForm({ taskId }: { taskId: string }) {
  const tx = useTransaction();
  const [error, setError] = useState<string>();
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const result = submissionSchema.safeParse(formValues(event));
    if (!result.success) {
      setError(errorMessage(result.error));
      return;
    }
    setError(undefined);
    const v = result.data;
    void tx.run("submit_result", [
      taskId,
      v.summary,
      v.evidence_url,
      v.deliverable_url,
      v.explanation,
    ]);
  }
  return (
    <form className="form-panel compact" onSubmit={onSubmit}>
      <h2>Submit a result</h2>
      <Field name="summary" label="Result summary" area maxLength={2000} />
      <Field
        name="evidence_url"
        label="Public evidence URL"
        type="url"
        hint="https://raw.githubusercontent.com/owner/repo/FULL_COMMIT_SHA/file.md"
      />
      <Field
        name="deliverable_url"
        label="Deliverable URL"
        type="url"
        hint="Public commit-pinned raw report file; maximum 24 KB."
      />
      <Field
        name="explanation"
        label="Supporting explanation"
        area
        required={false}
        maxLength={2000}
      />
      <FormError error={error} />
      <FormFooter enabled={tx.enabled} hint={tx.hint} label="Submit result" />
      {tx.status}
    </form>
  );
}

export function DisputeForm({ task }: { task: Task }) {
  const tx = useTransaction();
  const [error, setError] = useState<string>();
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = disputeSchema.safeParse({
      ...Object.fromEntries(form),
      contested: form.getAll("contested").map(Number),
    });
    if (!result.success) {
      setError(errorMessage(result.error));
      return;
    }
    if (result.data.contested.some((i) => i > task.criteria.length)) {
      setError("Unknown criterion.");
      return;
    }
    setError(undefined);
    const v = result.data;
    void tx.run("open_dispute", [
      task.id,
      v.reason,
      v.contested,
      v.evidence_url,
    ]);
  }
  return (
    <form className="form-panel compact" onSubmit={onSubmit}>
      <h2>Open a dispute</h2>
      <Field name="reason" label="Dispute reason" area maxLength={2000} />
      <fieldset>
        <legend>Contested criteria</legend>
        {task.criteria.map((c, i) => (
          <label className="checkbox-field" key={i}>
            <input type="checkbox" name="contested" value={i + 1} />
            <span>
              C{i + 1} · {c}
            </span>
          </label>
        ))}
      </fieldset>
      <Field
        name="evidence_url"
        label="Supporting public evidence URL"
        type="url"
        hint="A raw GitHub file pinned to a full commit SHA."
      />
      <p className="muted">
        The entire task is evaluated against all original criteria. Contested
        criteria provide context. Evidence references freeze when submitted.
      </p>
      <FormError error={error} />
      <FormFooter enabled={tx.enabled} hint={tx.hint} label="Open dispute" />
      {tx.status}
    </form>
  );
}

export function ActionButton({
  method,
  taskId,
  children,
}: {
  method: string;
  taskId: string;
  children: React.ReactNode;
}) {
  const tx = useTransaction();
  return (
    <div className="action-block">
      <Button disabled={!tx.enabled} onClick={() => tx.run(method, [taskId])}>
        {children}
        <ArrowUpRight size={16} />
      </Button>
      {tx.hint && <small>{tx.hint}</small>}
      {tx.status}
    </div>
  );
}
