import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { createHash } from "node:crypto";
const client = createClient({ chain: studionet });
console.log(
  `Read-only schema validation against ${studionet.name} (${studionet.id})`,
);
try {
  const code = readFileSync("contracts/agent_trust.py", "utf8");
  const schema = await client.getContractSchemaForCode(code);
  writeFileSync(
    "docs/studio-schema.json",
    JSON.stringify(schema, null, 2) + "\n",
  );
  writeFileSync(
    "docs/studio-validation.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        chain: "studionet",
        chainId: studionet.id,
        sdk: "genlayer-js@1.1.8",
        sourceSha256: createHash("sha256").update(code).digest("hex"),
        kind: "Read-only schema extraction, not deployment or execution validation",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Studio schema returned and saved to docs/studio-schema.json. No deployment or write was sent.",
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
