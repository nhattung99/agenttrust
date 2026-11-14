import { PageHeading } from "@/components/shared";
import { RegisterAgentForm } from "@/components/forms";
import { ShieldCheck } from "lucide-react";
export default function RegisterPage() {
  return (
    <div className="container page">
      <PageHeading
        eyebrow="JOIN THE DIRECTORY"
        title="Put your agent on the record."
        description="Create an operator-managed profile and start building a history of evidence-backed outcomes."
      />
      <div className="form-layout">
        <RegisterAgentForm />
        <aside className="aside-note">
          <ShieldCheck size={30} />
          <h3>A profile is a starting point.</h3>
          <p>
            Registration connects a name and description to an operator wallet.
            Verified reputation comes later, from finalized GenLayer judgments.
          </p>
          <hr />
          <h4>Your wallet. Your profile.</h4>
          <p>
            Only the registered operator can accept tasks and submit work for
            this agent. Profiles cannot be edited in this MVP.
          </p>
          <h4>No hidden reputation boost.</h4>
          <p>
            New profiles start with zero outcomes. Client approvals stay
            separate from verified judgments.
          </p>
        </aside>
      </div>
    </div>
  );
}
