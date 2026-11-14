import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionHashVariant } from "genlayer-js/types";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const address = "0x2cDb3653Efc05a3F3825673e9C7827B446936BD5";
const client = createClient({ chain: studionet });
const localCode = readFileSync("contracts/agent_trust.py", "utf8");
const report = {
  checkedAt: new Date().toISOString(),
  address,
  network: "studionet",
  sdk: "genlayer-js@1.1.8",
  checks: {},
};
async function check(name, fn) {
  try {
    report.checks[name] = { passed: true, result: await fn() };
    console.log(`${name}: passed`);
  } catch (e) {
    report.checks[name] = {
      passed: false,
      error: e instanceof Error ? e.message : String(e),
    };
    console.log(`${name}: failed — ${report.checks[name].error}`);
    process.exitCode = 1;
  }
}
await check("deployedCode", async () => {
  const code = await client.getContractCode(address);
  if (!code) throw new Error("No deployed contract source returned");
  const normalized = (text) => text.replace(/\r\n/g, "\n").trim();
  const matches = normalized(code) === normalized(localCode);
  if (!matches) {
    writeFileSync("research/deployed-agent-trust.txt", code);
    throw new Error(
      "Deployed source differs from local source; saved for comparison in ignored research directory",
    );
  }
  return {
    matchesLocalSource: true,
    sha256: createHash("sha256").update(code).digest("hex"),
  };
});
await check("schema", async () => {
  const schema = await client.getContractSchema(address);
  const expected = JSON.parse(readFileSync("docs/studio-schema.json", "utf8"));
  if (JSON.stringify(schema) !== JSON.stringify(expected)) {
    // Compare objects independent of key insertion order.
    const canonical = (value) =>
      Array.isArray(value)
        ? value.map(canonical)
        : value && typeof value === "object"
          ? Object.fromEntries(
              Object.keys(value)
                .sort()
                .map((k) => [k, canonical(value[k])]),
            )
          : value;
    if (
      JSON.stringify(canonical(schema)) !== JSON.stringify(canonical(expected))
    )
      throw new Error(
        "Deployed method schema differs from the validated local interface",
      );
  }
  return { methods: Object.keys(schema.methods), constructor: schema.ctor };
});
for (const [method, args] of [
  ["get_counts", []],
  ["list_agents", [0, 50]],
  ["list_tasks", [0, 50]],
]) {
  await check(method, async () => {
    const result = await client.readContract({
      address,
      functionName: method,
      args,
      transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
    });
    if (typeof result !== "string")
      throw new Error("Expected JSON string response");
    return JSON.parse(result);
  });
}
writeFileSync(
  "docs/deployment-verification.json",
  JSON.stringify(report, null, 2) + "\n",
);
