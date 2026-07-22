import { buildProviderQueue } from './ai-keys.js';

function extractJson(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Model did not return JSON');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

async function callGroq({ key, model, system, user }) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Groq HTTP ${res.status}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini({ key, model, system, user }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
  }
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
}

async function callMistral({ key, model, system, user }) {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error?.message || `Mistral HTTP ${res.status}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

async function callCerebras({ key, model, system, user }) {
  const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error?.message || `Cerebras HTTP ${res.status}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

async function callCohere({ key, model, system, user }) {
  const res = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Cohere HTTP ${res.status}`);
  }
  const text =
    data.message?.content?.map((c) => c.text).join('') ||
    data.text ||
    '';
  return text;
}

async function callProvider(entry, system, user) {
  switch (entry.provider) {
    case 'groq':
      return callGroq({ key: entry.key, model: entry.model, system, user });
    case 'gemini':
      return callGemini({ key: entry.key, model: entry.model, system, user });
    case 'mistral':
      return callMistral({ key: entry.key, model: entry.model, system, user });
    case 'cerebras':
      return callCerebras({ key: entry.key, model: entry.model, system, user });
    case 'cohere':
      return callCohere({ key: entry.key, model: entry.model, system, user });
    default:
      throw new Error(`Unknown provider ${entry.provider}`);
  }
}

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and resume optimization specialist.
Analyze how well a CV matches a specific Job Description. The Job Description is the primary source of truth for keywords and requirements.
Also use any company research excerpts provided to infer sector, product, culture, and language — but never invent facts not supported by the JD or research.

Return ONLY valid JSON with this exact shape:
{
  "matchScore": number (0-100),
  "company": {
    "name": string,
    "sector": string,
    "summary": string,
    "needs": string[]
  },
  "keywords": {
    "requiredFromJd": string[],
    "presentInCv": string[],
    "missingFromCv": string[],
    "suggestedAdditions": string[]
  },
  "atsChecks": {
    "strengths": string[],
    "risks": string[]
  },
  "advice": string[],
  "priorityFixes": string[]
}

Rules:
- Focus on exact and close-variant keywords from the JD (tools, skills, methodologies, certifications, domain terms).
- Be specific and actionable. Prefer short bullet-like strings.
- Write advice in the same language as the Job Description when possible; otherwise Spanish or English is fine.
- Do not include markdown outside JSON.`;

/**
 * Tries each provider/key in order until one succeeds.
 */
export async function completeJsonWithFailover(userPrompt) {
  const queue = buildProviderQueue();
  if (!queue.length) {
    throw new Error('No AI API keys configured in server/.env');
  }

  const errors = [];
  for (const entry of queue) {
    try {
      const content = await callProvider(entry, SYSTEM_PROMPT, userPrompt);
      const parsed = extractJson(content);
      return {
        analysis: parsed,
        used: { provider: entry.provider, model: entry.model, keyLabel: entry.label },
        attempts: errors,
      };
    } catch (err) {
      const message = err?.message || String(err);
      console.warn(`[AI] ${entry.label} (${entry.provider}/${entry.model}) failed:`, message);
      errors.push({ provider: entry.provider, keyLabel: entry.label, message });
    }
  }

  const detail = errors.map((e) => `${e.keyLabel}: ${e.message}`).join(' | ');
  throw new Error(`All AI providers failed. ${detail}`);
}
