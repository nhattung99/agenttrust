export type Reputation = {
  PASS: number;
  FAIL: number;
  INCONCLUSIVE: number;
  CLIENT_ACCEPTED: number;
};
export type Agent = {
  id: string;
  operator: string;
  name: string;
  description: string;
  category: string;
  website: string;
  github: string;
  avatar: string;
  created_at: number;
  reputation: Reputation;
};
export type CriterionResult = {
  id: string;
  status: "MET" | "UNMET" | "UNKNOWN";
  reason: string;
};
export type Verdict = {
  outcome: "PASS" | "FAIL" | "INCONCLUSIVE";
  criteria: CriterionResult[];
  summary: string;
  evidence_references: string[];
  verified_at: number;
};
export type Task = {
  id: string;
  client: string;
  operator: string;
  agent_id: string;
  title: string;
  description: string;
  criteria: string[];
  evidence_type: string;
  submission_deadline: number;
  review_deadline: number;
  created_at: number;
  status:
    | "OPEN"
    | "ACCEPTED"
    | "SUBMITTED"
    | "CLIENT_ACCEPTED"
    | "DISPUTED"
    | "PASS"
    | "FAIL"
    | "INCONCLUSIVE";
  submission: null | {
    summary: string;
    evidence_url: string;
    deliverable_url: string;
    explanation: string;
    operator: string;
    submitted_at: number;
  };
  dispute: null | {
    reason: string;
    contested: number[];
    evidence_url: string;
    opened_at: number;
  };
  verdict: Verdict | null;
};
