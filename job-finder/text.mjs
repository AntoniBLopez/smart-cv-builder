export function asStringArray(value, label, { min, max, itemMax }) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array of strings`);
  if (value.length < min || value.length > max) {
    throw new Error(`${label} must contain ${min} to ${max} item(s)`);
  }
  return value.map((item, index) => requireText(item, `${label}[${index}]`, itemMax));
}

export function asObject(value, label) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

export function rejectUnknown(source, allowed, label) {
  for (const key of Object.keys(source)) {
    if (!allowed.includes(key)) throw new Error(`Unknown property ${label}.${key}`);
  }
}

export function requireText(value, label, max) {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} must not be empty`);
  if (trimmed.length > max) throw new Error(`${label} must be at most ${max} characters`);
  return trimmed;
}

export function optionalText(value, label, max) {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be at most ${max} characters`);
  return trimmed;
}
