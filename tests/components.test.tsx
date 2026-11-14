import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  address: undefined as string | undefined,
  enabled: false,
  run: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connecting: false,
}));
vi.mock("@/components/providers", () => ({
  useWallet: () => ({ ...state, error: undefined }),
}));
vi.mock("@/components/transaction", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/transaction")>();
  return {
    ...actual,
    useTransaction: () => ({
      enabled: state.enabled,
      run: state.run,
      status: null,
      hint: state.enabled ? undefined : "Contract deployment pending.",
    }),
  };
});
vi.mock("@/hooks/use-chain", () => ({
  useChain: () => ({
    data: [{ id: "1", name: "Research agent" }],
    isLoading: false,
    error: null,
  }),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/agents" }));
import { Shell } from "@/components/shell";
import {
  CreateTaskForm,
  DisputeForm,
  RegisterAgentForm,
  SubmissionForm,
} from "@/components/forms";
import { TxStatus } from "@/components/transaction";
import { VerdictPanel } from "@/components/shared";
import type { Task } from "@/types/domain";
const url =
  "https://raw.githubusercontent.com/python/cpython/" +
  "a".repeat(40) +
  "/LICENSE";
describe("forms and deployment gate", () => {
  beforeEach(() => {
    state.enabled = false;
    state.address = undefined;
    vi.clearAllMocks();
  });
  it("shows disconnected and connected wallet controls", () => {
    const view = render(<Shell>Content</Shell>);
    fireEvent.click(screen.getByRole("button", { name: "Connect wallet" }));
    expect(state.connect).toHaveBeenCalled();
    state.address = "0x1234567890123456789012345678901234567890";
    view.rerender(<Shell>Content</Shell>);
    expect(screen.getByRole("button", { name: /Disconnect/ })).toBeVisible();
  });
  it("disables registration before contract deployment", () => {
    render(<RegisterAgentForm />);
    expect(
      screen.getByRole("button", { name: "Register agent" }),
    ).toBeDisabled();
    expect(screen.getByText("Contract deployment pending.")).toBeVisible();
  });
  it("submits validated registration in contract argument order", () => {
    state.enabled = true;
    render(<RegisterAgentForm />);
    fireEvent.change(screen.getByLabelText("Agent name"), {
      target: { value: "Reviewer" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Reviews documentation" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Register agent" }));
    expect(state.run).toHaveBeenCalledWith("register_agent", [
      "Reviewer",
      "Reviews documentation",
      "Documentation review",
      "",
      "",
      "",
    ]);
  });
  it("previews task creation with frozen criteria notice", () => {
    render(<CreateTaskForm />);
    expect(screen.getByRole("button", { name: "Create task" })).toBeDisabled();
    expect(screen.getByText(/These cannot be edited/)).toBeVisible();
    expect(screen.getByLabelText("Selected agent")).toBeVisible();
  });
  it("submits operator result with references", () => {
    state.enabled = true;
    render(<SubmissionForm taskId="1" />);
    fireEvent.change(screen.getByLabelText("Result summary"), {
      target: { value: "A bounded report" },
    });
    fireEvent.change(screen.getByLabelText("Public evidence URL"), {
      target: { value: url },
    });
    fireEvent.change(screen.getByLabelText("Deliverable URL"), {
      target: { value: url },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit result" }));
    expect(state.run).toHaveBeenCalledWith("submit_result", [
      "1",
      "A bounded report",
      url,
      url,
      "",
    ]);
  });
  it("submits frozen criteria and ordered deadlines in contract argument order", () => {
    state.enabled = true;
    render(<CreateTaskForm />);
    const submission = new Date(Date.now() + 86400000)
      .toISOString()
      .slice(0, 16);
    const review = new Date(Date.now() + 172800000).toISOString().slice(0, 16);
    fireEvent.change(screen.getByLabelText("Task title"), {
      target: { value: "License review" },
    });
    fireEvent.change(screen.getByLabelText("Task description"), {
      target: { value: "Review the public license" },
    });
    fireEvent.change(screen.getByLabelText("Selected agent"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Acceptance criteria"), {
      target: { value: "Identify license\nCite the source" },
    });
    fireEvent.change(screen.getByLabelText("Submission deadline"), {
      target: { value: submission },
    });
    fireEvent.change(screen.getByLabelText("Client review deadline"), {
      target: { value: review },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));
    expect(state.run).toHaveBeenCalledWith("create_task", [
      "License review",
      "Review the public license",
      "1",
      ["Identify license", "Cite the source"],
      "PINNED_GITHUB_FILES",
      Math.floor(Date.parse(submission) / 1000),
      Math.floor(Date.parse(review) / 1000),
    ]);
  });
  it("submits dispute with explicit contested criteria", () => {
    state.enabled = true;
    render(
      <DisputeForm
        task={{ id: "1", criteria: ["Identify declared license"] } as Task}
      />,
    );
    fireEvent.change(screen.getByLabelText("Dispute reason"), {
      target: { value: "License is contested" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByLabelText("Supporting public evidence URL"), {
      target: { value: url },
    });
    fireEvent.click(screen.getByRole("button", { name: "Open dispute" }));
    expect(state.run).toHaveBeenCalledWith("open_dispute", [
      "1",
      "License is contested",
      [1],
      url,
    ]);
  });
  it("has an accessible mobile menu", () => {
    render(<Shell>Content</Shell>);
    const toggle = screen.getByRole("button", { name: "Toggle navigation" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
describe("transaction and verdict presentation", () => {
  it("distinguishes pending transaction from verdict", () => {
    render(<TxStatus phase="submitted" hash="0x123" />);
    expect(screen.getByText("Submitted · waiting for finality")).toBeVisible();
    expect(screen.getByText(/not a verdict/)).toBeVisible();
  });
  it("shows failed transactions without a FAIL verdict", () => {
    render(<TxStatus phase="failed" error="Wallet rejected" />);
    expect(screen.getByText("Transaction failed")).toBeVisible();
    expect(screen.queryByText("FAIL")).not.toBeInTheDocument();
  });
  it("shows an unknown confirmation state and transaction reference", () => {
    render(<TxStatus phase="unknown" hash="0xabc" />);
    expect(screen.getByText(/outcome unknown/)).toBeVisible();
    expect(screen.getByText(/0xabc/)).toBeVisible();
  });
  it("renders structured finalized judgment and sources", () => {
    render(
      <VerdictPanel
        verdict={{
          outcome: "PASS",
          criteria: [
            {
              id: "C1",
              status: "MET",
              reason: "License is declared in the cited file.",
            },
          ],
          summary: "The criterion is supported.",
          evidence_references: [url],
          verified_at: 1700000000,
        }}
      />,
    );
    expect(screen.getByText("PASS")).toBeVisible();
    expect(screen.getByText("C1 · MET")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Evidence source 1" }),
    ).toHaveAttribute("href", url);
  });
});
