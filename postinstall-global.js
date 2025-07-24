import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const globalHookDir = path.join(os.homedir(), ".pass-commit-checker/hooks");
const preCommitHookPath = path.join(globalHookDir, "pre-commit");

fs.mkdirSync(globalHookDir, { recursive: true });

const hookScript = `#!/bin/sh
exec < /dev/tty
node "${path.join(__dirname, "index.js")}"
`;

fs.writeFileSync(preCommitHookPath, hookScript, { mode: 0o755 });

try {
  execSync(`git config --global core.hooksPath "${globalHookDir}"`);
  console.log("✅ Global Git hook path set to ~/.pass-commit-checker/hooks");
} catch (err) {
  console.error("❌ Failed to set global hook path:", err.message);
}
