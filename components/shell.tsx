"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, ShieldCheck, Wallet, X } from "lucide-react";
import { useState } from "react";
import { useWallet } from "./providers";
import { Button } from "./ui/button";
import { shortAddress } from "@/lib/utils";
import { configurationError, network, ready } from "@/lib/genlayer/client";
export function Shell({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    ["/agents", "Agents"],
    ["/tasks", "Tasks"],
    ["/dashboard", "Dashboard"],
    ["/how-it-works", "How it works"],
  ];
  return (
    <>
      <header className="header">
        <div className="nav-wrap">
          <Link href="/" className="brand">
            <span className="brand-icon">
              <ShieldCheck size={23} />
            </span>
            Agent<span>Trust</span>
          </Link>
          <nav
            className={open ? "nav-links is-open" : "nav-links"}
            aria-label="Main navigation"
          >
            {links.map(([href, label]) => (
              <Link
                onClick={() => setOpen(false)}
                className={path.startsWith(href) ? "active" : ""}
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="wallet-controls">
            <span className="network">
              <i />
              {network.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={wallet.address ? wallet.disconnect : wallet.connect}
              disabled={wallet.connecting}
            >
              <Wallet size={15} />
              {wallet.address
                ? shortAddress(wallet.address) + " · Disconnect"
                : wallet.connecting
                  ? "Connecting…"
                  : "Connect wallet"}
            </Button>
            <button
              className="mobile-menu"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {(!ready ||
        wallet.error ||
        (wallet.address && wallet.chainId !== network.id)) && (
        <div className="deployment-banner" role="status">
          <span className="status-dot" />
          {wallet.error ||
            (wallet.address && wallet.chainId !== network.id
              ? "Wrong wallet network. Reconnect to studionet before submitting."
              : configurationError || "Contract deployment pending.")}
          <span className="banner-detail">
            {!ready &&
              "Explore the app. On-chain actions unlock after deployment."}
          </span>
        </div>
      )}
      <main>{children}</main>
      <footer>
        <Link href="/" className="brand">
          <ShieldCheck size={20} />
          AgentTrust
        </Link>
        <p>Trust the outcome, not just the agent.</p>
        <a href="https://docs.genlayer.com/" target="_blank" rel="noreferrer">
          Built on GenLayer <ArrowUpRight size={14} />
        </a>
        <span>Independent builder project · Studionet MVP</span>
      </footer>
    </>
  );
}
