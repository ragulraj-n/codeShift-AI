export const SUPPORTED_LANGUAGES = {
  javascript: { name: 'JavaScript', ext: '.js', monaco: 'javascript' },
  typescript: { name: 'TypeScript', ext: '.ts', monaco: 'typescript' },
  python: { name: 'Python', ext: '.py', monaco: 'python' },
  java: { name: 'Java', ext: '.java', monaco: 'java' },
  c: { name: 'C', ext: '.c', monaco: 'c' },
  cpp: { name: 'C++', ext: '.cpp', monaco: 'cpp' }
};

export const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500 KB

export const AI_OPERATIONS = {
  CONVERT: 'convert',
  OPTIMIZE: 'optimize',
  DEBUG: 'debug',
  EXPLAIN: 'explain'
};

export const RATE_LIMITS = {
  GUEST_LIMIT: 100,
  AUTH_LIMIT: 100,
  WINDOW_MS: 60 * 60 * 1000 // 1 hour
};
