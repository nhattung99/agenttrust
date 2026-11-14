import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const problems = [];
const secret =
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|VERCEL_OIDC_TOKEN\s*=/;
for (const file of files) {
  if (
    (file.startsWith(".env") && file !== ".env.example") ||
    /^(?:node_modules|\.next|\.vercel|research|release-artifacts)\//.test(
      file,
    ) ||
    file.endsWith(".tsbuildinfo") ||
    file === "next-env.d.ts"
  )
    problems.push(`${file}: generated, private, or unnecessary release file`);
  const content = execFileSync("git", ["show", `:${file}`]);
  if (!content.includes(0) && secret.test(content.toString("utf8")))
    problems.push(`${file}: possible secret pattern`);
}
const localKeys = readFileSync(".env.local", "utf8")
  .split("\n")
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split("=")[0]);
if (
  localKeys.some(
    (key) =>
      ![
        "NEXT_PUBLIC_GENLAYER_NETWORK",
        "NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS",
      ].includes(key),
  )
)
  problems.push(
    ".env.local: unexpected extra configuration keys (values not displayed)",
  );
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Release check passed for ${files.length} staged files. Ignored env files are not published; no known secret patterns found. This is a heuristic check, not a security audit.`,
  );
