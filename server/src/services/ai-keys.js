import { envStr } from './env.js';

/**
 * Collects numbered API keys from env, e.g. GROQ_API_KEY_1, GROQ_API_KEY_2.
 * Skips empty / commented-out values.
 */
export function collectKeys(prefix) {
  const keys = [];
  for (const name of Object.keys(process.env)) {
    if (!name.startsWith(prefix)) continue;
    const cleaned = envStr(name);
    if (!cleaned || cleaned.startsWith('#')) continue;
    keys.push({ name, key: cleaned });
  }
  keys.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return keys;
}

export function buildProviderQueue() {
  /** Prefer Groq Llama 3.3 (fast free OSS) → Gemini → Mistral → Cerebras → Cohere */
  const queue = [];

  for (const { name, key } of collectKeys('GROQ_API_KEY_')) {
    queue.push({
      provider: 'groq',
      label: name,
      key,
      model: 'llama-3.3-70b-versatile',
    });
  }
  for (const { name, key } of collectKeys('GEMINI_API_KEY_')) {
    queue.push({
      provider: 'gemini',
      label: name,
      key,
      model: 'gemini-2.0-flash',
    });
  }
  for (const { name, key } of collectKeys('MISTRAL_API_KEY_')) {
    queue.push({
      provider: 'mistral',
      label: name,
      key,
      model: 'mistral-small-latest',
    });
  }
  for (const { name, key } of collectKeys('CEREBRAS_API_KEY_')) {
    queue.push({
      provider: 'cerebras',
      label: name,
      key,
      model: 'llama-3.3-70b',
    });
  }
  for (const { name, key } of collectKeys('COHERE_API_KEY_')) {
    queue.push({
      provider: 'cohere',
      label: name,
      key,
      model: 'command-r-plus-08-2024',
    });
  }

  return queue;
}
