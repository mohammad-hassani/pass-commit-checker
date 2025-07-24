# 🛡️ pass-commit-checker

**Prevent committing secrets like passwords, API keys, and tokens in your Git commits. Stay safe with every commit.**

![badge](https://img.shields.io/badge/security-checker-critical?style=for-the-badge&color=green)

---

## ✨ Introduction

`pass-commit-checker` is a simple CLI tool that automatically scans your staged files before every `git commit`. If it detects secrets like passwords, tokens, or private keys, it warns you and asks whether you still want to proceed with the commit.

---

## 🚀 Quick Install

```bash
npm install -g pass-commit-checker
```

That’s it! If you’re inside a Git project, the pre-commit hook is automatically installed.

---

## 🔍 What It Detects

- Common sensitive variables:
  - `password`, `token`, `api_key`, `secret`, `auth`, ...
- Suspicious values:
  - Long base64 strings
  - Hexadecimal hashes (md5, sha256, etc.)
  - SSH private keys or UUIDs

---

## 🧠 How It Works

On every commit, the tool checks all staged files for patterns that resemble secrets and warns you like this:

```
🚨 Possible secret detected in your staged files:

src/config.js:12 → Variable api_key has value "ABCD1234SECRETXYZ"
src/auth.js:7 → Function set_password called with "hunter2"

Are you sure you want to proceed with the commit?
```

---

## ❌ Blocking Commits

If any suspicious value is found, you’ll be prompted:

- Proceed → commit continues.
- Cancel → commit is aborted (exit code 1).

---

## 🛠 Manual Hook Installation

If the hook didn’t install automatically (e.g. outside a Git repo), run:

```bash
pass-commit-checker --install
```

---

## 📦 License

MIT © Your Name

---

## 💬 Contribute

Pull requests and suggestions are welcome. If you find this useful, give it a ⭐ on GitHub!
