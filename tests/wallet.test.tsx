import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const client = vi.hoisted(() => ({ connect: vi.fn() }));
vi.mock("@/lib/genlayer/client", () => ({
  network: { id: 61999, name: "Studionet" },
  walletClient: () => client,
}));
import { Providers, useWallet } from "@/components/providers";
function WalletTest() {
  const wallet = useWallet();
  return (
    <>
      <button onClick={wallet.connect} disabled={wallet.connecting}>
        Connect
      </button>
      <button onClick={wallet.disconnect}>Disconnect</button>
      <span data-testid="address">{wallet.address || "disconnected"}</span>
      <span role="status">{wallet.error}</span>
    </>
  );
}
describe("EIP-1193 wallet lifecycle", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    delete window.ethereum;
  });
  it("explains when no injected wallet is installed", async () => {
    delete window.ethereum;
    render(
      <Providers>
        <WalletTest />
      </Providers>,
    );
    fireEvent.click(screen.getByText("Connect"));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Install an EIP-1193",
      ),
    );
  });
  it("connects and locally disconnects the selected account", async () => {
    window.ethereum = {
      request: vi.fn(async ({ method }: { method: string }) =>
        method === "eth_requestAccounts" ? ["0x" + "1".repeat(40)] : "0xf22f",
      ),
    } as unknown as NonNullable<Window["ethereum"]>;
    render(
      <Providers>
        <WalletTest />
      </Providers>,
    );
    fireEvent.click(screen.getByText("Connect"));
    await waitFor(() =>
      expect(screen.getByTestId("address")).toHaveTextContent(
        "0x" + "1".repeat(40),
      ),
    );
    expect(client.connect).toHaveBeenCalledWith("studionet");
    fireEvent.click(screen.getByText("Disconnect"));
    expect(screen.getByTestId("address")).toHaveTextContent("disconnected");
  });
  it("rejects a wallet that remains on the wrong chain", async () => {
    window.ethereum = {
      request: vi.fn(async ({ method }: { method: string }) =>
        method === "eth_requestAccounts" ? ["0x" + "1".repeat(40)] : "0x1",
      ),
    } as unknown as NonNullable<Window["ethereum"]>;
    render(
      <Providers>
        <WalletTest />
      </Providers>,
    );
    fireEvent.click(screen.getByText("Connect"));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Switch to Studionet",
      ),
    );
    expect(screen.getByTestId("address")).toHaveTextContent("disconnected");
  });
  it("reports wallet rejection without fabricating a session", async () => {
    window.ethereum = {
      request: vi.fn().mockRejectedValue(new Error("User rejected connection")),
    } as unknown as NonNullable<Window["ethereum"]>;
    render(
      <Providers>
        <WalletTest />
      </Providers>,
    );
    fireEvent.click(screen.getByText("Connect"));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "User rejected connection",
      ),
    );
    expect(screen.getByTestId("address")).toHaveTextContent("disconnected");
  });
});
