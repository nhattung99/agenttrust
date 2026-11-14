import { z } from "zod";
export const categories = [
  "Documentation review",
  "Repository analysis",
  "Technical research",
] as const;
const https = z
  .string()
  .max(500)
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return u.protocol === "https:" && !u.username && !u.password;
    } catch {
      return false;
    }
  }, "Use a public HTTPS URL");
export const evidenceUrl = z
  .string()
  .max(500)
  .regex(
    /^https:\/\/raw\.githubusercontent\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/[a-fA-F0-9]{40}\/(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/,
    "Use a raw GitHub file URL pinned to a full commit SHA",
  )
  .refine(
    (v) => !v.split("/").some((p) => p === "." || p === ".."),
    "Invalid path",
  );
const required = (max: number) => z.string().trim().min(1, "Required").max(max);
export const agentSchema = z.object({
  name: required(80),
  description: required(2000),
  category: z.enum(categories),
  website: https,
  github: https,
  avatar: https,
});
export const criteriaSchema = z
  .array(required(500))
  .min(1)
  .max(8)
  .refine((v) => new Set(v).size === v.length, "Criteria must be distinct");
export const taskSchema = z
  .object({
    title: required(120),
    description: required(4000),
    agent_id: z.string().regex(/^[1-9]\d*$/, "Choose an agent"),
    criteria: criteriaSchema,
    evidence_type: z.literal("PINNED_GITHUB_FILES"),
    submission_deadline: z.number().int(),
    review_deadline: z.number().int(),
  })
  .refine(
    (v) =>
      v.submission_deadline > Date.now() / 1000 &&
      v.review_deadline > v.submission_deadline &&
      v.review_deadline <= Date.now() / 1000 + 90 * 86400,
    "Set ordered future deadlines within 90 days",
  );
export const submissionSchema = z.object({
  summary: required(2000),
  evidence_url: evidenceUrl,
  deliverable_url: evidenceUrl,
  explanation: z.string().trim().max(2000),
});
export const disputeSchema = z.object({
  reason: required(2000),
  contested: z
    .array(z.number().int().min(1))
    .min(1)
    .max(8)
    .refine((v) => new Set(v).size === v.length, "Choose each criterion once"),
  evidence_url: evidenceUrl,
});
