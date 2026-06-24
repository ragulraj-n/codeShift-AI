/**
 * CodeShift Security Service
 * Implements input validation, prompt injection protection, and malicious code detection.
 */

// Dangerous patterns by language/general
const DANGEROUS_PATTERNS = [
  // General OS command executions
  /\bsystem\s*\(/i,
  /\bpopen\s*\(/i,
  /\bexec\s*\(/i,
  /\bsubprocess\b/i,
  /\bchild_process\b/i,
  /\brunTime\.getRuntime\(\)\.exec/i,
  // File operations / Write hazards on system paths
  /\bfs\.writeFile\b/i,
  /\bfs\.writeFileSync\b/i,
  /\brmdir\b/i,
  /\bunlink\b/i,
  // Shell scripts / dangerous utilities
  /\bcurl\b/i,
  /\bwget\b/i,
  /\bsh\s+-c\b/i,
  /\bbash\s+-c\b/i,
  // Code injection hazards
  /\beval\s*\(/i,
  /\bFunction\s*\(\s*['"`]/
];

// Common prompt injection attack patterns
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /bypass\s+restrictions/i,
  /jailbreak/i,
  /you\s+are\s+now\s+a\s+different\s+ai/i,
  /override\s+system/i,
  /do\s+anything\s+now/i,
  /system\s+prompt\s+is/i,
  /ignore\s+above/i,
  /ignore\s+below/i,
  /ignore\s+rules/i
];

/**
 * Scans code for dangerous OS commands, file system manipulation, or other malicious payloads.
 * @param {string} code - The input source code.
 * @returns {object} { isSecure: boolean, matches: string[] }
 */
export const scanCodeSecurity = (code) => {
  if (!code || typeof code !== 'string') {
    return { isSecure: true, matches: [] };
  }

  const matches = [];
  DANGEROUS_PATTERNS.forEach((pattern) => {
    const match = code.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  });

  return {
    isSecure: matches.length === 0,
    matches
  };
};

/**
 * Scans user inputs (e.g. messages or fields) for prompt injection jailbreak keywords.
 * @param {string} input - User input string.
 * @returns {object} { isSecure: boolean, pattern: string|null }
 */
export const scanPromptInjection = (input) => {
  if (!input || typeof input !== 'string') {
    return { isSecure: true, pattern: null };
  }

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isSecure: false,
        pattern: pattern.source
      };
    }
  }

  return {
    isSecure: true,
    pattern: null
  };
};

/**
 * Sanitizes input strings to strip dangerous characters or HTML tags.
 * @param {string} text - Raw input.
 * @returns {string} Sanitized string.
 */
export const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove script tags
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
    .trim();
};

export default {
  scanCodeSecurity,
  scanPromptInjection,
  sanitizeInput
};
