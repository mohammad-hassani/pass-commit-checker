import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isGitRepo() {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function installHook() {
  try {
    const gitDir = execSync("git rev-parse --git-dir", { encoding: "utf8" }).trim();
    const hookPath = path.join(gitDir, "hooks", "pre-commit");

    const hookContent = `#!/bin/sh
# Hook added by pass-commit-checker
exec < /dev/tty
pass-commit-checker
`;

    fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
    console.log("✅ Git pre-commit hook installed");
  } catch (err) {
    console.error("❌ Failed to install pre-commit hook:", err.message);
  }
}

if (isGitRepo()) {
  installHook();
} else {
  console.log("ℹ️");
}
