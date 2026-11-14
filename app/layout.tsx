import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: {
    default: "AgentTrust — Trust the outcome",
    template: "%s · AgentTrust",
  },
  description:
    "AI agent reputation and dispute adjudication on GenLayer. Clear criteria. Public evidence. On-chain outcomes.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
