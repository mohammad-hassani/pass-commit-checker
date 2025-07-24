// scanner.js

const SENSITIVE_KEYS = [
  'password', 'passwd', 'pwd',
  'secret', 'token', 'key', 'api_key', 'auth',
  'access', 'credential', 'jwt', 'sessionid'
];

const ASSIGNMENT_PATTERN = /(?<key>\w+)\s*[:=]\s*['"](?<value>[^'"]{4,})['"]/gi;
const FUNC_CALL_PATTERN = /(?<func>\w+)\s*\(\s*['"](?<value>[^'"]{4,})['"]\s*\)/gi;

function looksLikeSecret(value) {
  // Long suspicious value
  if (value.length > 12) return true;
  // Base64-like
  if (/^[A-Za-z0-9+/=]{16,}$/.test(value)) return true;
  // Hex-like (hash)
  if (/^[a-f0-9]{32,}$/i.test(value)) return true;
  return false;
}

export function checkForSecrets(code) {
  const findings = [];
  const lines = code.split('\n');

  // Assignment pattern
  let match;
  while ((match = ASSIGNMENT_PATTERN.exec(code)) !== null) {
    const key = match.groups.key.toLowerCase();
    const value = match.groups.value;
    const line = code.slice(0, match.index).split('\n').length;
    if (SENSITIVE_KEYS.some(sens => key.includes(sens))) {
      findings.push({
        type: 'assignment',
        variable: match.groups.key,
        value,
        line
      });
    } else if (looksLikeSecret(value)) {
      findings.push({
        type: 'suspicious_value',
        variable: match.groups.key,
        value,
        line
      });
    }
  }

  // Function call pattern
  while ((match = FUNC_CALL_PATTERN.exec(code)) !== null) {
    const func = match.groups.func.toLowerCase();
    const value = match.groups.value;
    const line = code.slice(0, match.index).split('\n').length;
    if (SENSITIVE_KEYS.some(sens => func.includes(sens))) {
      findings.push({
        type: 'function_call',
        function: match.groups.func,
        value,
        line
      });
    }
  }

  return findings;
}