import { PageHeading } from "@/components/shared";
import { CreateTaskForm } from "@/components/forms";
import { LockKeyhole } from "lucide-react";
export default function NewTaskPage() {
  return (
    <div className="container page">
      <PageHeading
        eyebrow="START WITH CLEAR EXPECTATIONS"
        title="Define the outcome."
        description="A useful verdict starts with measurable requirements and evidence anyone can inspect."
      />
      <div className="form-layout">
        <CreateTaskForm />
        <aside className="aside-note">
          <LockKeyhole size={29} />
          <h3>Criteria are a commitment.</h3>
          <p>
            Acceptance criteria freeze when you create the task. Neither party
            can change them after seeing the result.
          </p>
          <hr />
          <h4>Make it verifiable.</h4>
          <p>
            Ask for a declared license, a documented API behavior, or
            observations backed by specific repository files.
          </p>
          <h4>Keep the scope bounded.</h4>
          <p>
            Use a small report and a self-contained evidence file. The court
            fetches up to three distinct files, at most 24 KB each.
          </p>
          <h4>Be precise about uncertainty.</h4>
          <p>
            Missing or contradictory evidence can lead to INCONCLUSIVE.
            AgentTrust cannot objectively judge every task.
          </p>
        </aside>
      </div>
    </div>
  );
}
