import { writeFileSync } from "node:fs";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const expectsPending = !process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;
const routes = [
  "/",
  "/agents",
  "/agents/register",
  "/agents/1",
  "/tasks",
  "/tasks/new",
  "/tasks/1",
  "/dashboard",
  "/how-it-works",
];
const results = [];
for (const route of routes) {
  const response = await fetch(`${baseUrl}${route}`, {
    signal: AbortSignal.timeout(60000),
  });
  const html = await response.text();
  const result = {
    route,
    status: response.status,
    hasBrand: html.includes("AgentTrust"),
    hasPendingNotice: html.includes("Contract deployment pending."),
  };
  results.push(result);
  console.log(`${route}: ${response.status}`);
  if (
    response.status !== 200 ||
    !result.hasBrand ||
    result.hasPendingNotice !== expectsPending
  )
    process.exitCode = 1;
}
writeFileSync(
  "docs/http-smoke.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      baseUrl,
      expectsPending,
      scope:
        "HTTP rendering with the configured address; not a signing or adjudication test",
      results,
    },
    null,
    2,
  ) + "\n",
);
