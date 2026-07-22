/**
 * Read and normalize a string env var (trims wrapping quotes from .env files).
 */
export function envStr(name, fallback = '') {
  const raw = process.env[name];
  if (raw === undefined || raw === null || raw === '') {
    return fallback;
  }
  return String(raw)
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

/** Read an integer env var with fallback. */
export function envInt(name, fallback) {
  const value = envStr(name);
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
