import { describe, expect, it } from "vitest";
import {
  agentSchema,
  criteriaSchema,
  disputeSchema,
  evidenceUrl,
  submissionSchema,
  taskSchema,
} from "@/lib/validation";
import { successRate } from "@/lib/utils";
const url =
  "https://raw.githubusercontent.com/python/cpython/" +
  "a".repeat(40) +
  "/LICENSE";
describe("input boundaries", () => {
  it("accepts a complete registration", () => {
    expect(
      agentSchema.safeParse({
        name: "Review agent",
        description: "Checks public docs",
        category: "Documentation review",
        website: "",
        github: "",
        avatar: "",
      }).success,
    ).toBe(true);
  });
  it("rejects empty names, unknown categories and unsafe metadata", () => {
    expect(
      agentSchema.safeParse({
        name: "",
        description: "test",
        category: "Anything",
        website: "javascript:alert(1)",
        github: "",
        avatar: "",
      }).success,
    ).toBe(false);
  });
  it("accepts only pinned raw GitHub evidence", () => {
    expect(evidenceUrl.safeParse(url).success).toBe(true);
    for (const bad of [
      "http://localhost/file",
      url.replace("a".repeat(40), "main"),
      url + "?x=1",
      url.replace(
        "raw.githubusercontent.com",
        "raw.githubusercontent.com.evil.test",
      ),
      url.replace("/LICENSE", "/../LICENSE"),
    ])
      expect(evidenceUrl.safeParse(bad).success).toBe(false);
  });
  it("requires nonempty distinct criteria", () => {
    for (const value of [[], [""], ["a", "a"], Array(9).fill("a")])
      expect(criteriaSchema.safeParse(value).success).toBe(false);
  });
  it("validates ordered future task deadlines", () => {
    const now = Math.floor(Date.now() / 1000);
    const task = {
      title: "Review",
      description: "Review docs",
      agent_id: "1",
      criteria: ["Identify license"],
      evidence_type: "PINNED_GITHUB_FILES",
      submission_deadline: now + 3600,
      review_deadline: now + 7200,
    };
    expect(taskSchema.safeParse(task).success).toBe(true);
    expect(
      taskSchema.safeParse({ ...task, review_deadline: now }).success,
    ).toBe(false);
    expect(
      taskSchema.safeParse({ ...task, review_deadline: now + 91 * 86400 })
        .success,
    ).toBe(false);
  });
  it("validates result and dispute submissions", () => {
    expect(
      submissionSchema.safeParse({
        summary: "Report",
        evidence_url: url,
        deliverable_url: url,
        explanation: "",
      }).success,
    ).toBe(true);
    expect(
      submissionSchema.safeParse({
        summary: "",
        evidence_url: url,
        deliverable_url: url,
        explanation: "",
      }).success,
    ).toBe(false);
    expect(
      disputeSchema.safeParse({
        reason: "License claim contested",
        contested: [1],
        evidence_url: url,
      }).success,
    ).toBe(true);
    expect(
      disputeSchema.safeParse({
        reason: "Wrong",
        contested: [],
        evidence_url: url,
      }).success,
    ).toBe(false);
  });
});
describe("honest reputation", () => {
  it("does not manufacture a percentage with zero verified judgments", () =>
    expect(successRate({ PASS: 0, FAIL: 0 })).toEqual({
      total: 0,
      rate: "Not enough verified data",
    }));
  it("calculates PASS / (PASS + FAIL)", () =>
    expect(successRate({ PASS: 3, FAIL: 1 })).toEqual({
      total: 4,
      rate: "75%",
    }));
});
