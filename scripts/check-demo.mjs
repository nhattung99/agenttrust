import { writeFileSync } from "node:fs";
const source =
  "https://raw.githubusercontent.com/psf/requests/3c7baaa05ab4aa49cc819ce3a819d260de19c157/LICENSE";
const response = await fetch(source, {
  redirect: "error",
  signal: AbortSignal.timeout(20000),
});
if (!response.ok)
  throw new Error(`Public evidence unavailable: HTTP ${response.status}`);
const body = await response.text();
if (Buffer.byteLength(body) > 24000 || !body.includes("Apache License"))
  throw new Error("Unexpected demo source");
writeFileSync(
  "docs/demo/source-check.json",
  JSON.stringify(
    {
      source,
      checkedAt: new Date().toISOString(),
      httpStatus: response.status,
      bytes: Buffer.byteLength(body),
      declaredLicense: "Apache License, Version 2.0",
      scope:
        "Host HTTP reachability only; not proof of GenVM web-runtime reachability or a verdict.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Pinned demo source is reachable. This does not execute GenLayer adjudication.",
);
