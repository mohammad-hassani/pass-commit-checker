#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import prompts from "prompts";
import { checkForSecrets } from "./scanner.js";
import isInteractive from 'is-interactive';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOOK_PATH = path.join(getGitDir(), "hooks", "pre-commit");

function getGitDir() {
  try {
    return execSync("git rev-parse --git-dir", { encoding: "utf8" }).trim();
  } catch {
    return ".git";
  }
}

function installHook() {
  if (!fs.existsSync(getGitDir())) {
    console.error("❌ Not a Git repository.");
    process.exit(1);
  }

  const hookContent = `#!/bin/sh
# Hook created by pass-commit-checker
exec < /dev/tty
node "${__dirname}/index.js"
`;

  fs.writeFileSync(HOOK_PATH, hookContent, { mode: 0o755 });
  console.log("✅ Pre-commit hook installed successfully.");
}

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only", { encoding: "utf8" });
    return output.split("\n").filter(Boolean);
  } catch (err) {
    console.error("❌ Failed to get staged files. Are you in a git repository?");
    process.exit(1);
  }
}

function getFileContent(filePath) {
  try {
    return execSync(`git show :${filePath}`, { encoding: "utf8" });
  } catch (err) {
    return "";
  }
}

async function runChecker() {
  const files = getStagedFiles();
  let allFindings = [];

  for (const file of files) {
    const content = getFileContent(file);
    const findings = checkForSecrets(content);
    findings.forEach((f) => (f.file = file));
    allFindings.push(...findings);
  }

  if (allFindings.length > 0) {
    console.log("🚨 Possible secret detected in your staged files:\n");

    for (const finding of allFindings) {
      console.log(`${finding.file}:${finding.line} → ${finding.variable || finding.function} = "${finding.value}"`);
    }

    if (!isInteractive()) {
      console.log("❌ Commit aborted due to detected secrets (non-interactive environment).");
      process.exit(1);
    }

    const response = await prompts({
      type: "confirm",
      name: "proceed",
      message: "Are you sure you want to proceed with the commit?",
      initial: false
    });

    if (!response.proceed) {
      console.log("❌ Commit aborted due to detected secrets.");
      process.exit(1);
    }
  }
}

if (process.argv.includes("--install")) {
  installHook();
} else {
  runChecker().catch((err) => {
    console.error("❌ An error occurred:", err);
    process.exit(1);
  });
}
